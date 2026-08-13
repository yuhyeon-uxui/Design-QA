require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadString, getDownloadURL } = require('firebase/storage');

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
const storage = getStorage(app);

async function testUploadSDK() {
  try {
    const storageRef = ref(storage, 'test_sdk.jpg');
    const base64Data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    
    console.log("Uploading via SDK...");
    await uploadString(storageRef, base64Data, 'data_url');
    console.log("Uploaded successfully!");
    const url = await getDownloadURL(storageRef);
    console.log("URL:", url);
  } catch (error) {
    console.error("SDK Upload error:", error);
  }
}

testUploadSDK();
