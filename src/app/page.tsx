"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, getDocs, writeBatch } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle2, Layout, LayoutGrid, ListTodo, Plus, Calendar, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INITIAL_PROJECTS: Array<{
  id: string;
  name: string;
  platform: string;
  status: string;
  issuesCount: number;
  completedCount: number;
  screensCount: number;
  lastUpdated: string;
}> = [];

export default function Dashboard() {
  const [projects, setProjects] = useState<typeof INITIAL_PROJECTS>([]);
  const [isMounted, setIsMounted] = useState(false);

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
    return () => unsubscribe();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectPlatform, setNewProjectPlatform] = useState("");
  const [newProjectDueDate, setNewProjectDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "ongoing" | "unresolved" | "resolved">("all");

  const filteredProjects = projects.filter(p => {
    if (filter === "all") return true;
    if (filter === "ongoing") return p.status === "진행중";
    if (filter === "unresolved") return (p.issuesCount - p.completedCount) > 0;
    if (filter === "resolved") return p.issuesCount > 0 && p.issuesCount === p.completedCount;
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
      lastUpdated: newProjectDueDate || new Date().toISOString().split('T')[0],
      createdAt: Date.now()
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

      setIsModalOpen(false);
      setNewProjectName("");
      setNewProjectPlatform("");
      setNewProjectDueDate("");
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
          <a href="/" className="flex items-center gap-3 text-[#1E3A8A] hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded bg-[#1E3A8A] text-white flex items-center justify-center font-bold">
              QA
            </div>
            <span className="font-bold text-lg tracking-tight">피닉스다트 Design QA Hub</span>
          </a>
          <div className="flex items-center gap-4">
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
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-[#1E3A8A]" />
              프로젝트 대시보드
            </h1>
            <p className="text-slate-500 mt-2 text-sm">전체 QA 프로젝트의 진행 상황과 지표를 확인합니다.</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger render={
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 h-12 px-6 rounded-xl text-base font-bold shadow-sm">
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
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="dueDate" className="text-sm font-bold text-slate-800">요청일</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newProjectDueDate}
                      onChange={(e) => setNewProjectDueDate(e.target.value)}
                      className="h-11 w-full"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium tracking-tight">※ 미설정 시 오늘 날짜로 지정됩니다.</p>
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
                        ? "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-md" 
                        : "bg-slate-200 text-slate-400 hover:bg-slate-200"
                    }`} 
                  >
                    생성하기
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className={`border shadow-sm bg-white cursor-pointer transition-all hover:shadow-md ${filter === 'all' ? 'ring-2 ring-[#1E3A8A] border-transparent' : 'border-slate-100 hover:border-slate-200'}`}
            onClick={() => setFilter('all')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${filter === 'all' ? 'text-[#1E3A8A]' : 'text-slate-500'}`}>전체 프로젝트</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{projects.length}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${filter === 'all' ? 'bg-[#1E3A8A] text-white' : 'bg-blue-50 text-[#1E3A8A]'}`}>
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
                  <p className={`text-3xl font-bold mt-1 ${filter === 'ongoing' ? 'text-blue-600' : 'text-[#1E3A8A]'}`}>{projects.filter(p => p.status === '진행중').length}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${filter === 'ongoing' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-[#1E3A8A]'}`}>
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
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{projects.filter(p => p.issuesCount > 0 && p.issuesCount === p.completedCount).length}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${filter === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project List */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1E3A8A] rounded-full"></div>
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
            const progress = Math.round((project.completedCount / project.issuesCount) * 100) || 0;
            const getPlatformColor = (platform: string) => {
              if (platform.includes("Web")) return "bg-blue-50 text-blue-700 border border-blue-100";
              if (platform.includes("App")) return "bg-emerald-50 text-emerald-700 border border-emerald-100";
              return "bg-slate-100 text-slate-700 border border-slate-200";
            };
            return (
              <Card key={project.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                <CardHeader className="pb-4 border-b bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors">{project.name}</CardTitle>
                      <CardDescription className="pt-2 flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPlatformColor(project.platform)}`}>{project.platform}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 font-medium">화면 {project.screensCount}장</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {project.lastUpdated}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        project.status === '진행중' ? 'bg-blue-100 text-blue-700' : 
                        project.status === 'QA 완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {project.status === '진행중' && project.issuesCount > 0 && project.issuesCount === project.completedCount ? 'QA 완료' : project.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">QA 진행률</span>
                      <span className="font-bold text-[#1E3A8A]">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">{project.completedCount}</span> / {project.issuesCount} 건 완료
                      </div>
                      <Link href={`/project/${project.id}/screen/s1`}>
                        <Button variant="ghost" size="sm" className="text-[#1E3A8A] hover:bg-blue-50 font-semibold group-hover:translate-x-1 transition-transform">
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
      </main>

    </div>
  );
}
