"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import Link from "next/link";
import { ArrowLeft, Activity, MousePointerClick, Clock, UserMinus, MonitorPlay } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserMetricsPage() {
  const { isMaster, isLoading } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isLoading && !isMaster) {
      router.push("/");
      return;
    }
    setIsMounted(true);
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
              <span className="text-lg">유저 행동 지표 (Mock)</span>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Metrics</h1>
          <p className="text-slate-500 mt-2">
            GA4 등 애널리틱스 툴과 연동 시 표시될 유저 행동 지표(더미 데이터)입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <MousePointerClick className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">평균 클릭률 (CTR)</p>
                <p className="text-3xl font-bold text-slate-900">12.4<span className="text-base font-medium text-slate-400 ml-1">%</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <UserMinus className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">평균 이탈률 (Bounce Rate)</p>
                <p className="text-3xl font-bold text-slate-900">45.2<span className="text-base font-medium text-slate-400 ml-1">%</span></p>
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
                <p className="text-3xl font-bold text-slate-900">02:45<span className="text-base font-medium text-slate-400 ml-1">min</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-[#0064fa]" />
              상세 유저 행동 트래킹 준비 중
            </CardTitle>
            <CardDescription>
              본 페이지는 향후 구글 애널리틱스(GA4) 또는 믹스패널(Mixpanel) 데이터와 연동될 공간입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">실제 데이터를 불러오기 위해 연동 스크립트 설정이 필요합니다.</p>
          </CardContent>
        </Card>
      </main>
      </div>
    </AdminLayout>
  );
}
