require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // This requires GOOGLE_APPLICATION_CREDENTIALS, wait.
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}

// Wait, firebase-admin requires a service account. I don't have it.
// I can just fetch it from the browser!
