const fs = require('fs');
const file = 'src/app/project/[id]/screen/[screenId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update useAuthStore extraction
content = content.replace(
  /const searchParams = useSearchParams\(\);\n\s*const \[projectTitle/,
  'const searchParams = useSearchParams();\n  const { isMaster, user } = useAuthStore();\n  const [projectTitle'
);

// 2. Hide Add Screen
content = content.replace(
  /(<Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-\[#0064fa\] hover:bg-slate-200" onClick=\{\(\) => \{\n\s*const newId = `s\$\{Date\.now\(\)\}`;)/,
  '{isMaster && ($1'
);
content = content.replace(
  /(setActiveScreenId\(newId\);\n\s*\}\}>\n\s*<span className="text-lg leading-none">\+<\/span>\n\s*<\/Button>)/,
  '$1\n            )}'
);

// 3. Hide Delete Screen
content = content.replace(
  /(\{screens\.length > 1 && \(\n\s*<Button)/,
  '{screens.length > 1 && isMaster && (\n                    <Button'
);

// 4. Hide Delete Pin
content = content.replace(
  /(\{activePinId && \(\n\s*<Button variant="ghost" size="sm" onClick=\{handleDeletePin\})/,
  '{activePinId && isMaster && (\n                <Button variant="ghost" size="sm" onClick={handleDeletePin}'
);

// 5. Hide Delete Project
content = content.replace(
  /(<Button \n\s*variant="ghost" \n\s*onClick=\{\(\) => \{\n\s*setIsProjectSettingsOpen\(false\);\n\s*setTimeout\(\(\) => setIsProjectDeleteAlertOpen\(true\), 150\);\n\s*\}\} \n\s*className="h-12 px-4 font-bold text-rose-500)/,
  '{isMaster && ($1'
);
content = content.replace(
  /(프로젝트 삭제\n\s*<\/Button>)\n\s*<div className="flex gap-3">/,
  '$1\n              )}\n              <div className="flex gap-3">'
);

// 6. Developer Feedback Save Button
content = content.replace(
  /<Select value=\{localForm\.devFeedback \|\| "대기중"\} onValueChange=\{\(val\) => setLocalForm\(\{.*?\}\)\}>\n\s*<SelectTrigger className="h-10 text-sm bg-blue-50\/40 border-blue-200 font-medium text-slate-800">/,
  '<div className="flex gap-2">\n                      <Select value={localForm.devFeedback || "대기중"} onValueChange={(val) => setLocalForm({...localForm, devFeedback: val as string})}>\n                        <SelectTrigger className="flex-1 h-10 text-sm bg-blue-50/40 border-blue-200 font-medium text-slate-800">'
);
content = content.replace(
  /(<SelectItem value="기술적 구현불가">기술적 구현불가<\/SelectItem>\n\s*<\/SelectContent>\n\s*<\/Select>)/,
  '$1\n                      <Button onClick={handleSavePinDetails} className="h-10 px-4 bg-[#0064fa] hover:bg-[#0064fa]/90 text-white font-bold shrink-0">저장</Button>\n                    </div>'
);

// 7. Update handleAddComment to use user.user_metadata
content = content.replace(
  /const handleAddComment = \(\) => \{\n\s*if \(\!activePinId \|\| \!newComment\.trim\(\)\) return;\n\s*const currentUser = PRESET_MEMBERS[\s\S]*?return;\n\s*\}/,
  'const handleAddComment = () => {\n    if (!activePinId || !newComment.trim() || !user) return;'
);
content = content.replace(
  /author: currentUser\.name,\n\s*role: currentUser\.role,/,
  'author: user.user_metadata?.full_name || "알 수 없음",\n            role: user.user_metadata?.team ? `${user.user_metadata.team} ${user.user_metadata.position || ""}` : "사용자",'
);

// 8. Hide Author Search input and replace with user check
content = content.replace(
  /<div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-\[#0064fa\]\/30 overflow-visible h-10 px-1 gap-1 relative shadow-sm transition-all">\n\s*<div className="relative w-\[100px\] shrink-0 h-full flex items-center">[\s\S]*?<div className="w-\[1px\] h-4 bg-slate-300 shrink-0" \/>/,
  '{user ? (\n                    <div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-[#0064fa]/30 overflow-visible h-10 px-1 gap-1 relative shadow-sm transition-all">'
);
content = content.replace(
  /(<Button size="icon" className="h-8 w-8 bg-\[#0064fa\] hover:bg-\[#0064fa\]\/90 shrink-0 shadow-sm rounded-md mr-0\.5" onClick=\{handleAddComment\}>\n\s*<Send className="w-4 h-4 text-white ml-0\.5" \/>\n\s*<\/Button>\n\s*<\/div>)/,
  '$1\n                    ) : (\n                      <div className="w-full text-center p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 mt-2">\n                        댓글을 달려면 <Link href="/login" className="text-[#0064fa] font-bold hover:underline">로그인</Link> 해주세요.\n                      </div>\n                    )}'
);

fs.writeFileSync(file, content);
console.log("Node regex patch applied!");
