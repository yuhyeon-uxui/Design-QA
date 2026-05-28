"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, Image as ImageIcon, LayoutGrid, CheckCircle2, Loader2, Link as LinkIcon, Trash2, Send, MessageSquare, UploadCloud, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  width?: number;
  height?: number;
  comments: Comment[];
  device?: string;
  issueType?: string;
  language?: string;
  description?: string;
  request?: string;
  priority?: string;
  status?: string;
}
const PRESET_MEMBERS = [
  { id: "d1", name: "안유현 대리", role: "Design" },
  { id: "d2", name: "고승신 대리", role: "Design" },
  { id: "d3", name: "이한비 대리", role: "Design" },
  { id: "d4", name: "채수림 이사", role: "Design" },
  { id: "v1", name: "김나현 대리", role: "Dev" },
  { id: "v2", name: "이보원 대리", role: "Dev" },
  { id: "v3", name: "유호준 차장", role: "Dev" },
  { id: "v4", name: "윤서진 과장", role: "Dev" },
  { id: "v5", name: "김성호 과장", role: "Dev" },
  { id: "v6", name: "박현주 주임", role: "Dev" },
  { id: "v7", name: "배은덕 부장", role: "Dev" },
  { id: "v8", name: "정시영 과장", role: "Dev" },
];

interface ScreenDeviceState {
  actualImage: string | null;
  figmaUrl: string;
  figmaImageUrl: string | null;
  pins: Pin[];
  activePinId: number | null;
}

interface ScreenData {
  id: string;
  name: string;
  issueCount: number;
  PC: ScreenDeviceState;
  Mobile: ScreenDeviceState;
}

const emptyDeviceState: ScreenDeviceState = {
  actualImage: null,
  figmaUrl: "",
  figmaImageUrl: null,
  pins: [],
  activePinId: null
};

const INITIAL_SCREENS: ScreenData[] = [{
  id: `s1`,
  name: "새로운 화면",
  issueCount: -1,
  PC: { ...emptyDeviceState },
  Mobile: { ...emptyDeviceState }
}];

