const fs = require('fs');
let c = fs.readFileSync('src/app/actions/savePin.ts', 'utf8');
c = c.replace(/import \* as admin from "firebase-admin";/g, 'import * as admin from "firebase-admin";\nimport { getApps } from "firebase-admin/app";');
c = c.replace(/if \(!admin\.apps \|\| admin\.apps\.length === 0\) \{/g, 'if (getApps().length === 0) {');
fs.writeFileSync('src/app/actions/savePin.ts', c);
