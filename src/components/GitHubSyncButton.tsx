"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function GitHubSyncButton({ pin, screenName }: { pin: any, screenName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedRepo = localStorage.getItem("github_repo") || "";
    const savedToken = localStorage.getItem("github_token") || "";
    setRepo(savedRepo);
    setToken(savedToken);
  }, []);

  const handleSync = async () => {
    if (!repo || !token) {
      setIsOpen(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const issueBody = `
**화면**: ${screenName}
**담당자**: ${pin.assignee || '미지정'}
**우선순위**: ${pin.priority || 'Medium'}
**타입**: ${pin.issueType || 'UI/UX'}
**진행상태**: ${pin.status || '이슈발생'}

**📝 이슈 설명**:
${pin.description || '설명 없음'}

**💻 개발자 피드백**:
${pin.devFeedback || '대기중'}
      `;

      const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `[디자인 QA] ${pin.issueType || '이슈'} - ${screenName}`,
          body: issueBody,
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      toast.success(
        <div className="flex flex-col gap-1">
          <span>GitHub 이슈가 생성되었습니다!</span>
          <a href={data.html_url} target="_blank" rel="noreferrer" className="text-blue-500 underline text-xs">보러가기</a>
        </div>
      );
      setIsOpen(false);
    } catch (e: any) {
      toast.error(`GitHub 연동 실패: 확인해주세요.`);
      console.error(e);
      setIsOpen(true); // Open settings to fix it
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem("github_repo", repo);
    localStorage.setItem("github_token", token);
    toast.success("GitHub 설정이 저장되었습니다.");
    handleSync();
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full h-8 text-xs font-medium text-slate-600 bg-transparent border-slate-200 hover:bg-slate-50 hover:text-slate-900 border-dashed justify-center flex items-center gap-1.5 transition-colors"
        onClick={handleSync}
        disabled={isLoading}
      >
        <Send className="w-3.5 h-3.5" />
        {isLoading ? "동기화 중..." : "GitHub 이슈로 등록"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Send className="w-5 h-5"/> GitHub 연동 설정</h3>
            <p className="text-xs text-slate-500">이슈를 자동 등록하기 위해 저장소 이름과 발급받은 Personal Access Token을 입력해주세요. (정보는 브라우저에만 안전하게 저장됩니다)</p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">저장소 (Owner/Repo)</label>
              <Input placeholder="예: yuhyeon-uxui/Design-QA" value={repo} onChange={e => setRepo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Personal Access Token (클래식)</label>
              <Input type="password" placeholder="ghp_..." value={token} onChange={e => setToken(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>취소</Button>
              <Button className="flex-1 bg-[#24292F] text-white hover:bg-[#24292F]/90" onClick={saveSettings}>저장 후 등록</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
