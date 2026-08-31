"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiReportPage() {
  const [selectedWeek, setSelectedWeek] = useState("8월 4주차 (08.24 ~ 08.30)");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsReportReady(false);
    setTimeout(() => {
      setIsGenerating(false);
      setIsReportReady(true);
    }, 2000);
  };

  const weeks = [
    "8월 4주차 (08.24 ~ 08.30)",
    "8월 3주차 (08.17 ~ 08.23)",
    "8월 2주차 (08.10 ~ 08.16)",
    "8월 1주차 (08.03 ~ 08.09)",
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-xl">✨</span> AI 주간 QA 진단 리포트
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">분석 기간 선택</h2>
            <p className="text-sm text-slate-500">원하시는 주차를 선택하고 AI 진단을 시작해보세요.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <select 
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg h-11 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                value={selectedWeek}
                onChange={(e) => {
                  setSelectedWeek(e.target.value);
                  setIsReportReady(false);
                }}
              >
                {weeks.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg whitespace-nowrap shadow-sm"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  분석 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  진단하기
                </div>
              )}
            </Button>
          </div>
        </div>

        {!isGenerating && !isReportReady && (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">AI가 프로젝트의 흐름을 분석해드립니다</h3>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
              상단의 <strong>진단하기</strong> 버튼을 누르면 해당 주차에 발생한 모든 QA 데이터, 
              이슈 해결 패턴, 마감일 대비 진행률을 종합적으로 분석합니다.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-24 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">✨</div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">데이터를 엮어내고 있습니다...</h3>
            <p className="text-slate-500">정체구간 원인과 팀 효율을 다각도로 진단 중입니다.</p>
          </div>
        )}

        {isReportReady && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                {selectedWeek} 리포트
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm ring-1 ring-rose-50">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🚨</span>
                </div>
                <h3 className="text-lg font-bold text-rose-900 mb-4">정체구간 프로젝트 및 리소스 진단</h3>
                <div className="space-y-4">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    현재 <strong className="text-rose-600 bg-rose-50 px-1">사내 그룹웨어 리뉴얼 QA</strong> 프로젝트에 미해결 이슈의 65%가 집중되어 있습니다.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    특히 모바일 뷰(Mobile) 관련 이슈의 해결 속도가 눈에 띄게 저하되었습니다. 프론트엔드 개발자 리소스의 정체구간 현상이 의심되므로, 해당 프로젝트에 대한 즉각적인 리소스 재분배 혹은 마감일 연장을 권장합니다.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm ring-1 ring-emerald-50">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-lg font-bold text-emerald-900 mb-4">팀 전체 업무 효율 및 속도 평가</h3>
                <div className="space-y-4">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    전체 이슈 해결률이 72%로 전주 대비 <span className="text-emerald-600">5% 상승</span>했습니다.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    안정적인 해결 속도를 보이고 있으나, 3일 이상 아무런 상태 변화 없이 방치된 "유령 이슈"가 총 8건 존재합니다. 이번 주 금요일을 '버그 픽스 데이(Bug Fix Day)'로 지정하여 묵은 이슈들을 일괄 청산하는 것을 추천합니다.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-amber-100 shadow-sm ring-1 ring-amber-50">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🏷️</span>
                </div>
                <h3 className="text-lg font-bold text-amber-900 mb-4">자주 발생하는 에러 패턴 분석</h3>
                <div className="bg-amber-50/50 rounded-xl p-5 mb-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded mt-0.5">1위</span>
                      <p className="text-slate-700 text-sm font-medium">버튼 여백(Padding) 및 컴포넌트 간격 오류 (34건 반려)</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded mt-0.5">2위</span>
                      <p className="text-slate-700 text-sm font-medium">다크모드 색상 반전 누락 (21건 반려)</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded mt-0.5">3위</span>
                      <p className="text-slate-700 text-sm font-medium">글꼴 크기(Font-size) 불일치 (15건 반려)</p>
                    </li>
                  </ul>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  이번 주 가장 빈번하게 디자이너에게 반려(Re-open)된 항목들입니다. 공통 UI 컴포넌트의 디자인 시스템 동기화 상태를 프론트엔드 팀과 함께 점검해보는 것이 시급합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
