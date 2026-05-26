"use client";

import { useState, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, Image as ImageIcon, LayoutGrid, CheckCircle2, Loader2, Link as LinkIcon, Trash2, Send, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: number;
  author: string;
  role: string;
  text: string;
  createdAt: string;
}

interface Pin {
  id: number;
  x: number;
  y: number;
  comments: Comment[];
}

const mockScreens = Array.from({ length: 30 }).map((_, i) => ({
  id: `s${i + 1}`,
  name: i === 0 ? "메인 홈 화면" : `상세 화면 ${i}`,
  issueCount: i % 5 === 0 ? 0 : Math.floor(Math.random() * 5) + 1,
}));

export default function QABoardPage() {
  const [activeScreenId, setActiveScreenId] = useState("s1");
  const [pins, setPins] = useState<Pin[]>([
    { id: 1, x: 30, y: 40, comments: [{ id: 1, author: "김철수", role: "Frontend", text: "이 부분 패딩값이 피그마랑 다른가요?", createdAt: "방금 전" }] },
    { id: 2, x: 60, y: 70, comments: [] },
  ]);
  const [activePinId, setActivePinId] = useState<number | null>(1);
  const [newComment, setNewComment] = useState("");

  const [figmaUrl, setFigmaUrl] = useState("");
  const [figmaImageUrl, setFigmaImageUrl] = useState<string | null>(null);
  const [isLoadingFigma, setIsLoadingFigma] = useState(false);
  const [figmaError, setFigmaError] = useState("");

  const activePin = pins.find(p => p.id === activePinId);

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newId = pins.length > 0 ? Math.max(...pins.map(p => p.id)) + 1 : 1;
    setPins([...pins, { id: newId, x, y, comments: [] }]);
    setActivePinId(newId);
  };

  const handleDeletePin = () => {
    if (!activePinId) return;
    setPins(pins.filter(p => p.id !== activePinId));
    setActivePinId(null);
  };

  const handleAddComment = () => {
    if (!activePinId || !newComment.trim()) return;
    setPins(pins.map(p => {
      if (p.id === activePinId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now(),
            author: "이영희", // Mock current user
            role: "Design",
            text: newComment,
            createdAt: "방금 전"
          }]
        };
      }
      return p;
    }));
    setNewComment("");
  };

  const fetchFigmaImage = async () => {
    if (!figmaUrl) return;
    setIsLoadingFigma(true);
    setFigmaError("");
    setFigmaImageUrl(null);

    try {
      const res = await fetch("/api/figma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: figmaUrl }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch image");
      setFigmaImageUrl(data.imageUrl);
    } catch (err: any) {
      setFigmaError(err.message);
    } finally {
      setIsLoadingFigma(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F4F7FB]">
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#1E3A8A] text-white rounded text-[10px] font-bold flex items-center justify-center">
              QA
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">동호회 앱 배포 전 최종 QA</h1>
              <p className="text-[11px] font-medium text-slate-500">App (iOS/Android) · 진행중</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 text-[#1E3A8A] border-[#1E3A8A]/20 hover:bg-[#EEF2FF]">
            <ExternalLink className="w-4 h-4" />
            피그마 프로젝트 열기
          </Button>
          <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
            QA 완료 보고서
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[240px] bg-white border-r flex flex-col shrink-0 z-10">
          <div className="h-12 border-b flex items-center px-4 bg-slate-50">
            <LayoutGrid className="w-4 h-4 text-slate-500 mr-2" />
            <span className="text-xs font-bold text-slate-700">전체 화면 ({mockScreens.length})</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {mockScreens.map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreenId(screen.id)}
                  className={`w-full text-left p-2 rounded-md flex items-center gap-3 transition-colors ${
                    activeScreenId === screen.id 
                      ? "bg-[#EEF2FF] border-[#1E3A8A]/20 border" 
                      : "hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <div className="w-10 h-16 bg-slate-200 rounded border shrink-0 overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${activeScreenId === screen.id ? 'text-[#1E3A8A]' : 'text-slate-700'}`}>
                      {screen.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                      {screen.issueCount === 0 ? (
                        <span className="text-emerald-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/>완료됨</span>
                      ) : (
                        <span className="text-rose-600 font-medium">잔여 이슈 {screen.issueCount}건</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex overflow-x-auto p-6 gap-6 relative">
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-sm mb-4">
              <div className="bg-white px-4 py-2 rounded-t-lg border-x border-t shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-xs font-bold text-slate-700">Figma 시안 (Expected)</span>
              </div>
              <div className="bg-white border-x border-b shadow-sm rounded-b-lg p-3 flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="피그마 프레임 링크 (node-id 포함)" 
                    className="h-8 pl-8 text-xs bg-slate-50"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchFigmaImage()}
                  />
                </div>
                <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700" onClick={fetchFigmaImage} disabled={isLoadingFigma || !figmaUrl}>
                  {isLoadingFigma ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  불러오기
                </Button>
              </div>
              {figmaError && <p className="text-[10px] text-red-500 mt-1.5 px-1">{figmaError}</p>}
            </div>

            <div className="w-full max-w-sm aspect-[9/19] bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center relative overflow-hidden">
              {isLoadingFigma ? (
                <div className="flex flex-col items-center text-purple-600">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-xs font-medium">피그마에서 이미지를 추출하는 중...</p>
                </div>
              ) : figmaImageUrl ? (
                <img src={figmaImageUrl} alt="Figma Render" className="w-full h-full object-contain" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50"></div>
                  <div className="text-center p-6 z-10">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-indigo-200" />
                    <p className="text-sm font-semibold text-slate-700">이미지가 없습니다</p>
                    <p className="text-xs mt-1 text-slate-500">상단에 피그마 링크를 입력하고<br/>불러오기 버튼을 눌러주세요.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-xs font-bold text-slate-700">테스트 화면 (Actual)</span>
              <span className="text-[10px] text-slate-400 ml-1">클릭하여 핀 추가</span>
            </div>
            <div className="w-full max-w-sm aspect-[9/19] bg-white border border-slate-200 shadow-sm rounded-xl relative overflow-hidden group">
              <div 
                className="absolute inset-0 cursor-crosshair bg-slate-50 transition-colors"
                onClick={handleImageClick}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                   <p className="text-sm font-semibold">수동 업로드된 캡처본</p>
                </div>
              </div>

              {pins.map((pin) => (
                <button
                  key={pin.id}
                  className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md transition-all ${
                    activePinId === pin.id 
                      ? "bg-[#1E3A8A] scale-110 ring-4 ring-[#1E3A8A]/20" 
                      : "bg-slate-800 hover:bg-[#1E3A8A]/80"
                  }`}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePinId(pin.id);
                  }}
                >
                  {pin.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[420px] bg-white border-l flex flex-col shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="h-12 border-b flex items-center justify-between px-6 bg-slate-50 shrink-0">
            <h2 className="font-bold text-sm text-slate-800">
              QA 이슈 상세 <span className="text-slate-400 font-normal ml-1">(Pin #{activePinId || '-'})</span>
            </h2>
            {activePinId && (
              <Button variant="ghost" size="sm" onClick={handleDeletePin} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 px-2">
                <Trash2 className="w-4 h-4 mr-1.5" />
                핀 삭제
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {activePinId && activePin ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                  
                  <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">개발자 전용</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                      컴포넌트 수치를 피그마에서 바로 확인하고 수정하세요.
                    </p>
                    <Link href={figmaUrl || "#"} target="_blank">
                      <Button size="sm" variant="outline" className="w-full h-8 text-xs font-semibold text-[#1E3A8A] border-[#1E3A8A]/30 hover:bg-[#EEF2FF]" disabled={!figmaUrl}>
                        <ExternalLink className="w-3 h-3 mr-1.5" />
                        피그마 Inspect 모드로 열기
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">이슈 유형</Label>
                    <Select defaultValue="layout">
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="layout">레이아웃 / 간격</SelectItem>
                        <SelectItem value="typography">타이포그래피</SelectItem>
                        <SelectItem value="interaction">인터랙션</SelectItem>
                        <SelectItem value="bug">오류 / 에러</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">문제점 설명</Label>
                    <Textarea placeholder="시안과 다르게 구현된 부분을 적어주세요." className="resize-none h-20 text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">수정 요청사항</Label>
                    <Textarea placeholder="어떻게 수정해야 하는지 구체적으로 적어주세요." className="resize-none h-20 text-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">우선순위</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High (크리티컬)</SelectItem>
                          <SelectItem value="medium">Medium (일반)</SelectItem>
                          <SelectItem value="low">Low (마이너)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">상태</Label>
                      <Select defaultValue="open">
                        <SelectTrigger className="h-9 text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">이슈발생</SelectItem>
                          <SelectItem value="fixing">확인/검토중</SelectItem>
                          <SelectItem value="fixed">수정완료</SelectItem>
                          <SelectItem value="done">완료됨</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold h-10 shadow-sm">
                    내용 저장하기
                  </Button>

                  {/* 댓글 (Comments) 섹션 */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      문의 및 코멘트 <span className="text-[#1E3A8A] bg-blue-50 px-1.5 py-0.5 rounded text-xs">{activePin.comments.length}</span>
                    </h3>
                    
                    <div className="space-y-4 mb-4">
                      {activePin.comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed">등록된 코멘트가 없습니다.</p>
                      ) : (
                        activePin.comments.map((comment) => (
                          <div key={comment.id} className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 text-xs">{comment.author}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${comment.role === 'Frontend' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                                  {comment.role}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed">{comment.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Input 
                        placeholder="이슈에 대해 문의할 내용을 입력하세요." 
                        className="text-xs h-9 bg-slate-50 border-slate-200"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <Button size="icon" className="h-9 w-9 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 shrink-0" onClick={handleAddComment}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">선택된 핀이 없습니다</p>
                  <p className="text-xs text-slate-500 mt-1">좌측 캡처 화면을 클릭해<br/>새 핀을 추가하세요.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
