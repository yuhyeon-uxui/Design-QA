const fs = require('fs');
let c = fs.readFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', 'utf8');
c = c.replace(/actorUid: user\.id \|\| user\.uid \|\| "unknown"/g, 'actorUid: user.id || "unknown"');
fs.writeFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', c);
