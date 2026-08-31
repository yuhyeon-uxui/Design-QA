"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function GitHubSyncButton({ pin, screenName }: { pin: any, screenName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [webRepo, setWebRepo] = useState("");
  const [appRepo, setAppRepo] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Backward compatibility: map old 'github_repo' to 'github_web_repo'
    const oldRepo = localStorage.getItem("github_repo") || "";
    const savedWeb = localStorage.getItem("github_web_repo") || oldRepo;
    const savedApp = localStorage.getItem("github_app_repo") || "";
    const savedToken = localStorage.getItem("github_token") || "";
    setWebRepo(savedWeb);
    setAppRepo(savedApp);
    setToken(savedToken);
  }, []);

  const handleSync = async () => {
    // Route based on device type. Default to Web if it's PC or Common, unless Web is empty.
    const targetRepo = pin.device === "Mobile" && appRepo ? appRepo : (webRepo || appRepo);
    
    if (!targetRepo || !token) {
      setIsOpen(true);
      return;
    }
    
    setIsLoading(true);
    try {
      // Strip some HTML tags if they used the rich text editor, or just send as-is (GitHub supports basic HTML)
      const issueBody = `
**화면**: ${screenName} (${pin.device || 'PC/Mobile 공통'})
**담당자**: ${pin.assignee || '미지정'}
**우선순위**: ${pin.priority || 'Medium'}
**타입**: ${pin.issueType || 'UI/UX'}
**진행상태**: ${pin.status || '이슈발생'}

**📝 이슈 설명**:
${pin.description || '설명 없음'}

**💻 개발자 피드백**:
${pin.devFeedback || '대기중'}
      `;

      const res = await fetch(`https://api.github.com/repos/${targetRepo}/issues`, {
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
          <span>GitHub 이슈가 생성되었습니다! ({targetRepo})</span>
          <a href={data.html_url} target="_blank" rel="noreferrer" className="text-blue-500 underline text-xs">보러가기</a>
        </div>
      );
      setIsOpen(false);
    } catch (e: any) {
      toast.error(`GitHub 연동 실패: 저장소 권한을 확인해주세요.`);
      console.error(e);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem("github_web_repo", webRepo);
    localStorage.setItem("github_app_repo", appRepo);
    localStorage.setItem("github_token", token);
    toast.success("GitHub 설정이 저장되었습니다.");
    handleSync();
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="icon"
        className="w-10 h-10 shrink-0 text-slate-500 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
        onClick={handleSync}
        disabled={isLoading}
        title="GitHub 이슈로 자동 라우팅 등록"
      >
        <Send className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Send className="w-5 h-5"/> 멀티 깃허브 연동 설정</h3>
            <p className="text-xs text-slate-500">화면 유형(PC/Mobile)에 따라 이슈가 각각의 저장소로 알아서 라우팅됩니다. (앱 저장소가 없다면 비워두셔도 됩니다)</p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">웹(Web) 저장소 (Owner/Repo)</label>
              <Input placeholder="예: yuhyeon/web-repo" value={webRepo} onChange={e => setWebRepo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                앱(App) 저장소 (Owner/Repo) <span className="text-slate-400 font-normal">선택</span>
              </label>
              <Input placeholder="예: yuhyeon/app-repo" value={appRepo} onChange={e => setAppRepo(e.target.value)} />
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
