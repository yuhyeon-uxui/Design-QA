const fs = require('fs');

let c = fs.readFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', 'utf8');

// 1. Add import for Server Action at the top
if (!c.includes('import { commitStatusChangeAction }')) {
  c = c.replace('import { db, storage } from "@/lib/firebase";', 'import { db, storage } from "@/lib/firebase";\nimport { commitStatusChangeAction } from "@/app/actions/savePin";');
}

// 2. Replace commitStatusChange implementation
const oldCommitStart = 'const commitStatusChange = async (pinId: number, fromStatus: string, toStatus: string, reason: string, idempKey: string) => {';
const oldCommitEnd = '};\n\n  const handleSavePinDetails = () => {';

const idxStart = c.indexOf(oldCommitStart);
const idxEnd = c.indexOf(oldCommitEnd) + 2;

if (idxStart !== -1 && idxEnd !== -1) {
  const newCommit = `const commitStatusChange = async (pinId: number, fromStatus: string, toStatus: string, reason: string, idempKey: string) => {
    if (!user || !params.id) return;
    setIsSavingStatus(true);
    
    try {
      const res = await commitStatusChangeAction({
        pinId,
        projectId: params.id as string,
        screenId: activeScreenId,
        device,
        isAppProject,
        fromStatus,
        toStatus,
        reason,
        idempKey,
        userUid: user.id || "unknown"
      });
      
      if (!res.success) throw new Error(res.error);
      
      // Update local state ONLY (no side effects)
      const targetPin = pins.find(p => p.id === pinId);
      if (targetPin) {
        const newPin = { ...targetPin, status: toStatus };
        const newPins = pins.map(p => p.id === pinId ? newPin : p);
        
        // This setScreens will update the UI immediately
        setScreens(prev => prev.map(s => {
          if (s.id === activeScreenId) {
            const updatedDeviceState = { ...s[device], pins: newPins };
            return { ...s, [device]: updatedDeviceState };
          }
          return s;
        }));
        setLocalForm(prev => ({ ...prev, status: toStatus }));
        toast.success(res.message || "상태가 변경되었습니다.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSavingStatus(false);
      setReopenModalOpen(false);
      setPendingStatusChange(null);
    }
  };`;
  
  c = c.substring(0, idxStart) + newCommit + c.substring(idxEnd);
}

// 3. Fix handleSavePinDetails and autosave
const saveFuncIdx = c.indexOf('const handleSavePinDetails = () => {');
if (saveFuncIdx !== -1) {
  // Find where it sets pins: `setPins(pins.map(p => p.id === pinId ? { ...p, ...formState } : p), eventLogData);`
  // Actually, we replaced it last time with `executeSavePin`. Let's just fix `executeSavePin`.
  c = c.replace(
    'setPins(pins.map(p => p.id === pinId ? { ...p, ...formState } : p), eventLogData);',
    'const { status, ...restForm } = formState;\n    setPins(pins.map(p => p.id === pinId ? { ...p, ...restForm } : p), eventLogData);'
  );
}

// 4. Fix autosave useEffect
c = c.replace(
  'setPins(prev => prev.map(p => p.id === activePinId ? { ...p, ...localForm } : p));',
  'setPins(prev => prev.map(p => p.id === activePinId ? { ...p, ...(({ status, ...rest }) => rest)(localForm) } : p));'
);

// 5. Remove updateActiveDeviceState from commitStatusChange (wait, I already did that by replacing the whole function above)

// 6. Fix setPins / updateActiveDeviceState signature (remove eventLogData since we use server action now)
c = c.replace(/, eventLogData\?\: any/g, '');
c = c.replace(/, eventLogData\)/g, ')');
c = c.replace(/if \(eventLogData && user\) \{[\s\S]*?schemaVersion: "v1"[\s\S]*?\}\n\n        batch\.commit/g, 'batch.commit');

fs.writeFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', c);
