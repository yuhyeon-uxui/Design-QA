const fs = require('fs');
let c = fs.readFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', 'utf8');

c = c.replace(/userUid: user\.id \|\| "unknown"/g, 'token: (await supabase.auth.getSession()).data.session?.access_token || ""');

fs.writeFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', c);
