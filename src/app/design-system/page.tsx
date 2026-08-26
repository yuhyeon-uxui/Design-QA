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
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <Layers className="w-5 h-5 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800">Colors (색상)</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-[#0064fa] shadow-sm border flex items-end p-3">
                  <span className="text-white font-mono text-sm font-bold">#0064fa</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Primary (Brand)</p>
                  <p className="text-sm text-slate-500">주요 버튼, 강조색, 활성화 상태</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-[#F8FAFC] shadow-sm border border-slate-200 flex items-end p-3">
                  <span className="text-slate-600 font-mono text-sm font-bold">#F8FAFC</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Background</p>
                  <p className="text-sm text-slate-500">앱 기본 배경색 (slate-50)</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-emerald-500 shadow-sm border flex items-end p-3">
                  <span className="text-white font-mono text-sm font-bold">#10b981</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Success</p>
                  <p className="text-sm text-slate-500">완료 상태, 성공 메시지</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-rose-500 shadow-sm border flex items-end p-3">
                  <span className="text-white font-mono text-sm font-bold">#f43f5e</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Danger / Error</p>
                  <p className="text-sm text-slate-500">경고, 에러 메시지, 진행중 상태</p>
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-6">
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

          {/* Buttons */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <MousePointerClick className="w-5 h-5 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800">Buttons (버튼)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Primary & Outline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button className="bg-[#0064fa] hover:bg-[#0064fa]/90 text-white font-bold h-10 px-6">Primary Button</Button>
                    <Button className="bg-[#0064fa] hover:bg-[#0064fa]/90 text-white font-bold h-10 px-6 opacity-50 cursor-not-allowed">Disabled</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-10 px-6">Outline Button</Button>
                    <Button variant="outline" className="border-[#0064fa]/30 text-[#0064fa] hover:bg-[#EEF2FF] font-bold h-10 px-6">Brand Outline</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Ghost & Destructive</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium h-10 px-6">Ghost Button</Button>
                    <Button variant="ghost" className="text-[#0064fa] hover:text-[#0064fa] hover:bg-[#EEF2FF] font-medium h-10 px-6">Brand Ghost</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="destructive" className="bg-rose-500 hover:bg-rose-600 font-bold h-10 px-6">Destructive</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Form Controls */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <CheckSquare className="w-5 h-5 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800">Form Controls (입력 폼)</h2>
            </div>
            
            <Card className="shadow-sm">
              <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ds-input" className="font-semibold text-slate-700">Text Input (Default)</Label>
                    <Input id="ds-input" placeholder="텍스트를 입력하세요" className="h-11 bg-slate-50 border-slate-200" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ds-input-error" className="font-semibold text-slate-700">Text Input (Error)</Label>
                    <Input id="ds-input-error" value="잘못된 입력값" className="h-11 bg-slate-50 border-rose-500 focus-visible:ring-rose-500" readOnly />
                    <p className="text-xs text-rose-500 font-medium mt-1">올바른 값을 입력해주세요.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">Select Dropdown</Label>
                    <Select defaultValue="option1">
                      <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="옵션 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">디자인 1팀</SelectItem>
                        <SelectItem value="option2">개발팀</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="font-semibold text-slate-700 block mb-2">Checkboxes</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ds-check1" defaultChecked />
                      <label htmlFor="ds-check1" className="text-sm font-medium leading-none text-slate-600">Checked state</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ds-check2" />
                      <label htmlFor="ds-check2" className="text-sm font-medium leading-none text-slate-600">Unchecked state</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </AdminLayout>
  );
}
