"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiReportPage() {
  const weeks = [
    { label: "9월 1주차 (09.01 ~ 09.07) - 이번 주", value: "w5", isReady: false },
    { label: "8월 4주차 (08.24 ~ 08.30) - 지난 주", value: "w4", isReady: true },
    { label: "8월 3주차 (08.17 ~ 08.23)", value: "w3", isReady: true },
    { label: "8월 2주차 (08.10 ~ 08.16)", value: "w2", isReady: true },
    { label: "8월 1주차 (08.03 ~ 08.09)", value: "w1", isReady: true },
  ];

  const [selectedWeek, setSelectedWeek] = useState("w4");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReportReady, setIsReportReady] = useState(true);

  const selectedWeekData = weeks.find(w => w.value === selectedWeek);

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsReportReady(false);
    setTimeout(() => {
      setIsGenerating(false);
      setIsReportReady(true);
    }, 2000);
  };

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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <button 
              onClick={() => {
                const currentIndex = weeks.findIndex(w => w.value === selectedWeek);
                if (currentIndex < weeks.length - 1) {
                  const nextWeek = weeks[currentIndex + 1];
                  setSelectedWeek(nextWeek.value);
                  setIsReportReady(nextWeek.isReady);
                }
              }}
              disabled={weeks.findIndex(w => w.value === selectedWeek) === weeks.length - 1}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="w-64 text-center">
              <span className="text-[15px] font-bold text-slate-800">{selectedWeekData?.label}</span>
            </div>

            <button 
              onClick={() => {
                const currentIndex = weeks.findIndex(w => w.value === selectedWeek);
                if (currentIndex > 0) {
                  const prevWeek = weeks[currentIndex - 1];
                  setSelectedWeek(prevWeek.value);
                  setIsReportReady(prevWeek.isReady);
                }
              }}
              disabled={weeks.findIndex(w => w.value === selectedWeek) === 0}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {selectedWeekData?.isReady && (
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-slate-400 font-medium">
                마지막 업데이트: 8/25(월) 00:03
              </span>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-[13px] font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
              >
                {isGenerating ? (
                  <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                다시 분석하기
              </button>
            </div>
          )}
        </div>

        {!isGenerating && !isReportReady && (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">이번 주 리포트가 아직 생성되지 않았어요</h3>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
              이번 주 리포트는 일요일 밤 11시 59분에 <strong>자동으로 배치 생성</strong>됩니다.
              <br/>과거 리포트는 상단 드롭다운에서 바로 확인하실 수 있습니다.
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
                {selectedWeekData?.label.split(' - ')[0]} 리포트
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* 1. 팀 전체 요약 (Banner) */}
              <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100 shadow-sm ring-1 ring-emerald-500/10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📈</span>
                    <h3 className="text-lg font-bold text-emerald-900">팀 전체 업무 효율 및 속도 평가</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    안정적인 해결 속도를 보이고 있으나, 3일 이상 아무런 상태 변화 없이 방치된 "유령 이슈"가 총 8건 존재합니다. 이번 주 금요일을 '버그 픽스 데이(Bug Fix Day)'로 지정하여 묵은 이슈들을 일괄 청산하는 것을 추천합니다.
                  </p>
                </div>
                <div className="bg-white/60 p-5 rounded-xl border border-emerald-100/50 min-w-[240px] flex flex-col justify-center">
                  <p className="text-sm font-semibold text-emerald-800 mb-1">전체 이슈 해결률</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-emerald-600">72%</span>
                    <span className="text-sm font-bold text-emerald-500 bg-emerald-100/50 px-2 py-0.5 rounded-full">전주 대비 +5%</span>
                  </div>
                </div>
              </div>

              {/* 2. 정체구간 진단 (Left) */}
              <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm ring-1 ring-rose-50 flex flex-col">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🚨</span>
                </div>
                <h3 className="text-lg font-bold text-rose-900 mb-4">정체구간 프로젝트 및 리소스 진단</h3>
                <div className="space-y-4 flex-1">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    현재 <strong className="text-rose-600 bg-rose-50 px-1">사내 그룹웨어 리뉴얼 QA</strong> 프로젝트에 미해결 이슈의 65%가 집중되어 있습니다.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    특히 모바일 뷰(Mobile) 관련 이슈의 해결 속도가 눈에 띄게 저하되었습니다. 프론트엔드 개발자 리소스의 정체구간 현상이 의심되므로, 해당 프로젝트에 대한 즉각적인 리소스 재분배 혹은 마감일 연장을 권장합니다.
                  </p>
                </div>
              </div>

              {/* 3. 자주 발생하는 이슈 패턴 (Right) */}
              <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm ring-1 ring-amber-50 flex flex-col">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🏷️</span>
                </div>
                <h3 className="text-lg font-bold text-amber-900 mb-4">자주 발생하는 이슈 패턴</h3>
                
                <div className="space-y-5 mb-6 flex-1">
                  {/* 1위 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-200 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded">1위</span>
                        <p className="text-slate-700 text-sm font-semibold">버튼 여백 및 컴포넌트 간격</p>
                      </div>
                      <span className="text-xs font-bold text-amber-600">34건 (48%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>

                  {/* 2위 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-1.5 py-0.5 rounded">2위</span>
                        <p className="text-slate-700 text-sm font-semibold">다크모드 색상 반전 누락</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500">21건 (30%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-300 h-full rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  {/* 3위 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100/50 text-amber-700/60 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-200/50">3위</span>
                        <p className="text-slate-700 text-sm font-semibold">글꼴 크기(Font-size) 불일치</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">15건 (21%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-200/60 h-full rounded-full" style={{ width: '21%' }}></div>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-500 text-xs leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  이번 주 가장 빈번하게 디자이너에게 반려(Re-open)된 항목들입니다. 공통 UI 컴포넌트의 디자인 시스템 동기화 점검이 시급합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
