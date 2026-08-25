const fs = require('fs');
const file = 'src/app/project/[id]/screen/[screenId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import useAuthStore
content = content.replace(
  'export default function ScreenQA() {',
  'import { useAuthStore } from "@/store/useAuthStore";\n\nexport default function ScreenQA() {'
);

// 2. Extract isMaster
content = content.replace(
  '  const searchParams = useSearchParams();\n  const [projectTitle, setProjectTitle] = useState("");',
  '  const searchParams = useSearchParams();\n  const { isMaster } = useAuthStore();\n  const [projectTitle, setProjectTitle] = useState("");'
);

// 3. Hide Add Screen
content = content.replace(
  '<Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-[#0064fa] hover:bg-slate-200" onClick={() => {\n              const newId = `s${Date.now()}`;',
  '{isMaster && (\n            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-[#0064fa] hover:bg-slate-200" onClick={() => {\n              const newId = `s${Date.now()}`;'
);
content = content.replace(
  '              setActiveScreenId(newId);\n            }}>\n              <span className="text-lg leading-none">+</span>\n            </Button>\n          </div>',
  '              setActiveScreenId(newId);\n            }}>\n              <span className="text-lg leading-none">+</span>\n            </Button>\n            )}\n          </div>'
);

// 4. Hide Delete Screen
content = content.replace(
  '                  </button>\n                  {screens.length > 1 && (\n                    <Button',
  '                  </button>\n                  {screens.length > 1 && isMaster && (\n                    <Button'
);

// 5. Hide Delete Pin
content = content.replace(
  '              {activePinId && (\n                <Button variant="ghost" size="sm" onClick={handleDeletePin}',
  '              {activePinId && isMaster && (\n                <Button variant="ghost" size="sm" onClick={handleDeletePin}'
);

// 6. Hide Delete Project
content = content.replace(
  '            <div className="flex justify-between w-full">\n              <Button \n                variant="ghost" \n                onClick={() => {\n                  setIsProjectSettingsOpen(false);\n                  setTimeout(() => setIsProjectDeleteAlertOpen(true), 150);\n                }} \n                className="h-12 px-4 font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"\n              >\n                <Trash2 className="w-4 h-4 mr-2" />\n                프로젝트 삭제\n              </Button>\n              <div className="flex gap-3">',
  '            <div className="flex justify-between w-full">\n              {isMaster ? (<Button \n                variant="ghost" \n                onClick={() => {\n                  setIsProjectSettingsOpen(false);\n                  setTimeout(() => setIsProjectDeleteAlertOpen(true), 150);\n                }} \n                className="h-12 px-4 font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"\n              >\n                <Trash2 className="w-4 h-4 mr-2" />\n                프로젝트 삭제\n              </Button>) : <div></div>}\n              <div className="flex gap-3">'
);

fs.writeFileSync(file, content);
console.log("Patched successfully");
