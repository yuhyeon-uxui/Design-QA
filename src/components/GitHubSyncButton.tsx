"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function GitHubSyncButton({ pin, screenName }: { pin: any, screenName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState<"github" | "gitlab">("github");
  const [gitlabDomain, setGitlabDomain] = useState("https://gitlab.com");
  const [webRepo, setWebRepo] = useState("");
  const [appRepo, setAppRepo] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedPlatform = (localStorage.getItem("sync_platform") as "github" | "gitlab") || "github";
    const savedDomain = localStorage.getItem("gitlab_domain") || "https://gitlab.com";
    const oldRepo = localStorage.getItem("github_repo") || "";
    const savedWeb = localStorage.getItem("github_web_repo") || oldRepo;
    const savedApp = localStorage.getItem("github_app_repo") || "";
    const savedToken = localStorage.getItem("github_token") || "";
    
    setPlatform(savedPlatform);
    setGitlabDomain(savedDomain);
    setWebRepo(savedWeb);
    setAppRepo(savedApp);
    setToken(savedToken);
  }, []);

  const handleSync = async () => {
    const targetRepo = pin.device === "Mobile" && appRepo ? appRepo : (webRepo || appRepo);
    
    if (!targetRepo || !token) {
      setIsOpen(true);
      return;
    }
    
    setIsLoading(true);
    try {
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

      let res;
      if (platform === "github") {
        res = await fetch(`https://api.github.com/repos/${targetRepo}/issues`, {
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
      } else {
        const domain = gitlabDomain.replace(/\/$/, "");
        const projectId = encodeURIComponent(targetRepo);
        res = await fetch(`${domain}/api/v4/projects/${projectId}/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `[디자인 QA] ${pin.issueType || '이슈'} - ${screenName}`,
            description: issueBody,
          })
        });
      }

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      const issueUrl = platform === "github" ? data.html_url : data.web_url;
      const platformName = platform === "github" ? "GitHub" : "GitLab";
      
      toast.success(
        <div className="flex flex-col gap-1">
          <span>{platformName} 이슈가 생성되었습니다! ({targetRepo})</span>
          <a href={issueUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline text-xs">보러가기</a>
        </div>
      );
      setIsOpen(false);
    } catch (e: any) {
      toast.error(`${platform === 'github' ? 'GitHub' : 'GitLab'} 연동 실패: 설정 및 권한을 확인해주세요.`);
      console.error(e);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem("sync_platform", platform);
    localStorage.setItem("gitlab_domain", gitlabDomain);
    localStorage.setItem("github_web_repo", webRepo);
    localStorage.setItem("github_app_repo", appRepo);
    localStorage.setItem("github_token", token);
    toast.success("설정이 저장되었습니다.");
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
        title="이슈 자동 라우팅 전송"
      >
        <Send className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Send className="w-5 h-5"/> 멀티 이슈 연동 설정
            </h3>
            <p className="text-xs text-slate-500">화면 유형(PC/Mobile)에 따라 이슈가 각각의 프로젝트로 알아서 라우팅됩니다.</p>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${platform === 'github' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setPlatform('github')}
              >
                GitHub
              </button>
              <button 
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${platform === 'gitlab' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setPlatform('gitlab')}
              >
                GitLab
              </button>
            </div>

            {platform === 'gitlab' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">GitLab 도메인</label>
                <Input placeholder="예: https://gitlab.com" value={gitlabDomain} onChange={e => setGitlabDomain(e.target.value)} />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                웹(Web) 프로젝트 {platform === 'github' ? '(Owner/Repo)' : '(ID 또는 경로)'}
              </label>
              <Input placeholder={platform === 'github' ? '예: yuhyeon/web' : '예: 1234 또는 group/web'} value={webRepo} onChange={e => setWebRepo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                앱(App) 프로젝트 {platform === 'github' ? '(Owner/Repo)' : '(ID 또는 경로)'} <span className="text-slate-400 font-normal">선택</span>
              </label>
              <Input placeholder={platform === 'github' ? '예: yuhyeon/app' : '예: 5678 또는 group/app'} value={appRepo} onChange={e => setAppRepo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Personal Access Token</label>
              <Input type="password" placeholder="발급받은 토큰 입력" value={token} onChange={e => setToken(e.target.value)} />
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
