const fs = require('fs');

// 1. permissions.ts (done previously but I will update it just in case)
const permissionsTs = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wrhkqffxjokowabmhija.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaGtxZmZ4am9rb3dhYm1oaWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MTg0NzMsImV4cCI6MjEwMzE5NDQ3M30.I-Sr3i95DgUsRF7zI5-TQ1zLT8oHbQhAYDGdnbz3BpU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Role = 'admin' | 'designer' | 'developer' | 'general';

export type ActionType = 
  | 'project.create' | 'project.delete'
  | 'issue.create' | 'issue.save' | 'issue.delete'
  | 'issue.statusChange'
  | 'devFeedback.create'
  | 'comment.create'
  | 'memberRole.manage';

const ROLE_PERMISSIONS: Record<ActionType, Role[]> = {
  'project.create': ['admin', 'designer'],
  'project.delete': ['admin', 'designer'],
  'issue.create': ['admin', 'designer'],
  'issue.save': ['admin', 'designer'],
  'issue.delete': ['admin', 'designer'],
  'issue.statusChange': ['admin', 'designer', 'developer'],
  'devFeedback.create': ['admin', 'developer'],
  'comment.create': ['admin', 'designer', 'developer', 'general'],
  'memberRole.manage': ['admin'],
};

export async function assertPermission(token: string | undefined, action: ActionType): Promise<{ userId: string; role: Role }> {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  // Verify token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Invalid or expired token');
  }

  // Assume user metadata or profiles table contains the role
  // We'll query 'profiles' as requested
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role: Role = (profile?.role as Role) || 'general';

  const allowedRoles = ROLE_PERMISSIONS[action];
  if (!allowedRoles.includes(role)) {
    throw new Error(\`Permission denied. User role '\${role}' is not allowed to perform '\${action}'\`);
  }

  return { userId: user.id, role };
}
`;
fs.writeFileSync('src/lib/permissions.ts', permissionsTs);

// 2. firestore.rules
const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // All direct client writes are forbidden
    // Must go through Next.js API Routes / Server Actions
    match /{document=**} {
      allow read: if true; // Restrict later if needed
      allow write: if false; 
    }
  }
}
`;
fs.writeFileSync('firestore.rules', rules);

// 3. savePin.ts
let savePinTs = fs.readFileSync('src/app/actions/savePin.ts', 'utf8');
savePinTs = savePinTs.replace(/token: string, \/\/ Supabase session token/g, 'token: string,');
savePinTs = savePinTs.replace(/token: string,/g, 'token: string,'); // just ensure it's there
fs.writeFileSync('src/app/actions/savePin.ts', savePinTs);


// 4. page.tsx
let page = fs.readFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', 'utf8');

if (!page.includes('import { supabase } from "@/lib/supabase"')) {
  page = page.replace('import { db, storage } from "@/lib/firebase";', 'import { db, storage } from "@/lib/firebase";\nimport { supabase } from "@/lib/supabase";');
}

// Make commitStatusChange pass the token
const oldCall = `userUid: user.id || "unknown"`;
const newCall = `token: (await supabase.auth.getSession()).data.session?.access_token || ""`;
page = page.replace(oldCall, newCall);

// Remove the `updateActiveDeviceState({ pins: newPins })` call
page = page.replace('updateActiveDeviceState({ pins: newPins });', '');

// I need to ensure <Dialog> exists!
// Wait, the user said it was missing. Let's explicitly inject the Dialog JSX right before the last `</div>`.
const dialogJsx = `
      {/* 재오픈 사유 모달 */}
      <Dialog open={reopenModalOpen} onOpenChange={setReopenModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>이슈 재오픈 (Re-open)</DialogTitle>
            <DialogDescription>
              완료된 이슈를 다시 엽니다. 담당자가 참고할 수 있도록 명확한 재오픈 사유를 입력해 주세요. (5자 이상)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <textarea 
              placeholder="예: 모바일에서는 수정되었으나 태블릿에서 깨집니다."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="min-h-[100px] flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0064fa] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReopenModalOpen(false)} disabled={isSavingStatus}>
              취소
            </Button>
            <Button 
              onClick={() => {
                if (reopenReason.trim().length < 5) {
                  toast.error("재오픈 사유를 5자 이상 입력해주세요.");
                  return;
                }
                if (pendingStatusChange) {
                  commitStatusChange(pendingStatusChange.pinId, pendingStatusChange.fromStatus, pendingStatusChange.toStatus, reopenReason.trim(), pendingStatusChange.idempKey);
                }
              }} 
              disabled={isSavingStatus || reopenReason.trim().length < 5}
            >
              {isSavingStatus ? "저장 중..." : "확인 및 상태 변경"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
`;

if (!page.includes('이슈 재오픈 (Re-open)')) {
  // Try to find the exact injection point.
  // The file usually ends with:
  // variant="2-button"
  //       />
  //     </div>
  //   );
  // }
  
  page = page.replace('variant="2-button"\n      />\n    </div>', 'variant="2-button"\n      />\n' + dialogJsx + '\n    </div>');
  
  // Also check if Dialog is imported
  if (!page.includes('import { Dialog,')) {
    page = page.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";');
  }
}

fs.writeFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', page);

console.log("Refactoring script completed.");
