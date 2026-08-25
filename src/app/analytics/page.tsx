"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, collectionGroup } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PieChart as PieChartIcon, Activity, AlertCircle, Layout, LayoutGrid } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function AnalyticsDashboard() {
  const { isMaster, isLoading } = useAuthStore();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [allPins, setAllPins] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isLoading && !isMaster) {
      router.push("/");
      return;
    }
    
    setIsMounted(true);
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projData: any[] = [];
      snapshot.forEach((doc) => {
        projData.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projData);
    });

    const sq = query(collectionGroup(db, "screens"));
    const unsubscribeScreens = onSnapshot(sq, (snapshot) => {
      const pinsData: any[] = [];
      snapshot.forEach((doc) => {
        const screen = doc.data();
        if (screen.PC?.pins) {
          screen.PC.pins.forEach((pin: any) => pinsData.push({ ...pin, projectId: doc.ref.parent.parent?.id }));
        }
        if (screen.Mobile?.pins) {
          screen.Mobile.pins.forEach((pin: any) => pinsData.push({ ...pin, projectId: doc.ref.parent.parent?.id }));
        }
      });
      setAllPins(pinsData);
    });

    return () => {
      unsubscribe();
      unsubscribeScreens();
    };
  }, [isLoading, isMaster, router]);

  if (!isMounted || isLoading) return null;
  if (!isMaster) return null;

  // 1. KPI 계산
  const totalProjects = projects.length;
  const totalIssues = allPins.filter(pin => pin.status !== "특이사항 없음").length; // 유효 이슈만 카운트
  const completedIssues = allPins.filter(pin => pin.status === "완료됨").length;
  const resolutionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
  
  // 1-1. 평균 QA 소요 시간 (완료된 핀 기준)
  const resolvedPinsWithTime = allPins.filter(pin => pin.status === "완료됨" && pin.createdAt && pin.updatedAt);
  let averageResolutionHours = 0;
  if (resolvedPinsWithTime.length > 0) {
    const totalTimeDiff = resolvedPinsWithTime.reduce((acc, pin) => {
      // updatedAt과 createdAt이 ISO string인지 확인
      const start = new Date(pin.createdAt).getTime();
      const end = new Date(pin.updatedAt).getTime();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        return acc + (end - start);
      }
      return acc;
    }, 0);
    // 밀리초를 시간(hours)으로 변환
    averageResolutionHours = Math.round(totalTimeDiff / resolvedPinsWithTime.length / (1000 * 60 * 60));
  }
  
  // 2. 이슈 상태별 분포 (Pie Chart)
  const statusCounts = allPins.reduce((acc, pin) => {
    if (pin.status === "특이사항 없음") return acc;
    acc[pin.status] = (acc[pin.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = [
    { name: '진행중', value: statusCounts['진행중'] || 0, color: '#ef4444' }, // Red
    { name: '확인/검토중', value: statusCounts['확인/검토중'] || 0, color: '#f59e0b' }, // Amber
    { name: '수정완료', value: statusCounts['수정완료'] || 0, color: '#3b82f6' }, // Blue
    { name: '완료됨', value: statusCounts['완료됨'] || 0, color: '#10b981' }, // Green
  ].filter(d => d.value > 0);

  // 3. 플랫폼별 프로젝트 분포
  const platformCounts = projects.reduce((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformData = Object.entries(platformCounts).map(([name, value]) => ({
    name, value
  }));

  // 4. 병목 프로젝트 Top 5 (남은 이슈가 가장 많은 프로젝트)
  const projectBottlenecks = projects.map(p => {
    const unresolved = p.issuesCount - p.completedCount;
    return {
      name: p.name,
      unresolved: unresolved > 0 ? unresolved : 0
    };
  }).sort((a, b) => b.unresolved - a.unresolved).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold text-sm">홈으로</span>
            </Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 text-slate-800 font-bold">
              <PieChartIcon className="w-6 h-6 text-[#0064fa]" />
              <span className="text-lg">QA 통계 대시보드</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Overview</h1>
          <p className="text-slate-500 mt-2">전체 프로젝트의 QA 현황과 병목 지점을 한눈에 파악하세요.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">누적 프로젝트</p>
                <p className="text-3xl font-bold text-slate-900">{totalProjects}<span className="text-base font-medium text-slate-400 ml-1">개</span></p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">발견된 총 이슈</p>
                <p className="text-3xl font-bold text-slate-900">{totalIssues}<span className="text-base font-medium text-slate-400 ml-1">건</span></p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">전체 해결률</p>
                <p className="text-3xl font-bold text-slate-900">{resolutionRate}<span className="text-base font-medium text-slate-400 ml-1">%</span></p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <PieChartIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">평균 해결 소요 시간</p>
                <p className="text-3xl font-bold text-slate-900">{averageResolutionHours}<span className="text-base font-medium text-slate-400 ml-1">시간</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Pie Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">이슈 상태별 분포</CardTitle>
              <CardDescription>전체 프로젝트의 이슈(핀)들이 현재 어떤 상태인지 비율을 보여줍니다.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">데이터가 없습니다.</div>
              )}
            </CardContent>
          </Card>

          {/* Bottleneck Bar Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">병목 프로젝트 TOP 5</CardTitle>
              <CardDescription>가장 많은 미해결 이슈(진행중/검토중 등)가 남아있는 프로젝트 순위입니다.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {projectBottlenecks.some(p => p.unresolved > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectBottlenecks} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="unresolved" name="미해결 이슈 건수" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">모든 프로젝트가 평온합니다. (병목 없음)</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
