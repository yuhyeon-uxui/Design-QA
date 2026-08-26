"use client";

import { Type } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TypographyPage() {
  return (
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
  );
}
