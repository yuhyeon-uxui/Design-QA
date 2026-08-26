"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import Link from "next/link";
import { ArrowLeft, Palette, PenTool, LayoutTemplate } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DesignSystemPage() {
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
              <Palette className="w-6 h-6 text-[#0064fa]" />
              <span className="text-lg">디자인 시스템 허브</span>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Design System</h1>
          <p className="text-slate-500 mt-2">
            공통 UI 컴포넌트 정책 및 디자인 가이드를 관리하는 페이지입니다. (관리자 전용)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-rose-500" />
                피그마 가이드라인 연결
              </CardTitle>
              <CardDescription>
                디자인 시스템 피그마 파일과 연동하여 정책을 동기화합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <Palette className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-slate-500 font-medium mb-4">현재 등록된 디자인 시스템 URL이 없습니다.</p>
              <Button className="bg-[#0064fa] hover:bg-[#0064fa]/90">
                디자인 시스템 등록하기
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-emerald-500" />
                UI 컴포넌트 카탈로그
              </CardTitle>
              <CardDescription>
                현재 프로젝트에 구현된 공통 컴포넌트 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <LayoutTemplate className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-slate-500 font-medium">컴포넌트 카탈로그 준비 중입니다.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </AdminLayout>
  );
}
