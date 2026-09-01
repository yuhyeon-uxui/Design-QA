const fs = require('fs');
let c = fs.readFileSync('src/app/actions/savePin.ts', 'utf8');
c = c.replace(/import \{ getApps \} from "firebase-admin\/app";/, 'import { getApps, initializeApp, cert } from "firebase-admin/app";\nimport { getFirestore, FieldValue } from "firebase-admin/firestore";');
c = c.replace(/admin\.initializeApp/g, 'initializeApp');
c = c.replace(/admin\.credential\.cert/g, 'cert');
c = c.replace(/admin\.firestore\(\)/g, 'getFirestore()');
c = c.replace(/admin\.firestore\.FieldValue\.serverTimestamp\(\)/g, 'FieldValue.serverTimestamp()');
fs.writeFileSync('src/app/actions/savePin.ts', c);
