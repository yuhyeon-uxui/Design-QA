const fs = require('fs');
const file = 'src/app/project/[id]/screen/[screenId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update useAuthStore extraction to include `user`
content = content.replace(
  '  const { isMaster } = useAuthStore();',
  '  const { isMaster, user } = useAuthStore();'
);

// 2. Add Developer Feedback Save Button
content = content.replace(
  '<Label className="text-sm font-bold text-slate-800">개발자 피드백</Label>\n                    <Select value={localForm.devFeedback || "대기중"} onValueChange={(val) => setLocalForm({...localForm, devFeedback: val as string})}>\n                      <SelectTrigger className="h-10 text-sm bg-blue-50/40 border-blue-200 font-medium text-slate-800">\n                        <SelectValue placeholder="피드백 선택" />\n                      </SelectTrigger>\n                      <SelectContent>\n                        <SelectItem value="대기중">대기중</SelectItem>\n                        <SelectItem value="수정완료 (확인요청)">수정완료 (확인요청)</SelectItem>\n                        <SelectItem value="이슈 아님 (정상작동)">이슈 아님 (정상작동)</SelectItem>\n                        <SelectItem value="디자인/기획 검토필요">디자인/기획 검토필요</SelectItem>\n                        <SelectItem value="기술적 구현불가">기술적 구현불가</SelectItem>\n                      </SelectContent>\n                    </Select>',
  `<Label className="text-sm font-bold text-slate-800">개발자 피드백</Label>
                    <div className="flex gap-2">
                      <Select value={localForm.devFeedback || "대기중"} onValueChange={(val) => setLocalForm({...localForm, devFeedback: val as string})}>
                        <SelectTrigger className="h-10 flex-1 text-sm bg-blue-50/40 border-blue-200 font-medium text-slate-800">
                          <SelectValue placeholder="피드백 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="대기중">대기중</SelectItem>
                          <SelectItem value="수정완료 (확인요청)">수정완료 (확인요청)</SelectItem>
                          <SelectItem value="이슈 아님 (정상작동)">이슈 아님 (정상작동)</SelectItem>
                          <SelectItem value="디자인/기획 검토필요">디자인/기획 검토필요</SelectItem>
                          <SelectItem value="기술적 구현불가">기술적 구현불가</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleSavePinDetails} className="h-10 bg-[#0064fa] text-white shrink-0 px-4">저장</Button>
                    </div>`
);

// 3. Update handleAddComment to use user.user_metadata
content = content.replace(
  `  const handleAddComment = () => {
    if (!activePinId || !newComment.trim()) return;
    
    const currentUser = PRESET_MEMBERS.find(m => m.id === currentMemberId);
    if (!currentUser) {
      alert("작성자를 먼저 검색하고 선택해주세요.");
      return;
    }

    setPins(pins.map(p => {
      if (p.id === activePinId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now(),
            author: currentUser.name,
            role: currentUser.role,
            text: newComment,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return p;
    }));
    setNewComment("");
  };`,
  `  const handleAddComment = () => {
    if (!activePinId || !newComment.trim() || !user) return;
    
    setPins(pins.map(p => {
      if (p.id === activePinId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now(),
            author: user.user_metadata?.full_name || "알 수 없음",
            role: user.user_metadata?.team ? \`\${user.user_metadata.team} \${user.user_metadata.position || ""}\` : "사용자",
            text: newComment,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return p;
    }));
    setNewComment("");
  };`
);

// 4. Hide "작성자 검색" input and wrap comment input in {user ? (...) : (...)}
// First we find the entire comment input block.
const searchStr = `<div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-[#0064fa]/30 overflow-visible h-10 px-1 gap-1 relative shadow-sm transition-all">
                      <div className="relative w-[100px] shrink-0 h-full flex items-center">
                        <Input 
                          placeholder="작성자 검색" 
                          className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-2 h-full text-xs font-bold text-[#0064fa] w-full placeholder:font-normal placeholder:text-slate-400" 
                          value={authorSearch}
                          onChange={(e) => {
                            setAuthorSearch(e.target.value);
                            setIsAuthorDropdownOpen(true);
                          }}
                          onFocus={() => setIsAuthorDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsAuthorDropdownOpen(false), 200)}
                        />
                        
                        {isAuthorDropdownOpen && filteredMembers.length > 0 && (
                          <div className="absolute bottom-full left-0 mb-1 w-[180px] bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-50 max-h-[220px] overflow-y-auto animate-in fade-in zoom-in-95">
                            {filteredMembers.map(m => (
                              <button
                                key={m.id}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                                onClick={() => {
                                  setCurrentMemberId(m.id);
                                  setAuthorSearch(m.name);
                                  setIsAuthorDropdownOpen(false);
                                }}
                              >
                                <span className="font-bold text-slate-800">
                                  {m.name.split(new RegExp(\`(\${authorSearch})\`, 'gi')).map((part, i) => 
                                    part.toLowerCase() === authorSearch.toLowerCase() ? <span key={i} className="text-red-500">{part}</span> : part
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400">{m.role}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-[1px] h-4 bg-slate-300 shrink-0" />`;

const replaceStr = `{user ? (
                    <div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-[#0064fa]/30 overflow-visible h-10 px-1 gap-1 relative shadow-sm transition-all">`;

content = content.replace(searchStr, replaceStr);

// Close the user block
const endSearchStr = `                      <Button size="icon" className="h-8 w-8 bg-[#0064fa] hover:bg-[#0064fa]/90 shrink-0 shadow-sm rounded-md mr-0.5" onClick={handleAddComment}>
                        <Send className="w-4 h-4 text-white ml-0.5" />
                      </Button>
                    </div>`;

const endReplaceStr = `                      <Button size="icon" className="h-8 w-8 bg-[#0064fa] hover:bg-[#0064fa]/90 shrink-0 shadow-sm rounded-md mr-0.5" onClick={handleAddComment}>
                        <Send className="w-4 h-4 text-white ml-0.5" />
                      </Button>
                    </div>
                    ) : (
                      <div className="w-full text-center p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 mt-2">
                        댓글을 달려면 <Link href="/login" className="text-[#0064fa] font-bold hover:underline">로그인</Link> 해주세요.
                      </div>
                    )}`;

content = content.replace(endSearchStr, endReplaceStr);

fs.writeFileSync(file, content);
console.log("Comments patched successfully");
