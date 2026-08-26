"use client";

import { 
  Search, Plus, LayoutGrid, Layout, BarChart3, Palette, User, 
  LogOut, ArrowRight, ArrowLeft, CheckCircle2, ListTodo, Calendar, 
  Trash2, Menu, Activity, MousePointerClick 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function ComponentsPage() {
  return (
    <section className="space-y-12">
      <div className="flex items-center gap-2 border-b pb-2">
        <MousePointerClick className="w-5 h-5 text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-800">Components (컴포넌트)</h2>
      </div>
      
      {/* Basic Components */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">1. Basic UI Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6">Primary</Button>
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 font-bold h-10 px-6">Outline</Button>
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
                <Input id="ds-input" placeholder="텍스트 입력" className="h-10 bg-slate-50 border-slate-200" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="ds-check1" defaultChecked />
                <label htmlFor="ds-check1" className="text-sm font-medium leading-none text-slate-600">Checked Checkbox</label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Specific Components */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">2. Project Components (QA Hub 전용)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Project Card Mock */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Project Card</CardTitle>
              <CardDescription>대시보드 메인 화면의 프로젝트 항목 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 max-w-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 w-fit px-2 py-1 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  진행중
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Design System QA</h3>
                <p className="text-sm text-slate-500">최근 업데이트: 오늘</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <span className="text-slate-500">진행률</span>
                      <span className="font-bold text-primary ml-2">75%</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 font-semibold">
                    입장하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QA Pin Mock - Static Specs */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">QA Issue Pin (마커)</CardTitle>
              <CardDescription>화면 위에 찍히는 이슈 핀의 두 가지 상태</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-8">
                {/* Pending State */}
                <div className="flex items-center gap-6 p-4 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-rose-500/30 ring-2 ring-white ring-offset-2 ring-offset-rose-500/10">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">미해결 (Pending/Active)</h4>
                    <p className="text-sm text-slate-500">배경: rose-500, 애니메이션 효과 및 그림자 적용</p>
                  </div>
                </div>

                {/* Resolved State */}
                <div className="flex items-center gap-6 p-4 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/30 ring-2 ring-white">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">해결됨 (Resolved/Completed)</h4>
                    <p className="text-sm text-slate-500">배경: emerald-500, 정적인 형태</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Iconography */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">3. Iconography (사용한 아이콘)</h3>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Lucide React Icons</CardTitle>
            <CardDescription>프로젝트 전반에 걸쳐 사용된 주요 아이콘 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { name: "Search", icon: <Search className="w-6 h-6" /> },
                { name: "Plus", icon: <Plus className="w-6 h-6" /> },
                { name: "LayoutGrid", icon: <LayoutGrid className="w-6 h-6" /> },
                { name: "Layout", icon: <Layout className="w-6 h-6" /> },
                { name: "BarChart3", icon: <BarChart3 className="w-6 h-6" /> },
                { name: "Palette", icon: <Palette className="w-6 h-6" /> },
                { name: "User", icon: <User className="w-6 h-6" /> },
                { name: "LogOut", icon: <LogOut className="w-6 h-6" /> },
                { name: "ArrowRight", icon: <ArrowRight className="w-6 h-6" /> },
                { name: "ArrowLeft", icon: <ArrowLeft className="w-6 h-6" /> },
                { name: "CheckCircle2", icon: <CheckCircle2 className="w-6 h-6" /> },
                { name: "ListTodo", icon: <ListTodo className="w-6 h-6" /> },
                { name: "Calendar", icon: <Calendar className="w-6 h-6" /> },
                { name: "Trash2", icon: <Trash2 className="w-6 h-6" /> },
                { name: "Menu", icon: <Menu className="w-6 h-6" /> },
                { name: "Activity", icon: <Activity className="w-6 h-6" /> },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="text-slate-700">{item.icon}</div>
                  <span className="text-xs font-medium text-slate-500">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
