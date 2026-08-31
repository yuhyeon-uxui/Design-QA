"use client";

import { trackEvent } from "@/lib/analytics";

import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, getDocs, writeBatch, collectionGroup } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle2, Layout, LayoutGrid, ListTodo, Plus, Calendar, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const INITIAL_PROJECTS: Array<{
  id: string;
  name: string;
  platform: string;
  status: string;
  issuesCount: number;
  completedCount: number;
  screensCount: number;
  completedScreensCount?: number;
  lastUpdated: string;
  figmaProjectUrl?: string;
}> = [];

import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User as UserIcon } from "lucide-react";

import { NavigationSidebar } from "@/components/NavigationSidebar";

export default function Dashboard() {
  const { user, canManageProjects, signOut, isLoading } = useAuthStore();
  const [projects, setProjects] = useState<typeof INITIAL_PROJECTS>([]);
  const [allScreens, setAllScreens] = useState<any[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projData: any[] = [];
      snapshot.forEach((doc) => {
        projData.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projData as any);
    });

    const sq = query(collectionGroup(db, "screens"));
    const unsubscribeScreens = onSnapshot(sq, (snapshot) => {
      const screensData: any[] = [];
      snapshot.forEach((doc) => {
        screensData.push({ id: doc.id, projectId: doc.ref.parent.parent?.id, ...doc.data() });
      });
      setAllScreens(screensData);
    });

    const hideUntil = localStorage.getItem("hideUpdateModalUntil_v1");
    if (!hideUntil || Date.now() > parseInt(hideUntil, 10)) {
      setShowUpdateModal(true);
    }

    return () => {
      unsubscribe();
      unsubscribeScreens();
    };
  }, []);

  const handleHideUpdateModal = () => {
    // 7 days in ms
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("hideUpdateModalUntil_v1", (Date.now() + sevenDays).toString());
    setShowUpdateModal(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectPlatform, setNewProjectPlatform] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newProjectDueDate, setNewProjectDueDate] = useState("");
  const [newProjectFigmaUrl, setNewProjectFigmaUrl] = useState("");
  const [filter, setFilter] = useState<"all" | "ongoing" | "unresolved" | "resolved">("all");

  const filteredProjects = projects.filter(p => {
    if (filter === "all") return true;
    if (filter === "ongoing") return p.status === "진행중";
    if (filter === "unresolved") return (p.issuesCount - p.completedCount) > 0;
    if (filter === "resolved") return p.status === "완료됨";
    return true;
  });

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectPlatform) return;
    
    const newId = `p${Date.now()}`;
    const newProject = {
      name: newProjectName,
      platform: newProjectPlatform,
      status: "진행중",
      issuesCount: 0,
      completedCount: 0,
      screensCount: 1,
      completedScreensCount: 0,
      lastUpdated: newProjectStartDate || new Date().toISOString().split('T')[0],
      dueDate: newProjectDueDate || "",
      createdAt: Date.now(),
      figmaProjectUrl: newProjectFigmaUrl || ""
    };

    try {
      await setDoc(doc(db, "projects", newId), newProject);
      
      // Initialize with 1 screen
      const emptyDeviceState = { image: "", issuesCount: -1, pins: [] };
      const initialScreen = { 
        id: "s1", 
        name: "새로운 화면", 
        status: "확인 대기", 
        issueCount: -1,
        PC: { ...emptyDeviceState }, 
        Mobile: { ...emptyDeviceState } 
      };
      await setDoc(doc(db, "project_screens", newId, "screens", "s1"), initialScreen);
      trackEvent("click_add_project", { platform: newProject.platform });

      setIsModalOpen(false);
      setNewProjectName("");
      setNewProjectPlatform("");
      setNewProjectStartDate(new Date().toISOString().split('T')[0]);
      setNewProjectDueDate("");
      setNewProjectFigmaUrl("");
    } catch (e) {
      console.error("Error creating project:", e);
      alert("프로젝트 생성 실패");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <NavigationSidebar />
            <a href="/" className="flex items-center gap-3 text-[#0064fa] hover:opacity-80 transition-opacity cursor-pointer shrink-0">
              <div className="w-8 h-8 rounded bg-[#0064fa] text-white flex items-center justify-center font-bold">
                QA
              </div>
              <span className="font-bold text-lg tracking-tight">피닉스다트 Design QA Hub</span>
            </a>
          </div>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="프로젝트, 화면, 이슈(핀), 작성자, 코멘트 등 통합 검색..."
                className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-[#0064fa]/30 transition-all rounded-full h-10 text-sm"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* 로그인 / 로그아웃 버튼 */}
            {user ? (
              <div className="flex items-center gap-2 mr-2 border-r pr-4 border-slate-200">
                <Link href="/mypage">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-100 transition-colors cursor-pointer" title="마이페이지">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="font-medium max-w-[100px] truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => signOut()} className="w-8 h-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50" title="로그아웃">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="mr-2">
                <Button variant="outline" size="sm" className="h-9 px-4 text-slate-600 font-semibold border-slate-200 hover:bg-slate-50">
                  로그인
                </Button>
              </Link>
            )}

            <Dialog>
              <DialogTrigger render={<span className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer transition-colors px-2 py-1">도움말</span>} />
              <DialogContent className="sm:max-w-[600px] p-8">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-base shadow-sm border border-blue-100">💡</span>
                    Design QA Hub 퀵 스타트 가이드
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-8 py-2">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">1</span> 
                      피그마 링크 연동하기
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-7">
                      Figma에서 비교할 디자인 프레임을 선택하고 우클릭 &gt; <strong className="text-slate-800">Copy/Paste as</strong> &gt; <strong className="text-slate-800">Copy link</strong>를 클릭하세요. <br/><span className="text-slate-400 text-xs">(Node-id가 포함된 정확한 링크가 필요합니다)</span>
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">2</span> 
                      테스트 화면 업로드 및 핀(Pin) 생성
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-7">
                      개발된 실제 화면(Web/App)을 캡처하여 업로드한 후, 이미지 위에서 수정이 필요한 영역을 마우스로 <strong className="text-blue-600">클릭</strong>하면 이슈 핀(Pin)이 생성됩니다.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">3</span> 
                      이슈 내용 작성 및 상태 관리
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-7">
                      우측 패널에서 담당자를 지정하고 <strong className="text-slate-800">구체적인 수정 요청사항</strong>을 적어주세요. 작업이 완료되면 핀 상태를 <span className="text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">'해결됨'</span>으로 변경하여 트래킹합니다.
                    </p>
                  </div>
                  
                  {/* 추가: 최적 해상도 안내 */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                    <span className="text-blue-500 text-lg">🖥️</span>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      <strong>권장 사용 환경:</strong> 원활한 양방향 시안 비교(피그마-테스트화면)를 위해 <strong>PC 환경(최소 가로 해상도 1440px 이상, 권장 1920x1080)</strong>에서의 사용을 권장합니다. 화면이 좁을 경우 우측 패널의 경계선을 드래그하여 크기를 조절할 수 있습니다!
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {globalSearchQuery ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-[#0064fa]" />
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                "{globalSearchQuery}" 검색 결과
              </h1>
            </div>
            
            <div className="space-y-4">
              {(() => {
                const sq = globalSearchQuery.toLowerCase();
                const results: any[] = [];
                
                allScreens.forEach(screen => {
                  const proj = projects.find(p => p.id === screen.projectId);
                  const projName = proj?.name || "알 수 없는 프로젝트";
                  
                  const isScreenMatch = screen.name?.toLowerCase().includes(sq) || projName.toLowerCase().includes(sq);
                  
                  const matchingPins: any[] = [];
                  ['PC', 'Mobile'].forEach(device => {
                    const pins = screen[device]?.pins || [];
                    pins.forEach((pin: any) => {
                      const isPinMatch = 
                        String(pin.id).includes(sq) ||
                        (pin.description || "").toLowerCase().includes(sq) ||
                        (pin.request || "").toLowerCase().includes(sq) ||
                        (pin.status || "").toLowerCase().includes(sq) ||
                        (pin.comments || []).some((c: any) => c.text.toLowerCase().includes(sq) || c.author.toLowerCase().includes(sq));
                      
                      if (isPinMatch || isScreenMatch) {
                        matchingPins.push({ ...pin, device });
                      }
                    });
                  });
                  
                  if (isScreenMatch && matchingPins.length === 0) {
                    results.push({ type: 'screen', projId: screen.projectId, screenId: screen.id, projName, screenName: screen.name });
                  } else if (matchingPins.length > 0) {
                    matchingPins.forEach(pin => {
                      results.push({ type: 'pin', projId: screen.projectId, screenId: screen.id, projName, screenName: screen.name, pin });
                    });
                  }
                });

                if (results.length === 0) {
                  return (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-lg">검색 결과가 없습니다.</p>
                    </div>
                  );
                }

                return results.map((res, i) => (
                  <Link key={i} href={`/project/${res.projId}/screen/${res.screenId}${res.type === 'pin' ? `?pinId=${res.pin.id}` : ''}`}>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0064fa]/50 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#0064fa] bg-blue-50 w-fit px-2 py-1 rounded">
                        {res.projName} &gt; {res.screenName}
                      </div>
                      {res.type === 'pin' && (
                        <div className="mt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                              {res.pin.id}
                            </span>
                            <span className="text-sm font-bold text-slate-800">{res.pin.description || "(설명 없음)"}</span>
                          </div>
                          <p className="text-sm text-slate-600 pl-7 line-clamp-2">{res.pin.request || "(요청사항 없음)"}</p>
                          <div className="flex items-center gap-3 pl-7 mt-2">
                            <span className="text-xs text-slate-500 font-medium">상태: {res.pin.status}</span>
                            <span className="text-xs text-slate-500 font-medium">작성자: {res.pin.comments?.[0]?.author || "알 수 없음"}</span>
                            {res.pin.comments?.length > 0 && (
                              <span className="text-xs text-slate-500 font-medium">코멘트 {res.pin.comments.length}개</span>
                            )}
                          </div>
                        </div>
                      )}
                      {res.type === 'screen' && (
                        <p className="text-sm text-slate-500 mt-1">화면 이름 또는 프로젝트 이름 일치</p>
                      )}
                    </div>
                  </Link>
                ));
              })()}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-[#0064fa]" />
              프로젝트 대시보드
            </h1>
            <p className="text-slate-500 mt-2 text-sm">전체 QA 프로젝트의 진행 상황과 지표를 확인합니다.</p>
          </div>
          {canManageProjects && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger render={
              <Button className="bg-[#0064fa] hover:bg-[#0064fa]/90 h-12 px-6 rounded-xl text-base font-bold shadow-sm">
                <Plus className="w-5 h-5 mr-2" /> 새 프로젝트 생성
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px] p-8">
              <DialogHeader className="mb-2">
                <DialogTitle className="text-xl font-bold text-slate-900">새 프로젝트 생성</DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  QA를 진행할 새로운 프로젝트 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-2">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-sm font-bold text-slate-800">프로젝트 이름</Label>
                  <Input
                    id="name"
                    placeholder="예: 사내 그룹웨어 리뉴얼 QA"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="figmaUrl" className="text-sm font-bold text-slate-800">전체 피그마 프로젝트 링크 (선택)</Label>
                  <Input
                    id="figmaUrl"
                    placeholder="피그마 링크를 넣어주세요."
                    value={newProjectFigmaUrl}
                    onChange={(e) => setNewProjectFigmaUrl(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-800">플랫폼 유형</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Web (반응형)", "App (iOS/Android)", "기타"].map((platform) => (
                        <button
                          key={platform}
                          onClick={() => setNewProjectPlatform(platform)}
                          className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                            newProjectPlatform === platform
                              ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-sm font-bold text-slate-800">프로젝트 기간</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={newProjectStartDate}
                        onChange={(e) => setNewProjectStartDate(e.target.value)}
                        className="h-11 flex-1"
                        title="시작일"
                      />
                      <span className="text-slate-400 font-bold">~</span>
                      <Input
                        type="date"
                        value={newProjectDueDate}
                        onChange={(e) => setNewProjectDueDate(e.target.value)}
                        className="h-11 flex-1"
                        title="마감일 (선택)"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium tracking-tight">※ 마감일은 미정일 경우 비워둘 수 있습니다.</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4 !bg-transparent !border-none !p-0 !m-0">
                <div className="flex gap-3 justify-end w-full">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="h-12 px-6 font-semibold rounded-lg">취소</Button>
                  <Button 
                    onClick={handleCreateProject} 
                    disabled={!newProjectName.trim() || !newProjectPlatform}
                    className={`h-12 px-8 font-bold rounded-lg text-base transition-all ${
                      newProjectName.trim() && newProjectPlatform 
                        ? "bg-[#0064fa] hover:bg-[#0064fa]/90 text-white shadow-md" 
                        : "bg-slate-200 text-slate-400 hover:bg-slate-200"
                    }`} 
                  >
                    생성하기
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card 
            className={`border shadow-sm bg-white cursor-pointer transition-all hover:shadow-md ${filter === 'all' ? 'ring-2 ring-[#0064fa] border-transparent' : 'border-slate-100 hover:border-slate-200'}`}
            onClick={() => setFilter('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${filter === 'all' ? 'text-[#0064fa]' : 'text-slate-500'}`}>전체 프로젝트</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{projects.length}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${filter === 'all' ? 'bg-[#0064fa] text-white' : 'bg-blue-50 text-[#0064fa]'}`}>
                  <Layout className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border shadow-sm bg-white cursor-pointer transition-all hover:shadow-md ${filter === 'ongoing' ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-100 hover:border-slate-200'}`}
            onClick={() => setFilter('ongoing')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${filter === 'ongoing' ? 'text-blue-600' : 'text-slate-500'}`}>진행중인 QA</p>
                  <p className={`text-3xl font-bold mt-1 ${filter === 'ongoing' ? 'text-blue-600' : 'text-[#0064fa]'}`}>{projects.filter(p => p.status === '진행중').length}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${filter === 'ongoing' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-[#0064fa]'}`}>
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border shadow-sm bg-white cursor-pointer transition-all hover:shadow-md ${filter === 'unresolved' ? 'ring-2 ring-rose-500 border-transparent' : 'border-slate-100 hover:border-slate-200'}`}
            onClick={() => setFilter('unresolved')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${filter === 'unresolved' ? 'text-rose-600' : 'text-slate-500'}`}>누적 미해결 이슈</p>
                  <p className="text-3xl font-bold text-rose-600 mt-1">{projects.reduce((acc, p) => acc + (p.issuesCount - p.completedCount), 0)}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${filter === 'unresolved' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'}`}>
                  <ListTodo className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border shadow-sm bg-white cursor-pointer transition-all hover:shadow-md ${filter === 'resolved' ? 'ring-2 ring-emerald-500 border-transparent' : 'border-slate-100 hover:border-slate-200'}`}
            onClick={() => setFilter('resolved')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${filter === 'resolved' ? 'text-emerald-600' : 'text-slate-500'}`}>완료된 프로젝트</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{projects.filter(p => p.status === '완료됨').length}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${filter === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Link href="/analytics/ai-report" className="block">
            <Card 
              className={`border shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 cursor-pointer transition-all hover:shadow-md hover:border-purple-200 border-indigo-100 ring-1 ring-purple-100/50 h-full`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-indigo-600">✨ AI QA 리포트</p>
                    <p className="text-sm font-semibold text-slate-700 mt-2">상세 페이지로 이동</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-indigo-500 shadow-sm">
                    <span className="text-xl">✨</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Project List */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-[#0064fa] rounded-full"></div>
          {filter === "all" ? "전체 프로젝트 목록" : 
           filter === "ongoing" ? "진행중인 프로젝트 목록" : 
           filter === "unresolved" ? "미해결 이슈가 있는 프로젝트" : "최근 해결된 프로젝트"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {filteredProjects.length === 0 ? (
            <div className="col-span-1 md:col-span-2 py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-200">
              <Layout className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold mb-2">아직 등록된 프로젝트가 없습니다.</p>
              <p className="text-sm text-slate-400">우측 상단의 '새 프로젝트 생성' 버튼을 눌러 QA를 시작해보세요.</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
            const totalTasks = project.screensCount + project.issuesCount;
            const completedTasks = (project.completedScreensCount || 0) + project.completedCount;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            const getPlatformColor = (platform: string) => {
              if (platform.includes("Web")) return "bg-blue-50 text-blue-700 border border-blue-100";
              if (platform.includes("App")) return "bg-emerald-50 text-emerald-700 border border-emerald-100";
              return "bg-slate-100 text-slate-700 border border-slate-200";
            };
            const isDerivedCompleted = project.status === '진행중' && project.issuesCount > 0 && project.issuesCount === project.completedCount;
            const displayStatus = isDerivedCompleted ? 'QA 완료' : project.status;
            
            // D-Day 계산 로직
            const dueDateStr = (project as any).dueDate;
            let dDayBadge = null;
            if (dueDateStr && displayStatus !== 'QA 완료' && displayStatus !== '완료됨') {
              const due = new Date(dueDateStr);
              const today = new Date();
              today.setHours(0,0,0,0);
              const diffTime = due.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays < 0) {
                dDayBadge = <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-xs animate-pulse">기한 지남 (D+{Math.abs(diffDays)})</span>;
              } else if (diffDays <= 3) {
                dDayBadge = <span className="bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded text-xs">마감 임박 (D-{diffDays})</span>;
              } else {
                dDayBadge = <span className="bg-blue-50 text-[#0064fa] font-bold px-2 py-0.5 rounded text-xs">D-{diffDays}</span>;
              }
            }
            
            return (
              <Card key={project.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                <CardHeader className="pb-4 border-b bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-[#0064fa] transition-colors">{project.name}</CardTitle>
                      <CardDescription className="pt-2 flex flex-wrap items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPlatformColor(project.platform)}`}>{project.platform}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 font-medium">화면 {project.screensCount}장</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 font-medium flex items-center gap-1.5" title="프로젝트 기간">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {project.lastUpdated.replace(/-/g, '.').substring(2)} ~ {dueDateStr ? dueDateStr.replace(/-/g, '.').substring(2) : '미정'}
                        </span>
                        {dDayBadge && (
                          <>
                            <span className="text-slate-300">|</span>
                            {dDayBadge}
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center shrink-0 ml-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        displayStatus === '진행중' ? 'bg-blue-100 text-blue-700' : 
                        displayStatus === 'QA 완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {displayStatus}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">QA 진행률</span>
                      <span className="font-bold text-[#0064fa]">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">{project.completedCount}</span> / {project.issuesCount} 건 완료
                      </div>
                      <Link href={`/project/${project.id}/screen/s1`}>
                        <Button variant="ghost" size="sm" className="text-[#0064fa] hover:bg-blue-50 font-semibold group-hover:translate-x-1 transition-transform">
                          QA 보드 열기 <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
          )}
        </div>
        </div>
        )}
      </main>

      {/* Update Modal */}
      <Dialog open={showUpdateModal && isMounted} onOpenChange={setShowUpdateModal}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white gap-0 rounded-2xl shadow-2xl border-slate-200">
          <div className="p-7 pb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100/50 shadow-sm">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">UX/UI 대규모 업데이트</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">사용자 여러분의 피드백을 바탕으로 디자인 QA 툴이 한층 더 쾌적하게 개선되었습니다.</p>
          </div>
          
          <div className="px-7 py-4 space-y-6">
            <div className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">1</div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900">텍스트 에디터 UX 개선 (Notion 스타일)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  시야를 가리던 고정 툴바 대신, 텍스트를 드래그할 때만 나타나는 <strong>플로팅 버블 툴바</strong>가 적용되었습니다. 읽기 모드에서도 가독성이 대폭 향상되었습니다.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">2</div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900">끊김 없는(Seamless) 자동 저장</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  작성 도중 수동으로 저장할 필요가 없습니다. 내용이 수정되면 백그라운드에서 <strong>1초 간격으로 자동 저장</strong>되어 작업 흐름이 끊기지 않습니다.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">3</div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900">썸네일 디바이스(PC/MO) 상태 유지</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  좌측 사이드바의 각 썸네일마다 <strong>PC/MO 보기 상태를 개별적으로 기억</strong>하게 되어, 이리저리 화면을 이동해도 이전 상태가 그대로 유지됩니다.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 px-7 pb-7 pt-4 w-full mt-2">
            <Button onClick={() => setShowUpdateModal(false)} className="w-full h-14 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-base rounded-2xl font-bold shadow-sm">
              확인했어요
            </Button>
            <button 
              onClick={handleHideUpdateModal}
              className="text-[15px] text-slate-400 hover:text-slate-600 transition-colors font-medium py-2 text-center"
            >
              7일간 보지 않기
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
