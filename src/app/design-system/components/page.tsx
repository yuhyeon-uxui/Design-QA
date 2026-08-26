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

          {/* QA Pin Mock - Interactive */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Interactive QA Pin (마커)</CardTitle>
              <CardDescription>화면을 클릭하여 핀을 추가하고 드래그하여 이동해보세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <InteractivePinArea />
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}

// Interactive Pin Area Component
import React, { useState, useRef } from "react";

function InteractivePinArea() {
  const [pins, setPins] = useState<{ id: number; x: number; y: number; isResolved: boolean }[]>([
    { id: 1, x: 33, y: 33, isResolved: false },
    { id: 2, x: 66, y: 50, isResolved: true },
  ]);
  const [draggingPinId, setDraggingPinId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent) => {
    // 핀을 드래그 중이거나 클릭한 대상이 핀 자체일 때는 무시
    if (draggingPinId !== null || (e.target as HTMLElement).closest('.qa-pin')) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin = {
      id: Date.now(),
      x,
      y,
      isResolved: false,
    };
    setPins([...pins, newPin]);
  };

  const handlePinMouseDown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingPinId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingPinId === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    // 영역 이탈 방지
    x = Math.max(0, Math.min(x, 100));
    y = Math.max(0, Math.min(y, 100));

    setPins(pins.map(pin => pin.id === draggingPinId ? { ...pin, x, y } : pin));
  };

  const handleMouseUp = () => {
    setDraggingPinId(null);
  };

  const togglePinStatus = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // 드래그 중이 아닐 때만 토글 (간단한 클릭 감지를 위해)
    setPins(pins.map(pin => pin.id === id ? { ...pin, isResolved: !pin.isResolved } : pin));
  };

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-64 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-crosshair select-none"
      >
        <p className="text-slate-400 font-medium absolute top-4 left-4 pointer-events-none">가상의 웹 화면 영역</p>
        
        {pins.map((pin, idx) => (
          <div
            key={pin.id}
            onMouseDown={(e) => handlePinMouseDown(pin.id, e)}
            onClick={(e) => togglePinStatus(pin.id, e)}
            className={`qa-pin absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center font-bold text-sm cursor-grab active:cursor-grabbing transition-colors
              ${pin.isResolved 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-white opacity-80 hover:opacity-100' 
                : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-2 ring-white ring-offset-2 ring-offset-rose-500/10 animate-in zoom-in'
              }
              ${draggingPinId === pin.id ? 'scale-110 shadow-xl opacity-100' : ''}
            `}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            {idx + 1}
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 text-sm font-medium text-slate-600 justify-center">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> 미해결 이슈 (생성됨)</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> 해결됨 (클릭 시 전환)</div>
      </div>
    </div>
  );
}
