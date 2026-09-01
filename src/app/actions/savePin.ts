"use server";

import * as admin from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { assertPermission } from "@/lib/permissions";

if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "design-qa-board",
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL || "ga4-api@ga4-api-506702.iam.gserviceaccount.com",
        privateKey: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
      }),
    });
  } catch (e) {
    console.error("Firebase Admin initialization failed", e);
  }
}

export async function commitStatusChangeAction(payload: {
  pinId: number,
  projectId: string,
  screenId: string,
  device: string,
  isAppProject: boolean,
  fromStatus: string,
  toStatus: string,
  reason: string,
  idempKey: string,
  token: string,
}) {
  const { pinId, projectId, screenId, device, isAppProject, fromStatus, toStatus, reason, idempKey, token } = payload;
  
  try {
    // 1. Authenticate and authorize via Supabase
    const { userId } = await assertPermission(token, 'issue.statusChange');

    const db = getFirestore();
    
    // 2. Check Idempotency Key
    const eventRef = db.collection("issue_events").doc(idempKey);
    const eventDoc = await eventRef.get();
    if (eventDoc.exists) {
      return { success: true, message: "Already processed idempotently" };
    }

    // 3. Execute Firebase Admin Batch Write
    await db.runTransaction(async (t) => {
      const screenRef = db.collection("project_screens").doc(projectId).collection("screens").doc(screenId);
      const projectRef = db.collection("projects").doc(projectId);

      const screenDoc = await t.get(screenRef);
      if (!screenDoc.exists) throw new Error("Screen not found");
      const screenData = screenDoc.data()!;

      // Update Pin Status
      const deviceData = screenData[device] || {};
      const pins = deviceData.pins || [];
      const pinIndex = pins.findIndex((p: any) => p.id === pinId);
      if (pinIndex === -1) throw new Error("Pin not found");
      
      pins[pinIndex].status = toStatus;
      deviceData.pins = pins;
      screenData[device] = deviceData;

      // Recalculate Screen Issue Count
      const allPins = isAppProject ? [...(screenData.PC?.pins || [])] : [...(screenData.PC?.pins || []), ...(screenData.Mobile?.pins || [])];
      let newIssueCount = -1;
      if (allPins.length > 0) {
        newIssueCount = allPins.filter((p: any) => p.status !== "완료됨" && p.status !== "특이사항 없음").length;
      }
      screenData.issueCount = newIssueCount;

      // Recalculate Project Stats
      const allScreensSnapshot = await t.get(db.collection("project_screens").doc(projectId).collection("screens"));
      let totalIssues = 0;
      let totalCompleted = 0;
      let completedScreensCount = 0;
      let screensCount = 0;

      allScreensSnapshot.docs.forEach((doc) => {
        screensCount++;
        const sData = doc.id === screenId ? screenData : doc.data(); 
        
        if (sData.issueCount === 0) completedScreensCount++;
        const sAllPins = isAppProject ? [...(sData.PC?.pins || [])] : [...(sData.PC?.pins || []), ...(sData.Mobile?.pins || [])];
        totalIssues += sAllPins.length;
        totalCompleted += sAllPins.filter((p: any) => p.status === "완료됨" || p.status === "특이사항 없음").length;
      });

      const cleanProjectData = {
        screensCount,
        completedScreensCount,
        issuesCount: totalIssues,
        completedCount: totalCompleted,
      };

      // Commit all writes
      t.set(screenRef, screenData, { merge: true });
      t.set(projectRef, cleanProjectData, { merge: true });
      
      t.set(eventRef, {
        eventId: idempKey,
        issueId: String(pinId),
        projectId,
        screenId,
        eventType: "STATUS_CHANGE",
        fromStatus,
        toStatus,
        reason,
        actorUid: userId,
        changedAt: FieldValue.serverTimestamp(),
        schemaVersion: "v1"
      });
    });

    return { success: true, message: "Status changed successfully" };
  } catch (e: any) {
    console.error("Server Action Error:", e);
    // Return 403-like error to the client
    return { success: false, error: e.message || "Forbidden" };
  }
}
