import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyADiEg04u6_3QpklZyAB3DjolUy2Bf-Zxc',
  projectId: 'design-qa-board'
});

const db = getFirestore(app);
getDocs(collection(db, 'project_screens/p1787724752638/screens')).then(snap => {
  snap.forEach(doc => console.log(doc.id, JSON.stringify(doc.data())));
  process.exit(0);
}).catch(console.error);
