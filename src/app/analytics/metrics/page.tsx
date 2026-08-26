"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Activity, MousePointerClick, Clock, UserMinus, Users, MonitorSmartphone, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAnalyticsData } from "@/app/actions/analytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type DeviceData = { name: string; value: number };
type PageData = { title: string; path: string; views: number };
type Metrics = {
  activeUsers: number;
  sessions: number;
  bounceRate: number;
  averageSessionDuration: number;
  devices: DeviceData[];
  topPages: PageData[];
};

const COLORS = ['#0064fa', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b'];

export default function UserMetricsPage() {
  const { isMaster, isLoading } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    activeUsers: 0,
    sessions: 0,
    bounceRate: 0,
    averageSessionDuration: 0,
    devices: [],
    topPages: [],
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
        setMetrics(data as Metrics);
        setLoadingMetrics(false);
      });
    }
  }, [isLoading, isMaster, router]);

  if (!isMounted || isLoading) return null;
  if (!isMaster) return null;

  return (
    <AdminLayout>
      <div className="pb-12 bg-slate-50 min-h-screen">
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
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">활성 사용자수</p>
                {loadingMetrics ? <div className="h-9 w-16 bg-slate-100 animate-pulse rounded mt-1"></div> : (
                  <p className="text-3xl font-bold text-slate-900">{metrics.activeUsers.toLocaleString()}<span className="text-base font-medium text-slate-400 ml-1">명</span></p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MousePointerClick className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">총 세션수</p>
                {loadingMetrics ? <div className="h-9 w-16 bg-slate-100 animate-pulse rounded mt-1"></div> : (
                  <p className="text-3xl font-bold text-slate-900">{metrics.sessions.toLocaleString()}<span className="text-base font-medium text-slate-400 ml-1">회</span></p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
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
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Category Chart */}
          <Card className="border-none shadow-sm bg-white lg:col-span-1">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <MonitorSmartphone className="w-5 h-5 text-[#0064fa]" />
                기기별 접속 비율
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[320px] flex flex-col justify-center relative">
              {loadingMetrics ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-slate-100 border-t-[#0064fa] rounded-full animate-spin"></div>
                </div>
              ) : metrics.devices.length === 0 ? (
                <div className="text-center text-slate-400">데이터가 없습니다.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {metrics.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value}명`, '활성 사용자']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {!loadingMetrics && metrics.devices.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {metrics.devices.map((device, index) => (
                    <div key={device.name} className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {device.name}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Pages List */}
          <Card className="border-none shadow-sm bg-white lg:col-span-2">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                인기 페이지 순위 (Top 5)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingMetrics ? (
                <div className="p-6 space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded bg-slate-100 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : metrics.topPages.length === 0 ? (
                <div className="p-16 text-center text-slate-400">데이터가 없습니다.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {metrics.topPages.map((page, index) => (
                    <div key={`${page.path}-${index}`} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{page.title || '알 수 없는 페이지'}</p>
                          <p className="text-sm text-slate-500 truncate">{page.path}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-lg font-bold text-[#0064fa]">{page.views.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Views</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </AdminLayout>
  );
}
