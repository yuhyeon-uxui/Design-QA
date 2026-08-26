"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ArrowLeft, Activity, MousePointerClick, Clock, UserMinus, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAnalyticsData } from "@/app/actions/analytics";

export default function UserMetricsPage() {
  const { isMaster, isLoading } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    sessions: 0,
    bounceRate: 0,
    averageSessionDuration: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (!isLoading && !isMaster) {
      router.push("/");
      return;
    }
    setIsMounted(true);
    
    if (isMaster) {
      fetchAnalyticsData().then(data => {
        setMetrics(data);
        setLoadingMetrics(false);
      });
    }
  }, [isLoading, isMaster, router]);

  if (!isMounted || isLoading) return null;
  if (!isMaster) return null;

  return (
    <AdminLayout>
      <div className="pb-12">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-800 font-bold">
              <Activity className="w-6 h-6 text-[#0064fa]" />
              <span className="text-lg">유저 행동 지표 (GA4 연동됨)</span>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Metrics</h1>
          <p className="text-slate-500 mt-2">
            구글 애널리틱스(GA4)에서 실시간으로 불러온 실제 웹사이트 트래픽 데이터(최근 30일)입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">활성 사용자수</p>
                {loadingMetrics ? <div className="h-9 w-16 bg-slate-100 animate-pulse rounded mt-1"></div> : (
                  <p className="text-3xl font-bold text-slate-900">{metrics.activeUsers}<span className="text-base font-medium text-slate-400 ml-1">명</span></p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <MousePointerClick className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">총 세션수</p>
                {loadingMetrics ? <div className="h-9 w-16 bg-slate-100 animate-pulse rounded mt-1"></div> : (
                  <p className="text-3xl font-bold text-slate-900">{metrics.sessions}<span className="text-base font-medium text-slate-400 ml-1">회</span></p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <UserMinus className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">평균 이탈률</p>
                {loadingMetrics ? <div className="h-9 w-16 bg-slate-100 animate-pulse rounded mt-1"></div> : (
                  <p className="text-3xl font-bold text-slate-900">{metrics.bounceRate.toFixed(1)}<span className="text-base font-medium text-slate-400 ml-1">%</span></p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">평균 체류시간</p>
                {loadingMetrics ? <div className="h-9 w-16 bg-slate-100 animate-pulse rounded mt-1"></div> : (
                  <p className="text-3xl font-bold text-slate-900">{Math.floor(metrics.averageSessionDuration / 60)}<span className="text-base font-medium text-slate-400 ml-1">분</span> {Math.floor(metrics.averageSessionDuration % 60)}<span className="text-base font-medium text-slate-400 ml-1">초</span></p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </AdminLayout>
  );
}
