import fs from 'fs';

let content = fs.readFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', 'utf8');

// 1. Remove status from autosave
const autoSaveRegex = /\(localForm\.status !== undefined && localForm\.status !== \(activePin\.status \|\| "이슈발생"\)\);/g;
if (content.match(autoSaveRegex)) {
  content = content.replace(
    /\|\|\s*\n\s*\(localForm\.status !== undefined && localForm\.status !== \(activePin\.status \|\| "이슈발생"\)\);/,
    ';'
  );
}

// 2. State Hooks
const stateHooksInjection = `
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ pinId: number, fromStatus: string, toStatus: string, idempKey: string } | null>(null);
`;
content = content.replace('const [activePinId, setActivePinId] = useState<number | null>(null);', 'const [activePinId, setActivePinId] = useState<number | null>(null);' + stateHooksInjection);

// 3. Status Handlers
const statusHandlers = `
  const handleStatusChange = (newStatus: string) => {
    if (!activePinId || !activePin || !user) return;
    
    const fromStatus = activePin.status || "이슈발생";
    if (fromStatus === newStatus) return;

    const isReopen = (fromStatus === "수정완료" || fromStatus === "완료됨") && (newStatus === "이슈발생" || newStatus === "확인/검토중" || newStatus === "반려");

    const idempKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(7);

    if (isReopen) {
      setPendingStatusChange({ pinId: activePinId, fromStatus, toStatus: newStatus, idempKey });
      setReopenReason("");
      setReopenModalOpen(true);
    } else {
      commitStatusChange(activePinId, fromStatus, newStatus, "상태 변경", idempKey);
    }
  };

  const commitStatusChange = async (pinId: number, fromStatus: string, toStatus: string, reason: string, idempKey: string) => {
    if (!user || !params.id) return;
    setIsSavingStatus(true);
    
    try {
      const targetPin = pins.find(p => p.id === pinId);
      if (!targetPin) throw new Error("Pin not found");
      
      const newPin = { ...targetPin, status: toStatus };
      const newPins = pins.map(p => p.id === pinId ? newPin : p);
      
      let newIssueCount = 0;
      let targetScreen = screens.find(s => s.id === activeScreenId);
      if (!targetScreen) throw new Error("Screen not found");
      
      const updatedDeviceState = { ...targetScreen[device], pins: newPins };
      const newScreen = { ...targetScreen, [device]: updatedDeviceState };
      
      const allPins = isAppProject ? [...(newScreen.PC?.pins || [])] : [...(newScreen.PC?.pins || []), ...(newScreen.Mobile?.pins || [])];
      newIssueCount = allPins.length > 0 ? allPins.filter(p => p.status !== "완료됨" && p.status !== "특이사항 없음").length : -1;
      newScreen.issueCount = newIssueCount;

      let totalIssues = 0;
      let totalCompleted = 0;
      let completedScreensCount = 0;
      screens.map(s => s.id === activeScreenId ? newScreen : s).forEach(screen => {
        if (screen.issueCount === 0) completedScreensCount++;
        const screenPins = isAppProject ? [...(screen.PC?.pins || [])] : [...(screen.PC?.pins || []), ...(screen.Mobile?.pins || [])];
        totalIssues += screenPins.length;
        totalCompleted += screenPins.filter(p => (p.status === "완료됨" || p.status === "특이사항 없음")).length;
      });

      const cleanProjectData = {
        screensCount: screens.length,
        completedScreensCount: completedScreensCount,
        issuesCount: totalIssues,
        completedCount: totalCompleted,
      };

      const batch = writeBatch(db);
      
      batch.set(doc(db, "project_screens", params.id as string, "screens", newScreen.id), JSON.parse(JSON.stringify(newScreen)), { merge: true });
      batch.set(doc(db, "projects", params.id as string), cleanProjectData, { merge: true });
      
      batch.set(doc(collection(db, "issue_events"), idempKey), {
        eventId: idempKey,
        issueId: pinId.toString(),
        projectId: params.id as string,
        screenId: activeScreenId,
        eventType: "STATUS_CHANGE",
        fromStatus,
        toStatus,
        reason,
        actorUid: user.id || user.uid || "unknown",
        changedAt: new Date().toISOString(),
        schemaVersion: "v1"
      });

      await batch.commit();

      setLocalForm(prev => ({ ...prev, status: toStatus }));
      setScreens(prev => prev.map(s => s.id === activeScreenId ? newScreen : s));
      // update pins locally
      updateActiveDeviceState({ pins: newPins });
      
      toast.success("상태가 변경되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSavingStatus(false);
      setReopenModalOpen(false);
      setPendingStatusChange(null);
    }
  };
`;
// Insert before handleSavePinDetails
content = content.replace('const handleSavePinDetails = () => {', statusHandlers + '\n  const handleSavePinDetails = () => {');

// 4. Update the Select
content = content.replace(
  '<Select disabled={!canManagePins} value={localForm.status || "이슈발생"} onValueChange={(val) => val && setLocalForm({...localForm, status: val})}>',
  '<Select disabled={!canManagePins || isSavingStatus} value={localForm.status || "이슈발생"} onValueChange={(val) => val && handleStatusChange(val)}>'
);

// 5. Add Reopen Modal
const modalJsx = `
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
content = content.replace('variant="2-button"\n      />\n    </div>\n  );\n}', 'variant="2-button"\n      />\n' + modalJsx + '\n    </div>\n  );\n}');

fs.writeFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', content);
console.log('Script ran successfully');
