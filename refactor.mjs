import fs from 'fs';

let content = fs.readFileSync('temp_page.tsx', 'utf8');

// 1. Add new state variables for Reopen Modal
const stateHooksInjection = `
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [isSavingReopen, setIsSavingReopen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ pinId: number, fromStatus: string, toStatus: string, formState: any } | null>(null);
`;
content = content.replace('const [activePinId, setActivePinId] = useState<number | null>(null);', 'const [activePinId, setActivePinId] = useState<number | null>(null);' + stateHooksInjection);

// 2. Modify updateActiveDeviceState to accept eventLogData and use writeBatch
const updateFuncRegex = /const updateActiveDeviceState = \(updates: Partial<ScreenDeviceState>\) => {([\s\S]*?)return nextScreens;\n    }\);\n  };/;

const newUpdateFunc = `const updateActiveDeviceState = (updates: Partial<ScreenDeviceState>, eventLogData?: any) => {
    setScreens(prev => {
      const nextScreens = prev.map(s => {
        if (s.id === activeScreenId) {
          const updatedDeviceState = { ...s[device], ...updates };
          return { ...s, [device]: updatedDeviceState };
        }
        return s;
      });

      if (params.id) {
        const batch = writeBatch(db);
        let activeScreenToSave = null;
        
        let totalIssues = 0;
        let totalCompleted = 0;
        let completedScreensCount = 0;

        nextScreens.forEach(screen => {
          const allPins = isAppProject ? [...(screen.PC?.pins || [])] : [...(screen.PC?.pins || []), ...(screen.Mobile?.pins || [])];
          let currentIssueCount = -1;
          if (allPins.length > 0) {
            currentIssueCount = allPins.filter(p => p.status !== "완료됨" && p.status !== "특이사항 없음").length;
          }
          
          if (screen.id === activeScreenId) {
             screen.issueCount = currentIssueCount;
             activeScreenToSave = screen;
          }
          
          if (currentIssueCount === 0) completedScreensCount++;
          totalIssues += allPins.length;
          totalCompleted += allPins.filter(p => (p.status === "완료됨" || p.status === "특이사항 없음")).length;
        });

        if (activeScreenToSave) {
          const cleanScreen = JSON.parse(JSON.stringify(activeScreenToSave));
          batch.set(doc(db, "project_screens", params.id as string, "screens", activeScreenToSave.id), cleanScreen, { merge: true });
        }

        const cleanProjectData = {
          screensCount: nextScreens.length,
          completedScreensCount: completedScreensCount,
          issuesCount: totalIssues,
          completedCount: totalCompleted,
        };
        batch.set(doc(db, "projects", params.id as string), cleanProjectData, { merge: true });

        if (eventLogData && user) {
          const eventId = eventLogData.eventId || Date.now().toString() + Math.random().toString(36).substring(7);
          batch.set(doc(collection(db, "issue_events"), eventId), {
            eventId,
            issueId: eventLogData.pinId.toString(),
            projectId: params.id as string,
            screenId: activeScreenId,
            eventType: "STATUS_CHANGE",
            fromStatus: eventLogData.fromStatus,
            toStatus: eventLogData.toStatus,
            reason: eventLogData.reason || "",
            actorUid: user.id || user.uid || "unknown",
            changedAt: new Date().toISOString(),
            schemaVersion: "v1"
          });
        }

        batch.commit().catch(console.error);
      }
      
      return nextScreens;
    });
  };`;

content = content.replace(updateFuncRegex, newUpdateFunc);

// 3. Modify setPins to accept eventLogData
content = content.replace(
  'const setPins = (newPins: Pin[] | ((prev: Pin[]) => Pin[])) => {',
  'const setPins = (newPins: Pin[] | ((prev: Pin[]) => Pin[]), eventLogData?: any) => {'
);
content = content.replace(
  'pins: typeof newPins === "function" ? newPins(pins) : newPins\n    });',
  'pins: typeof newPins === "function" ? newPins(pins) : newPins\n    }, eventLogData);'
);

