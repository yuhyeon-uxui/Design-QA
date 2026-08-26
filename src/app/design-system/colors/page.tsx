"use client";

import { Layers } from "lucide-react";

export default function ColorsPage() {
  return (
    <section className="space-y-6">
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
  );
}
