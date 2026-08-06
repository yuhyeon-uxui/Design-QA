import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function test() {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    console.log("Success! Found", querySnapshot.size, "projects.");
  } catch (error) {
    console.error("Error fetching projects:", error.message);
  }
}

test();