// 4. Modify handleSavePinDetails
const saveFuncRegex = /const handleSavePinDetails = \(\) => {[\s\S]*?toast\.success\("내용 저장완료!", { id: "save-success" }\);\n  };/;

const newSaveFunc = `const handleSavePinDetails = () => {
    if (!activePinId) return;

    if (localForm.status !== "특이사항 없음" && !localForm.description?.trim()) {
      toast.error("문제점 설명을 입력해주세요.", { id: "save-error" });
      return;
    }

    const currentPin = pins.find(p => p.id === activePinId);
    if (!currentPin) return;

    const fromStatus = currentPin.status || "이슈발생";
    const toStatus = localForm.status || "이슈발생";
    const statusChanged = fromStatus !== toStatus;
    
    // Check for reopen
    const isReopen = statusChanged && (fromStatus === "수정완료" || fromStatus === "완료됨") && (toStatus === "이슈발생" || toStatus === "확인/검토중" || toStatus === "반려");

    if (isReopen) {
      setPendingStatusChange({ pinId: activePinId, fromStatus, toStatus, formState: localForm });
      setReopenReason("");
      setReopenModalOpen(true);
      return;
    }

    executeSavePin(activePinId, localForm, statusChanged ? {
      pinId: activePinId,
      fromStatus,
      toStatus,
      reason: "일반 상태 변경"
    } : undefined);
  };

  const executeSavePin = (pinId: number, formState: any, eventLogData?: any) => {
    setPins(pins.map(p => p.id === pinId ? { ...p, ...formState } : p), eventLogData);
    toast.success("내용 저장완료!", { id: "save-success" });
  };
  
  const handleReopenSubmit = async () => {
    if (!reopenReason.trim() || reopenReason.trim().length < 5) {
      toast.error("재오픈 사유를 최소 5자 이상 상세히 적어주세요.");
      return;
    }
    if (!pendingStatusChange) return;

    setIsSavingReopen(true);
    
    executeSavePin(pendingStatusChange.pinId, pendingStatusChange.formState, {
      pinId: pendingStatusChange.pinId,
      fromStatus: pendingStatusChange.fromStatus,
      toStatus: pendingStatusChange.toStatus,
      reason: reopenReason.trim()
    });

    setIsSavingReopen(false);
    setReopenModalOpen(false);
    setPendingStatusChange(null);
  };`;

content = content.replace(saveFuncRegex, newSaveFunc);

// 5. Add Reopen Modal to JSX (right before </main>)
const modalJsx = `
      {/* 재오픈 사유 모달 */}
      <Dialog open={reopenModalOpen} onOpenChange={setReopenModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>이슈 재오픈 (Re-open)</DialogTitle>
            <DialogDescription>
              완료된 이슈를 다시 엽니다. 담당자가 참고할 수 있도록 명확한 재오픈 사유를 입력해 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea 
              placeholder="예: 모바일에서는 여백이 수정되었으나, 태블릿 해상도에서는 여전히 여백이 부족합니다."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReopenModalOpen(false)} disabled={isSavingReopen}>
              취소
            </Button>
            <Button onClick={handleReopenSubmit} disabled={isSavingReopen}>
              {isSavingReopen ? "저장 중..." : "확인 및 상태 변경"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
`;
content = content.replace('</main>', modalJsx + '\n      </main>');

// 6. Ensure Dialog/Textarea imports if missing? They are likely imported since it's a rich app.
// If Textarea is missing, we can just use <textarea className="...">
// Let's use native textarea styled like Textarea to avoid import issues if not present.
content = content.replace('<Textarea \n              placeholder=', '<textarea \n              placeholder=');
content = content.replace('className="min-h-[100px]"', 'className="min-h-[100px] flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0064fa] disabled:cursor-not-allowed disabled:opacity-50"');

fs.writeFileSync('temp_page.tsx', content);
console.log('Done!');
