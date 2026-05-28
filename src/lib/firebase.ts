import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyADiEg04u6_3QpklZyAB3DjolUy2Bf-Zxc",
  authDomain: "design-qa-board.firebaseapp.com",
  projectId: "design-qa-board",
  storageBucket: "design-qa-board.firebasestorage.app",
  messagingSenderId: "213078166814",
  appId: "1:213078166814:web:6db72a297fda2ba9558d0f",
  measurementId: "G-JG0NV2LLKS"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
