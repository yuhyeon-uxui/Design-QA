import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADiEg04u6_3QpklZyAB3DjolUy2Bf-Zxc",
  authDomain: "design-qa-board.firebaseapp.com",
  projectId: "design-qa-board",
  storageBucket: "design-qa-board.firebasestorage.app",
  messagingSenderId: "213078166814",
  appId: "1:213078166814:web:6db72a297fda2ba9558d0f",
  measurementId: "G-JG0NV2LLKS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function deduplicatePins(pins) {
  if (!pins || !Array.isArray(pins)) return [];
  const unique = [];
  const seen = new Set();
  
  // Sort descending by ID to keep the latest ones if needed, or just iterate
  // Let's sort descending so we keep the newest pin
  const sorted = [...pins].sort((a, b) => b.id - a.id);
  
  for (const pin of sorted) {
    const key = `${pin.x},${pin.y}`;
    if (!seen.has(key)) {
      unique.push(pin);
      seen.add(key);
    }
  }
  
  // Restore original order (ascending by ID)
  return unique.sort((a, b) => a.id - b.id);
}

async function cleanUp() {
  try {
    const projectsSnap = await getDocs(collection(db, "projects"));
    for (const pDoc of projectsSnap.docs) {
      const projectId = pDoc.id;
      const screensSnap = await getDocs(collection(db, "project_screens", projectId, "screens"));
      
      for (const sDoc of screensSnap.docs) {
        const screen = sDoc.data();
        let changed = false;
        
        if (screen.PC && screen.PC.pins) {
          const origLen = screen.PC.pins.length;
          const deduped = deduplicatePins(screen.PC.pins);
          if (deduped.length !== origLen) {
            screen.PC.pins = deduped;
            changed = true;
          }
        }
        if (screen.Mobile && screen.Mobile.pins) {
          const origLen = screen.Mobile.pins.length;
          const deduped = deduplicatePins(screen.Mobile.pins);
          if (deduped.length !== origLen) {
            screen.Mobile.pins = deduped;
            changed = true;
          }
        }
        
        if (changed) {
          console.log(`Updating screen ${sDoc.id} in project ${projectId}`);
          await setDoc(doc(db, "project_screens", projectId, "screens", sDoc.id), screen, { merge: true });
        }
      }
    }
    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error:", error);
  }
}

cleanUp();