export default function QABoardPage() {
  const params = useParams();
  const [projectTitle, setProjectTitle] = useState("");
  const [projectPlatform, setProjectPlatform] = useState("");
  const isAppProject = projectPlatform ? projectPlatform.includes("App") : params.id === "p2";
  const [screens, setScreens] = useState(INITIAL_SCREENS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!params.id) return;
    
    // Load screen data
    const unsubscribeScreens = onSnapshot(collection(db, "project_screens", params.id as string, "screens"), (snapshot) => {
      if (!snapshot.empty) {
        const loaded = snapshot.docs.map(d => d.data() as ScreenData);
        loaded.sort((a, b) => parseInt(a.id.replace('s','')) - parseInt(b.id.replace('s','')));
        setScreens(loaded);
      } else {
        setScreens(INITIAL_SCREENS);
      }
    });

    // Load project details
    getDoc(doc(db, "projects", params.id as string)).then((docSnap) => {
      if (docSnap.exists()) {
        const currentProject = docSnap.data();
        setProjectTitle(currentProject.name);
        setProjectPlatform(currentProject.platform);
      } else {
        if (params.id === "p1") {
          setProjectTitle("인바운드 웹사이트 디자인 QA 1차");
          setProjectPlatform("Web (반응형)");
        } else if (params.id === "p2") {
          setProjectTitle("동호회 앱 배포 전 최종 QA");
          setProjectPlatform("App (iOS/Android)");
        }
      }
    });

    return () => unsubscribeScreens();
  }, [params.id]);

  useEffect(() => {
    if (isMounted && params.id) {
      // Just fetch project details if needed, onSnapshot handles screen loading
    }
  }, [params.id, isMounted]);

  const compressAndSetImage = (dataUrl: string) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85); // 고화질 적용
        updateActiveDeviceState({ actualImage: compressedDataUrl });
      }
    };
    img.src = dataUrl;
  };

  const [activeScreenId, setActiveScreenId] = useState("s1");
  const [currentMemberId, setCurrentMemberId] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
  const filteredMembers = PRESET_MEMBERS.filter(m => m.name.includes(authorSearch) || m.role.toLowerCase().includes(authorSearch.toLowerCase()));
  type Device = "PC" | "Mobile";
  const [device, setDevice] = useState<Device>("PC");

  const activeScreenIndex = screens.findIndex(s => s.id === activeScreenId);
  const activeScreen = activeScreenIndex >= 0 ? screens[activeScreenIndex] : screens[0];
  const activeDeviceState = activeScreen[device];

  const updateActiveDeviceState = (updates: Partial<ScreenDeviceState>) => {
    setScreens(prev => {
      const nextScreens = prev.map(s => {
        if (s.id === activeScreenId) {
          const updatedDeviceState = { ...s[device], ...updates };
          const newScreen = { ...s, [device]: updatedDeviceState };
          
          const allPins = [...(newScreen.PC?.pins || []), ...(newScreen.Mobile?.pins || [])];
          if (allPins.length > 0) {
            newScreen.issueCount = allPins.filter(p => p.status !== "완료됨").length;
          } else {
            newScreen.issueCount = -1;
          }
          
          if (params.id) {
            setDoc(doc(db, "project_screens", params.id as string, "screens", newScreen.id), newScreen, { merge: true }).catch(console.error);
          }
          return newScreen;
        }
        return s;
      });

      if (params.id) {
        let totalIssues = 0;
        let totalCompleted = 0;
        nextScreens.forEach(screen => {
          const allPins = [...(screen.PC?.pins || []), ...(screen.Mobile?.pins || [])];
          totalIssues += allPins.length;
          totalCompleted += allPins.filter(p => p.status === "완료됨").length;
        });
        setDoc(doc(db, "projects", params.id as string), {
          screensCount: nextScreens.length,
          issuesCount: totalIssues,
          completedCount: totalCompleted,
        }, { merge: true }).catch(console.error);
      }
      
      return nextScreens;
    });
  };

  const actualImage = activeDeviceState.actualImage;
  const setActualImage = (url: string | null) => updateActiveDeviceState({ actualImage: url });

  const figmaUrl = activeDeviceState.figmaUrl;
  const setFigmaUrl = (url: string) => updateActiveDeviceState({ figmaUrl: url });

  const figmaImageUrl = activeDeviceState.figmaImageUrl;
  const setFigmaImageUrl = (url: string | null) => updateActiveDeviceState({ figmaImageUrl: url });

  const pins = activeDeviceState.pins;
  const setPins = (newPins: Pin[] | ((prev: Pin[]) => Pin[])) => {
    updateActiveDeviceState({
      pins: typeof newPins === "function" ? newPins(pins) : newPins
    });
  };

  const activePinId = activeDeviceState.activePinId;
  const setActivePinId = (id: number | null) => updateActiveDeviceState({ activePinId: id });

  const activePin = pins.find(p => p.id === activePinId);
  const [localForm, setLocalForm] = useState<Partial<Pin>>({});

  useEffect(() => {
    if (activePin) {
      setLocalForm({
        device: activePin.device || "PC/Mobile 공통",
        issueType: activePin.issueType || "레이아웃/간격",
        language: activePin.language || "한국어 (KR)",
        description: activePin.description || "",
        request: activePin.request || "",
        priority: activePin.priority || "High (크리티컬)",
        status: activePin.status || "이슈발생"
      });
    } else {
      setLocalForm({});
    }
  }, [activePinId]);

  const handleSavePinDetails = () => {
    if (!activePinId) return;

    if (!localForm.description?.trim()) {
      toast.error("문제점 설명을 입력해주세요.", { id: "save-error" });
      return;
    }

    setPins(pins.map(p => p.id === activePinId ? { ...p, ...localForm } : p));
    toast.success("내용 저장완료!", { id: "save-success" });
  };

  const [newComment, setNewComment] = useState("");
  const [isLoadingFigma, setIsLoadingFigma] = useState(false);
  const [figmaError, setFigmaError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 클립보드 붙여넣기 기능
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                compressAndSetImage(event.target.result as string);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, activeScreenId]);

  // removed activePin find here since it was moved up
  const totalScreens = screens.length;
  const completedScreens = screens.filter(s => s.issueCount === 0).length;
  const progressRate = totalScreens > 0 ? Math.round((completedScreens / totalScreens) * 100) : 0;

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{x: number, y: number} | null>(null);
  const [currentRect, setCurrentRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!actualImage) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentRect({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, currentX));
    const clampedY = Math.max(0, Math.min(100, currentY));

    setCurrentRect({
      x: Math.min(drawStart.x, clampedX),
      y: Math.min(drawStart.y, clampedY),
      w: Math.abs(clampedX - drawStart.x),
      h: Math.abs(clampedY - drawStart.y)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;
    setIsDrawing(false);
    
    const newId = pins.length > 0 ? Math.max(...pins.map(p => p.id)) + 1 : 1;
    setPins([...pins, { id: newId, x: currentRect.x, y: currentRect.y, width: currentRect.w, height: currentRect.h, comments: [] }]);
    setActivePinId(newId);
    
    setDrawStart(null);
    setCurrentRect(null);
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
       handleMouseUp();
    }
  };

  const handleDeletePin = () => {
    if (!activePinId) return;
    setPins(pins.filter(p => p.id !== activePinId));
    setActivePinId(null);
  };

  const handleAddComment = () => {
    if (!activePinId || !newComment.trim()) return;
    
    const currentUser = PRESET_MEMBERS.find(m => m.id === currentMemberId);
    if (!currentUser) {
      alert("작성자를 먼저 검색하고 선택해주세요.");
      return;
    }

    setPins(pins.map(p => {
      if (p.id === activePinId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now(),
            author: currentUser.name,
            role: currentUser.role,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          compressAndSetImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F4F7FB]">
      <header className="h-16 border-b bg-white px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 w-10 h-10 rounded-full">
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#1E3A8A] text-white rounded-md text-xs font-bold flex items-center justify-center">
              QA
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-3">
                {projectTitle || (isAppProject ? "동호회 앱 배포 전 최종 QA" : "인바운드 웹사이트 디자인 QA 1차")}
                {!isAppProject && (
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 ml-2">
                    <button
                      onClick={() => setDevice("PC")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        device === "PC" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> PC
                    </button>
                    <button
                      onClick={() => setDevice("Mobile")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        device === "Mobile" ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                  </div>
                )}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs font-medium text-slate-500">{projectPlatform || (isAppProject ? "App (iOS/Android)" : "Web (반응형)")} · 진행중</p>
                <div className="flex items-center gap-2 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressRate}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">{progressRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 text-[#1E3A8A] border-[#1E3A8A]/20 hover:bg-[#EEF2FF] h-9">
            <ExternalLink className="w-4 h-4" />
            피그마 프로젝트 열기
        </div>
      </header>

      {/* Main Content Area - 레이아웃 간격 넓힘 (p-4 gap-4 추가) */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        
        {/* Leftmost: Screen Thumbnail Sidebar */}
        <div className="w-[260px] bg-white border rounded-xl flex flex-col shrink-0 shadow-sm overflow-hidden">
          <div className="h-14 border-b flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
            <div className="flex items-center">
              <LayoutGrid className="w-5 h-5 text-[#1E3A8A] mr-3" />
              <span className="text-sm font-bold text-slate-800">전체 화면 ({screens.length})</span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-200" onClick={() => {
              const newId = `s${Date.now()}`;
              const newScreen = { id: newId, name: "새로운 화면", issueCount: -1, PC: { ...emptyDeviceState }, Mobile: { ...emptyDeviceState } };
              
              setScreens(prev => {
                const nextScreens = [newScreen, ...prev];
                if (params.id) {
                  setDoc(doc(db, "project_screens", params.id as string, "screens", newId), newScreen, { merge: true }).catch(console.error);
                  
                  let totalIssues = 0;
                  let totalCompleted = 0;
                  nextScreens.forEach(s => {
                    const allPins = [...(s.PC?.pins || []), ...(s.Mobile?.pins || [])];
                    totalIssues += allPins.length;
                    totalCompleted += allPins.filter(p => p.status === "완료됨").length;
                  });
                  setDoc(doc(db, "projects", params.id as string), {
                    screensCount: nextScreens.length,
                    issuesCount: totalIssues,
                    completedCount: totalCompleted,
                  }, { merge: true }).catch(console.error);
                }
                return nextScreens;
              });
              setActiveScreenId(newId);
            }}>
              <span className="text-lg leading-none">+</span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-1.5">
              {screens.map((screen) => (
                <div key={screen.id} className="relative group">
                  <button
                    onClick={() => setActiveScreenId(screen.id)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors pr-8 ${
                      activeScreenId === screen.id 
                        ? "bg-[#EEF2FF] border-[#1E3A8A]/20 border ring-1 ring-[#1E3A8A]/10 shadow-sm" 
                        : "hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <div className="w-11 h-16 bg-slate-200 rounded border shrink-0 overflow-hidden relative">
                       {screen[device].actualImage ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={screen[device].actualImage!} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200"></div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${activeScreenId === screen.id ? 'text-[#1E3A8A]' : 'text-slate-700'}`}>
                        {screen.name}
                      </p>
                      <div className="mt-1.5">
                        {screen.issueCount === -1 ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>확인 대기
                          </span>
                        ) : screen.issueCount === 0 ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 mr-1"/>완료됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                            잔여 이슈 {screen.issueCount}건
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  {screens.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScreens(prev => {
                          const nextScreens = prev.filter(s => s.id !== screen.id);
                          if (params.id) {
                            deleteDoc(doc(db, "project_screens", params.id as string, "screens", screen.id)).catch(console.error);
                            
                            let totalIssues = 0;
                            let totalCompleted = 0;
                            nextScreens.forEach(s => {
                              const allPins = [...(s.PC?.pins || []), ...(s.Mobile?.pins || [])];
                              totalIssues += allPins.length;
                              totalCompleted += allPins.filter(p => p.status === "완료됨").length;
                            });
                            setDoc(doc(db, "projects", params.id as string), {
                              screensCount: nextScreens.length,
                              issuesCount: totalIssues,
                              completedCount: totalCompleted,
                            }, { merge: true }).catch(console.error);
                          }
                          return nextScreens;
                        });
                        
                        if (activeScreenId === screen.id) {
                          setActiveScreenId(screens.find(s => s.id !== screen.id)?.id || "");
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Split View (Figma vs Capture) */}
        {(() => {
          const isWidePCLayout = device === 'PC' && !isAppProject;
          const wrapperClass = isWidePCLayout ? "flex-col overflow-y-auto gap-8 pb-12 px-8 items-center" : "flex-row overflow-x-auto gap-8 pb-2";
          const maxWClass = isWidePCLayout ? "max-w-5xl" : "max-w-[420px]";
          const aspectClass = isWidePCLayout ? "aspect-[16/9]" : "aspect-[9/19]";
          const headerContainerClass = isWidePCLayout ? "w-full mb-3 flex flex-col justify-end" : "w-full mb-5 h-[120px] flex flex-col justify-end";

          return (
            <div className={`flex-1 flex relative ${wrapperClass}`}>
              
              {/* Figma View (API Fetch Area) */}
              <div className={`flex flex-col items-center w-full order-2 ${isWidePCLayout ? 'flex-none' : 'flex-1'}`}>
                <div className={`${isWidePCLayout ? 'w-full mb-3 flex flex-col justify-end' : 'w-full mb-5 h-[120px] flex flex-col justify-end'} ${maxWClass}`}>
              <div className="bg-white px-5 py-3 rounded-t-xl border-x border-t shadow-sm flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></span>
                <span className="text-sm font-bold text-slate-800">Figma 시안 (Expected)</span>
              </div>
              <div className="bg-white border-x border-b shadow-sm rounded-b-xl p-4 flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="피그마 프레임 링크 (node-id 포함)" 
                    className="h-9 pl-9 text-xs bg-slate-50 border-slate-200 focus-visible:ring-purple-500/30"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchFigmaImage()}
                  />
                </div>
                <Button size="sm" className="h-9 text-xs font-semibold bg-purple-600 hover:bg-purple-700 shadow-sm px-4" onClick={fetchFigmaImage} disabled={isLoadingFigma || !figmaUrl}>
                  {isLoadingFigma ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
                  불러오기
                </Button>
              </div>
              {figmaError && <p className="text-xs font-medium text-red-500 mt-2 px-1">{figmaError}</p>}
            </div>

            <div className={`w-full bg-white border border-slate-200 shadow-md rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-black/5 ${maxWClass} ${aspectClass}`}>
              {isLoadingFigma ? (
                <div className="flex flex-col items-center text-purple-600">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-xs font-bold">피그마에서 이미지를 추출하는 중...</p>
                </div>
              ) : figmaImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={figmaImageUrl} alt="Figma Render" className="w-full h-full object-contain" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-purple-50/40"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-purple-100">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">피그마 시안 렌더링 영역</h3>
                    <p className="text-xs mt-2 text-slate-500 leading-relaxed">상단에 피그마 링크를 입력하고<br/>불러오기 버튼을 눌러주세요.</p>
                    <div className="h-10 mt-6" aria-hidden="true"></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actual Capture View */}
          <div className={`flex flex-col items-center w-full order-1 ${isWidePCLayout ? 'flex-none' : 'flex-1'}`}>
            <div className={`${headerContainerClass} ${maxWClass}`}>
              <div className="bg-white px-5 py-3 rounded-xl border shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span>
                  <span className="text-sm font-bold text-slate-800">테스트 화면 (Actual)</span>
                </div>
                {actualImage && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">클릭하여 핀 추가</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => fileInputRef.current?.click()}>
                      이미지 다시 올리기
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <div className={`w-full bg-white border border-slate-200 shadow-md rounded-2xl relative overflow-hidden group ring-1 ring-black/5 ${maxWClass} ${aspectClass}`}>
              {!actualImage ? (
                // 파일 업로드 UI
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center hover:bg-slate-100 transition-colors">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-100 cursor-pointer hover:scale-105 transition-transform" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">테스트 화면 업로드</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    실제 구현된 앱/웹의 캡처 화면을<br/>이곳에 업로드해 주세요.
                  </p>
                  <Button className="mt-6 font-bold bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-sm" onClick={() => fileInputRef.current?.click()}>
                    내 PC에서 파일 찾기
                  </Button>
                </div>
              ) : (
                // 캡처 이미지 및 핀 영역
                <div 
                  className="absolute inset-0 cursor-crosshair bg-slate-100"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onDragStart={(e) => e.preventDefault()}
                  draggable={false}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={actualImage} alt="Actual Upload" className="w-full h-full object-contain pointer-events-none select-none" draggable={false} />
                  
                  {isDrawing && currentRect && (
                    <div 
                      className="absolute border-2 border-rose-500 border-dashed bg-rose-500/10 z-30 pointer-events-none"
                      style={{
                        left: `${currentRect.x}%`,
                        top: `${currentRect.y}%`,
                        width: `${currentRect.w}%`,
                        height: `${currentRect.h}%`,
                      }}
                    />
                  )}
                </div>
              )}

              {/* Pins overlay */}
              {actualImage && pins.map((pin) => {
                const isBox = pin.width !== undefined && pin.height !== undefined && pin.width > 0.5 && pin.height > 0.5;
                const isActive = activePinId === pin.id;
                
                return (
                  <div
                    key={pin.id}
                    className="absolute z-10 group"
                    style={{ 
                      left: `${pin.x}%`, 
                      top: `${pin.y}%`,
                      width: isBox ? `${pin.width}%` : undefined,
                      height: isBox ? `${pin.height}%` : undefined,
                    }}
                  >
                    {isBox ? (
                      <div 
                        className={`w-full h-full border-2 border-dashed transition-all cursor-pointer ${
                          isActive ? 'border-rose-600 bg-rose-600/20 z-20' : 'border-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                        }`}
                        onClick={(e) => { e.stopPropagation(); setActivePinId(pin.id); }}
                      >
                        <div 
                          className={`absolute -left-3 -top-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-all ${
                            isActive ? "bg-emerald-600 scale-110 ring-2 ring-white" : "bg-emerald-500 ring-2 ring-white"
                          }`}
                        >
                          {pin.id}
                        </div>
                      </div>
                    ) : (
                      <button
                        className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-all ring-2 ring-white ${
                          isActive 
                            ? "bg-emerald-600 scale-110 ring-4 ring-emerald-600/30 z-20" 
                            : "bg-emerald-500 hover:bg-emerald-600 hover:scale-105 z-10"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePinId(pin.id);
                        }}
                      >
                        {pin.id}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )
        })()}

        {/* Right: Issue Form Panel */}
        <div className="w-[420px] bg-white border rounded-xl flex flex-col shrink-0 shadow-sm z-10 overflow-hidden">
          <div className="h-16 border-b flex items-center justify-between px-6 bg-slate-50 shrink-0">
            <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#1E3A8A] rounded-full"></div>
              QA 이슈 상세 <span className="text-slate-400 font-medium ml-1 text-sm">(Pin #{activePinId || '-'})</span>
            </h2>
            {activePinId && (
              <Button variant="ghost" size="sm" onClick={handleDeletePin} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 px-2.5 font-bold">
                <Trash2 className="w-4 h-4 mr-1.5" />
                핀 삭제
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
              {activePinId && activePin ? (
                <div className="space-y-7 animate-in fade-in slide-in-from-right-2 duration-200">
                  
                  <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">개발자 전용</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      컴포넌트 수치를 피그마에서 바로 확인하고 수정하세요.
                    </p>
                    <Link href={figmaUrl || "#"} target="_blank">
                      <Button size="sm" variant="outline" className="w-full h-9 text-xs font-bold text-[#1E3A8A] border-[#1E3A8A]/30 hover:bg-[#EEF2FF]" disabled={!figmaUrl}>
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        피그마 Inspect 모드로 열기
                      </Button>
                    </Link>
                  </div>

                  {!isAppProject && (
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">디바이스</Label>
                      <Select value={localForm.device || "PC/Mobile 공통"} onValueChange={(val) => val && setLocalForm({...localForm, device: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium border-blue-200 focus:ring-blue-500">
                          <SelectValue placeholder="발생 기기 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PC/Mobile 공통"><span className="font-semibold text-blue-700">PC / Mobile 공통 이슈</span></SelectItem>
                          <SelectItem value="PC 전용">💻 PC 전용 이슈</SelectItem>
                          <SelectItem value="Mobile 전용">📱 Mobile 전용 이슈</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">이슈 유형</Label>
                      <Select value={localForm.issueType || "레이아웃/간격"} onValueChange={(val) => val && setLocalForm({...localForm, issueType: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium">
                          <SelectValue placeholder="유형 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="레이아웃/간격">레이아웃 / 간격</SelectItem>
                          <SelectItem value="타이포그래피">타이포그래피</SelectItem>
                          <SelectItem value="인터랙션">인터랙션</SelectItem>
                          <SelectItem value="오류/에러">오류 / 에러</SelectItem>
                          <SelectItem value="기타">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">적용 언어(다국어)</Label>
                      <Select value={localForm.language || "한국어 (KR)"} onValueChange={(val) => val && setLocalForm({...localForm, language: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium">
                          <SelectValue placeholder="언어 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="한국어 (KR)">한국어 (KR)</SelectItem>
                          <SelectItem value="영어 (EN)">영어 (EN)</SelectItem>
                          <SelectItem value="일본어 (JP)">일본어 (JP)</SelectItem>
                          <SelectItem value="중국어 (CN)">중국어 (CN)</SelectItem>
                          <SelectItem value="공통 (All)">공통 (All)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-800">문제점 설명</Label>
                    <Textarea 
                      placeholder="시안과 다르게 구현된 부분을 적어주세요." 
                      className="resize-none h-24 text-sm bg-slate-50/50" 
                      value={localForm.description || ""}
                      onChange={(e) => setLocalForm({...localForm, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-800">수정 요청사항</Label>
                    <Textarea 
                      placeholder="어떻게 수정해야 하는지 구체적으로 적어주세요." 
                      className="resize-none h-24 text-sm bg-slate-50/50" 
                      value={localForm.request || ""}
                      onChange={(e) => setLocalForm({...localForm, request: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">우선순위</Label>
                      <Select value={localForm.priority || "High (크리티컬)"} onValueChange={(val) => val && setLocalForm({...localForm, priority: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium">
                          <div className="flex items-center gap-2">
                            {localForm.priority === "High (크리티컬)" && <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0"></span>}
                            {localForm.priority === "Medium (일반)" && <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0"></span>}
                            {localForm.priority === "Low (마이너)" && <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>}
                            <span className="flex-1 text-left line-clamp-1">{localForm.priority || "우선순위 선택"}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High (크리티컬)">
                            <div className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0"></span>
                              High (크리티컬)
                            </div>
                          </SelectItem>
                          <SelectItem value="Medium (일반)">
                            <div className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0"></span>
                              Medium (일반)
                            </div>
                          </SelectItem>
                          <SelectItem value="Low (마이너)">
                            <div className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                              Low (마이너)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">상태</Label>
                      <Select value={localForm.status || "이슈발생"} onValueChange={(val) => val && setLocalForm({...localForm, status: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium">
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="이슈발생">이슈발생</SelectItem>
                          <SelectItem value="확인/검토중">확인/검토중</SelectItem>
                          <SelectItem value="수정완료">수정완료</SelectItem>
                          <SelectItem value="완료됨">완료됨</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold h-12 text-sm shadow-md rounded-lg mt-2 transition-all active:scale-[0.98]"
                    onClick={handleSavePinDetails}
                  >
                    내용 저장하기
                  </Button>

                  {/* 댓글 (Comments) 섹션 */}
                  <div className="mt-10 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      문의 및 코멘트 <span className="text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded text-xs">{activePin.comments.length}</span>
                    </h3>
                    
                    <div className="space-y-4 mb-5">
                      {activePin.comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">등록된 코멘트가 없습니다.</p>
                      ) : (
                        activePin.comments.map((comment) => (
                          <div key={comment.id} className="bg-slate-50/80 rounded-xl p-4 text-sm border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-xs">{comment.author}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  comment.role === 'Dev' ? 'bg-blue-100 text-blue-700' : 
                                  comment.role === 'Design' ? 'bg-purple-100 text-purple-700' : 
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {comment.role}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{comment.createdAt}</span>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed">{comment.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1E3A8A]/30 overflow-visible h-10 px-1 gap-1 relative shadow-sm transition-all">
                      <div className="relative w-[100px] shrink-0 h-full flex items-center">
                        <Input 
                          placeholder="작성자 검색" 
                          className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-2 h-full text-xs font-bold text-[#1E3A8A] w-full placeholder:font-normal placeholder:text-slate-400" 
                          value={authorSearch}
                          onChange={(e) => {
                            setAuthorSearch(e.target.value);
                            setIsAuthorDropdownOpen(true);
                          }}
                          onFocus={() => setIsAuthorDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsAuthorDropdownOpen(false), 200)}
                        />
                        
                        {isAuthorDropdownOpen && filteredMembers.length > 0 && (
                          <div className="absolute bottom-full left-0 mb-1 w-[180px] bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-50 max-h-[220px] overflow-y-auto animate-in fade-in zoom-in-95">
                            {filteredMembers.map(m => (
                              <button
                                key={m.id}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                                onClick={() => {
                                  setCurrentMemberId(m.id);
                                  setAuthorSearch(m.name);
                                  setIsAuthorDropdownOpen(false);
                                }}
                              >
                                <span className="font-bold text-slate-800">
                                  {m.name.split(new RegExp(`(${authorSearch})`, 'gi')).map((part, i) => 
                                    part.toLowerCase() === authorSearch.toLowerCase() ? <span key={i} className="text-red-500">{part}</span> : part
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400">{m.role}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-[1px] h-4 bg-slate-300 shrink-0" />
                      
                      <Input 
                        placeholder="문의 내용 입력" 
                        className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-2 h-full flex-1 text-xs"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      
                      <Button size="icon" className="h-8 w-8 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 shrink-0 shadow-sm rounded-md mr-0.5" onClick={handleAddComment}>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-24 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200">
                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                  </div>
                  <p className="text-base font-bold text-slate-800">선택된 핀이 없습니다</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">좌측 테스트 화면을 클릭해<br/>새로운 QA 이슈(핀)를 추가하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
