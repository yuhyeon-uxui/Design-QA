"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Palette, Layers, Type, MousePointerClick, CheckSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <div className="pb-12 bg-white min-h-screen">
        <header className="bg-white border-b sticky top-0 z-10 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-800 font-bold">
            <Palette className="w-6 h-6 text-[#0064fa]" />
            <span className="text-lg">디자인 시스템 가이드</span>
          </div>
        </header>

        <main className="container mx-auto px-8 py-10 max-w-5xl space-y-16">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Design System</h1>
            <p className="text-slate-500 text-lg">
              Design QA Hub 구축에 사용된 색상, 타이포그래피, 컴포넌트 정책입니다.
            </p>
          </div>

          {/* Colors */}
          <section id="colors" className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Layers className="w-5 h-5 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800">Colors (색상)</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-primary shadow-sm border flex items-end p-3">
                  <span className="text-primary-foreground font-mono text-sm font-bold">bg-primary</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Primary (Brand)</p>
                  <p className="text-sm text-slate-500">주요 버튼, 강조색</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-background shadow-sm border border-slate-200 flex items-end p-3">
                  <span className="text-slate-600 font-mono text-sm font-bold">bg-background</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Background</p>
                  <p className="text-sm text-slate-500">앱 기본 배경색</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-emerald-500 shadow-sm border flex items-end p-3">
                  <span className="text-white font-mono text-sm font-bold">bg-emerald-500</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Success</p>
                  <p className="text-sm text-slate-500">완료 상태, 성공 메시지</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-destructive shadow-sm border flex items-end p-3">
                  <span className="text-destructive-foreground font-mono text-sm font-bold">bg-destructive</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Danger / Error</p>
                  <p className="text-sm text-slate-500">경고, 에러 메시지</p>
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section id="typography" className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Type className="w-5 h-5 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800">Typography (타이포그래피)</h2>
            </div>
            
            <Card className="shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Heading 1 (4xl, ExtraBold)</h1>
                  <p className="text-sm text-slate-400 mt-1">페이지 주요 타이틀 (Page Titles)</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Heading 2 (2xl, Bold)</h2>
                  <p className="text-sm text-slate-400 mt-1">섹션 타이틀 (Section Titles)</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Heading 3 (lg, Bold)</h3>
                  <p className="text-sm text-slate-400 mt-1">카드 타이틀, 하위 섹션 (Card Titles)</p>
                </div>
                <div>
                  <p className="text-base text-slate-700">Body Text (base, Normal)</p>
                  <p className="text-sm text-slate-400 mt-1">기본 본문 텍스트 (Body Copy)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Caption Text (sm, Medium)</p>
                  <p className="text-xs text-slate-400 mt-1">부가 설명, 메타데이터 (Captions)</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Components */}
          <section id="components" className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <MousePointerClick className="w-5 h-5 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800">Components (컴포넌트)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Buttons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6">Primary</Button>
                    <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 font-bold h-10 px-6">Outline</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-primary hover:bg-primary/10 font-medium h-10 px-6">Ghost</Button>
                    <Button variant="destructive" className="font-bold h-10 px-6">Destructive</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Form Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ds-input" className="font-semibold text-slate-700">Text Input</Label>
                    <Input id="ds-input" placeholder="텍스트 입력" className="h-10 bg-slate-50" />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="ds-check1" defaultChecked />
                    <label htmlFor="ds-check1" className="text-sm font-medium leading-none text-slate-600">Checked Checkbox</label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Interactions */}
          <section id="interactions" className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <CheckSquare className="w-5 h-5 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800">Interactions (인터랙션)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Modals & Dialogs</CardTitle>
                  <CardDescription>사용자 피드백 및 알림을 위한 모달 인터랙션</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start h-12 px-4 text-slate-700 bg-white hover:bg-slate-50 border-slate-200">
                    <span className="flex-1 text-left font-medium">다이얼로그 열기 (Dialog)</span>
                    <MousePointerClick className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 px-4 text-slate-700 bg-white hover:bg-slate-50 border-slate-200">
                    <span className="flex-1 text-left font-medium">하단 시트 열기 (Sheet)</span>
                    <MousePointerClick className="w-4 h-4 text-slate-400" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Toasts & Dropdowns</CardTitle>
                  <CardDescription>알림 메시지 및 팝오버 인터랙션</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start h-12 px-4 text-slate-700 bg-white hover:bg-slate-50 border-slate-200">
                    <span className="flex-1 text-left font-medium">성공 알림 띄우기 (Toast)</span>
                    <MousePointerClick className="w-4 h-4 text-slate-400" />
                  </Button>
                  
                  <Select defaultValue="option1">
                    <SelectTrigger className="w-full h-12 bg-slate-50 border-slate-200">
                      <SelectValue placeholder="드롭다운 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">옵션 1 (Hover 시 스타일 변화)</SelectItem>
                      <SelectItem value="option2">옵션 2 (클릭 시 액션)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </AdminLayout>
  );
}
