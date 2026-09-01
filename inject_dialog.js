const fs = require('fs');
let c = fs.readFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', 'utf8');

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

// Only inject if it doesn't already exist
if (!c.includes('이슈 재오픈 (Re-open)')) {
  const idx = c.lastIndexOf('</div>\n  );\n}');
  if (idx > -1) {
    c = c.substring(0, idx) + dialogJsx + c.substring(idx);
    fs.writeFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', c);
    console.log('Injected');
  }
}
