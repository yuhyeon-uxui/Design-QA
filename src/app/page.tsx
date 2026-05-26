import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle2, Layout, LayoutGrid, ListTodo, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const mockProjects = [
  {
    id: "p1",
    name: "인바운드 웹사이트 디자인 QA 1차",
    platform: "Web",
    status: "진행중",
    issuesCount: 45,
    completedCount: 15,
    screensCount: 32,
    lastUpdated: "2023-10-15",
  },
  {
    id: "p2",
    name: "동호회 앱 배포 전 최종 QA",
    platform: "App (iOS/Android)",
    status: "검토필요",
    issuesCount: 12,
    completedCount: 12,
    screensCount: 8,
    lastUpdated: "2023-10-16",
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#1E3A8A]">
            <div className="w-8 h-8 rounded bg-[#1E3A8A] text-white flex items-center justify-center font-bold">
              QA
            </div>
            <span className="font-bold text-lg tracking-tight">Design QA Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">도움말</span>
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="w-8 h-8 rounded-full bg-slate-200"></div>
              <div className="text-sm">
                <p className="font-medium leading-none text-slate-800">김철수</p>
                <p className="text-xs text-slate-500">QA 팀</p>
              </div>
            </div>
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
          <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
            <Plus className="w-4 h-4 mr-2" /> 새 프로젝트 생성
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">전체 프로젝트</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">12</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Layout className="w-6 h-6 text-[#1E3A8A]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">진행중인 QA</p>
                  <p className="text-3xl font-bold text-[#1E3A8A] mt-1">4</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#1E3A8A]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">누적 미해결 이슈</p>
                  <p className="text-3xl font-bold text-rose-600 mt-1">38</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                  <ListTodo className="w-6 h-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">이번 주 해결됨</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">124</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project List */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1E3A8A] rounded-full"></div>
          진행중인 프로젝트 목록
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {mockProjects.map((project) => {
            const progress = Math.round((project.completedCount / project.issuesCount) * 100) || 0;
            return (
              <Card key={project.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                <CardHeader className="pb-4 border-b bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors">{project.name}</CardTitle>
                      <CardDescription className="pt-1.5 flex items-center gap-2">
                        <span className="bg-[#EEF2FF] text-[#1E3A8A] px-2 py-0.5 rounded text-xs font-semibold">{project.platform}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500">화면 {project.screensCount}장</span>
                      </CardDescription>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      project.status === '진행중' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {project.status}
                    </span>
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
          })}
        </div>
      </main>
    </div>
  );
}
