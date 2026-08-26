"use client";

import { MousePointerClick } from "lucide-react";
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

          {/* QA Pin Mock */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">QA Issue Pin (마커)</CardTitle>
              <CardDescription>화면 위에 찍히는 이슈 핀 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                <p className="text-slate-400 font-medium absolute top-4 left-4">가상의 웹 화면 영역</p>
                
                {/* Unresolved Pin */}
                <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-rose-500/30 ring-2 ring-white ring-offset-2 ring-offset-rose-500/10 cursor-pointer animate-bounce">
                  1
                </div>

                {/* Resolved Pin */}
                <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/30 ring-2 ring-white cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                  2
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm font-medium text-slate-600 justify-center">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> 미해결 이슈</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> 해결됨</div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
