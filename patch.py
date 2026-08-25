import re

file_path = 'src/app/project/[id]/screen/[screenId]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update useAuthStore extraction
content = re.sub(
    r'const searchParams = useSearchParams\(\);\n\s*const \[projectTitle',
    r'const searchParams = useSearchParams();\n  const { isMaster, user } = useAuthStore();\n  const [projectTitle',
    content
)

# 2. Hide Add Screen
content = re.sub(
    r'(<Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-\[#0064fa\] hover:bg-slate-200" onClick=\{\(\) => \{\n\s*const newId = `s\$\{Date\.now\(\)\}`;)',
    r'{isMaster && (\1',
    content
)
content = re.sub(
    r'(setActiveScreenId\(newId\);\n\s*\}\}>\n\s*<span className="text-lg leading-none">\+</span>\n\s*</Button>)',
    r'\1\n            )}',
    content
)

# 3. Hide Delete Screen
content = re.sub(
    r'(\{screens\.length > 1 && \(\n\s*<Button)',
    r'{screens.length > 1 && isMaster && (\n                    <Button',
    content
)

# 4. Hide Delete Pin
content = re.sub(
    r'(\{activePinId && \(\n\s*<Button variant="ghost" size="sm" onClick=\{handleDeletePin\})',
    r'{activePinId && isMaster && (\n                <Button variant="ghost" size="sm" onClick={handleDeletePin}',
    content
)

# 5. Hide Delete Project
content = re.sub(
    r'(<Button \n\s*variant="ghost" \n\s*onClick=\{\(\) => \{\n\s*setIsProjectSettingsOpen\(false\);\n\s*setTimeout\(\(\) => setIsProjectDeleteAlertOpen\(true\), 150\);\n\s*\}\} \n\s*className="h-12 px-4 font-bold text-rose-500)',
    r'{isMaster && (\1',
    content
)
content = re.sub(
    r'(프로젝트 삭제\n\s*</Button>)\n\s*<div className="flex gap-3">',
    r'\1\n              )}\n              <div className="flex gap-3">',
    content
)

# 6. Developer Feedback Save Button
content = re.sub(
    r'(<Select value=\{localForm\.devFeedback \|\| "대기중"\} onValueChange=\{\(val\) => setLocalForm\(\{.*?\}\)\}>\n\s*<SelectTrigger className="h-10 text-sm bg-blue-50/40 border-blue-200 font-medium text-slate-800">)',
    r'<div className="flex gap-2">\n                      <Select value={localForm.devFeedback || "대기중"} onValueChange={(val) => setLocalForm({...localForm, devFeedback: val as string})}>\n                        <SelectTrigger className="flex-1 h-10 text-sm bg-blue-50/40 border-blue-200 font-medium text-slate-800">',
    content
)
content = re.sub(
    r'(<SelectItem value="기술적 구현불가">기술적 구현불가</SelectItem>\n\s*</SelectContent>\n\s*</Select>)',
    r'\1\n                      <Button onClick={handleSavePinDetails} className="h-10 px-4 bg-[#0064fa] hover:bg-[#0064fa]/90 text-white font-bold shrink-0">저장</Button>\n                    </div>',
    content
)

# 7. Update handleAddComment to use user.user_metadata
content = re.sub(
    r'const handleAddComment = \(\) => \{\n\s*if \(\!activePinId \|\| \!newComment\.trim\(\)\) return;\n\s*const currentUser = PRESET_MEMBERS.*?return;\n\s*\}',
    r'const handleAddComment = () => {\n    if (!activePinId || !newComment.trim() || !user) return;',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'author: currentUser\.name,\n\s*role: currentUser\.role,',
    r'author: user.user_metadata?.full_name || "알 수 없음",\n            role: user.user_metadata?.team ? `${user.user_metadata.team} ${user.user_metadata.position || ""}` : "사용자",',
    content
)

# 8. Hide Author Search input and replace with user check
content = re.sub(
    r'<div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-\[#0064fa\]/30 overflow-visible h-10 px-1 gap-1 relative shadow-sm transition-all">\n\s*<div className="relative w-\[100px\] shrink-0 h-full flex items-center">.*?<div className="w-\[1px\] h-4 bg-slate-300 shrink-0" />',
    r'{user ? (\n                    <div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-[#0064fa]/30 overflow-visible h-10 px-1 gap-1 relative shadow-sm transition-all">',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'(<Button size="icon" className="h-8 w-8 bg-\[#0064fa\] hover:bg-\[#0064fa\]/90 shrink-0 shadow-sm rounded-md mr-0\.5" onClick=\{handleAddComment\}>\n\s*<Send className="w-4 h-4 text-white ml-0\.5" />\n\s*</Button>\n\s*</div>)',
    r'\1\n                    ) : (\n                      <div className="w-full text-center p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 mt-2">\n                        댓글을 달려면 <Link href="/login" className="text-[#0064fa] font-bold hover:underline">로그인</Link> 해주세요.\n                      </div>\n                    )}',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python patch applied!")
