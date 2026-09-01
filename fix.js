const fs = require('fs');
let c = fs.readFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', 'utf8');

const rx1 = /const \[reopenModalOpen, setReopenModalOpen\] = useState\(false\);[\s\S]*?const \[pendingStatusChange, setPendingStatusChange\] = useState<{ pinId: number, fromStatus: string, toStatus: string, formState: any } \| null>\(null\);/g;
c = c.replace(rx1, '');

const rx2 = /const \[activePinId, setActivePinId\] = useState<number \| null>\(null\);/g;
c = c.replace(rx2, 'const [activePinId, setActivePinId] = useState<number | null>(null);\nconst [reopenModalOpen, setReopenModalOpen] = useState(false);\nconst [reopenReason, setReopenReason] = useState("");\nconst [isSavingStatus, setIsSavingStatus] = useState(false);\nconst [pendingStatusChange, setPendingStatusChange] = useState<{ pinId: number, fromStatus: string, toStatus: string, idempKey: string } | null>(null);');

fs.writeFileSync('src/app/project/[id]/screen/[screenId]/page.tsx', c);
