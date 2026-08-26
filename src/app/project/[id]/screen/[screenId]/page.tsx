"use client";

import { useEffect, useRef, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, doc, onSnapshot, setDoc, getDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CustomAlert } from "@/components/ui/custom-alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, Image as ImageIcon, LayoutGrid, CheckCircle2, Check, Loader2, Link as LinkIcon, Trash2, Send, MessageSquare, UploadCloud, Monitor, Smartphone, Plus, Settings, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NavigationSidebar } from "@/components/NavigationSidebar";

interface Comment {
  id: number;
  author: string;
  role: string;
  text: string;
  createdAt: string;
  isEdited?: boolean;
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
  devFeedback?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
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
  { id: "p1", name: "권수진 선임", role: "PM" },
  { id: "p2", name: "이정민 수석", role: "PM" },
  { id: "v5", name: "김성호 과장", role: "Dev" },
  { id: "v6", name: "박현주 주임", role: "Dev" },
  { id: "v7", name: "배은덕 부장", role: "Dev" },
  { id: "v8", name: "정시영 과장", role: "Dev" },
  { id: "o1", name: "외주사", role: "Partner" },
];

function ScreenItem({ screen, index, activeScreenId, setActiveScreenId, device, screens, setScreens, params, db }: any) {
  const moveUp = (e: any) => {
    e.stopPropagation();
    if (index === 0) return;
    setScreens((prev: any) => {
      const newItems = [...prev];
      const temp = newItems[index];
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = temp;
      
      const batch = import("firebase/firestore").then(({ writeBatch, doc }) => {
        const batch = writeBatch(db);
        newItems.forEach((item, i) => {
          item.order = i;
          if (params.id) {
            batch.set(doc(db, "project_screens", params.id, "screens", item.id), { order: i }, { merge: true });
          }
        });
        if (params.id) batch.commit().catch(console.error);
      });
      return newItems;
    });
  };

  const moveDown = (e: any) => {
    e.stopPropagation();
    if (index === screens.length - 1) return;
    setScreens((prev: any) => {
      const newItems = [...prev];
      const temp = newItems[index];
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = temp;
      
      const batch = import("firebase/firestore").then(({ writeBatch, doc }) => {
        const batch = writeBatch(db);
        newItems.forEach((item, i) => {
          item.order = i;
          if (params.id) {
            batch.set(doc(db, "project_screens", params.id, "screens", item.id), { order: i }, { merge: true });
          }
        });
        if (params.id) batch.commit().catch(console.error);
      });
      return newItems;
    });
  };

  return (
    <div className="relative group flex items-center bg-white rounded-lg overflow-hidden">
      <div className="flex flex-col border-r border-slate-100 bg-slate-50/50 items-center justify-center h-full w-8 shrink-0">
        <button 
          onClick={moveUp} 
          disabled={index === 0}
          className="flex-1 flex items-center justify-center w-full text-slate-400 hover:text-[#0064fa] hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="h-px w-4 bg-slate-200"></div>
        <button 
          onClick={moveDown} 
          disabled={index === screens.length - 1}
          className="flex-1 flex items-center justify-center w-full text-slate-400 hover:text-[#0064fa] hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div
        onClick={() => setActiveScreenId(screen.id)}
        className={`flex-1 text-left p-2.5 flex items-center gap-3 transition-colors pr-8 cursor-pointer ${
          activeScreenId === screen.id 
            ? "bg-[#EEF2FF] border-[#0064fa]/20 border ring-1 ring-[#0064fa]/10 shadow-sm" 
            : "hover:bg-slate-50 border border-transparent"
        }`}
      >
        <div className="w-11 h-16 bg-slate-200 rounded border shrink-0 overflow-hidden relative">
           {screen[device].actualImage ? (
             <img src={screen[device].actualImage} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
           ) : (
             <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 pointer-events-none"></div>
           )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            className={`w-full bg-transparent text-sm font-semibold outline-none focus:ring-1 focus:ring-[#0064fa]/30 rounded px-1 -ml-1 ${activeScreenId === screen.id ? 'text-[#0064fa]' : 'text-slate-700'}`}
            value={screen.name}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              setScreens((prev: any) => prev.map((s: any) => s.id === screen.id ? { ...s, name: e.target.value } : s));
            }}
            onBlur={() => {
              if (params.id && screen.name.trim()) {
                import("firebase/firestore").then(({ doc, setDoc }) => {
                  setDoc(doc(db, "project_screens", params.id as string, "screens", screen.id), { name: screen.name }, { merge: true }).catch(console.error);
                });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
          />
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
      </div>
      {screens.length > 1 && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center rounded-md"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setScreens((prev: any) => {
              const nextScreens = prev.filter((s: any) => s.id !== screen.id);
              if (params.id) {
                import("firebase/firestore").then(({ doc, deleteDoc, setDoc }) => {
                  deleteDoc(doc(db, "project_screens", params.id as string, "screens", screen.id)).catch(console.error);
                  
                  let totalIssues = 0;
                  let totalCompleted = 0;
                  let completedScreensCount = 0;
                  nextScreens.forEach((s: any) => {
                    if (s.issueCount === 0) completedScreensCount++;
                    const allPins = s.PC ? (s.PC.pins ? [...s.PC.pins] : []) : [];
                    if (s.Mobile && s.Mobile.pins) allPins.push(...s.Mobile.pins);
                    totalIssues += allPins.length;
                    totalCompleted += allPins.filter((p: any) => (p.status === "완료됨" || p.status === "특이사항 없음")).length;
                  });
                  setDoc(doc(db, "projects", params.id as string), {
                    screensCount: nextScreens.length,
                    completedScreensCount: completedScreensCount,
                    issuesCount: totalIssues,
                    completedCount: totalCompleted,
                  }, { merge: true }).catch(console.error);
                });
              }
              return nextScreens;
            });
            if (activeScreenId === screen.id) {
              setActiveScreenId(screens.find((s: any) => s.id !== screen.id)?.id || "");
            }
          }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
const renderTextWithMentions = (text: string) => {
  if (!text) return text;
  const membersRegex = new RegExp(`(@(?:${PRESET_MEMBERS.map(m => m.name.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\$&')).join('|')}))`, 'g');
  return text.split(membersRegex).map((part, i) => 
    part.startsWith('@') ? <span key={i} className="font-bold text-[#0064fa] bg-blue-50 px-1 rounded">{part}</span> : part
  );
};

interface ScreenDeviceState {
  actualImage: string | null;
  figmaUrl: string;
  figmaImageUrl: string | null;
  pins: Pin[];
  testUrl?: string;
}

interface ScreenData {
  id: string;
  name: string;
  issueCount: number;
  PC: ScreenDeviceState;
  Mobile: ScreenDeviceState;
  order?: number;
}

const emptyDeviceState: ScreenDeviceState = {
  actualImage: null,
  figmaUrl: "",
  figmaImageUrl: null,
  pins: []
};

const INITIAL_SCREENS: ScreenData[] = [{
  id: `s1`,
  name: "새로운 화면",
  issueCount: -1,
  PC: { ...emptyDeviceState },
  Mobile: { ...emptyDeviceState }
}];

const formatTimeAgo = (dateString: string) => {
  if (!dateString || !dateString.includes('T')) return dateString;
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInMinutes < 1) return "방금 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

import { useAuthStore } from "@/store/useAuthStore";

export default function ScreenQA() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMaster, canManageProjects, canManagePins, canEditDevFeedback, canComment, user, role } = useAuthStore();
  const [projectTitle, setProjectTitle] = useState("");
  const [projectPlatform, setProjectPlatform] = useState("");
  const [projectStatus, setProjectStatus] = useState("진행중");
  const [projectDueDate, setProjectDueDate] = useState("");
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectPlatform, setEditProjectPlatform] = useState("");
  const [editProjectStatus, setEditProjectStatus] = useState("진행중");
  const [editProjectDueDate, setEditProjectDueDate] = useState("");
  const [projectFigmaUrl, setProjectFigmaUrl] = useState("");
  const [editProjectFigmaUrl, setEditProjectFigmaUrl] = useState("");
  const [isProjectCompleteAlertOpen, setIsProjectCompleteAlertOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const isAppProject = projectPlatform ? projectPlatform.includes("App") : params.id === "p2";
  const [screens, setScreens] = useState(INITIAL_SCREENS);
  const [isMounted, setIsMounted] = useState(false);
  const [isExitAlertOpen, setIsExitAlertOpen] = useState(false);
  const [isReuploadAlertOpen, setIsReuploadAlertOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOriginalView, setIsOriginalView] = useState(false);

  

  useEffect(() => {
    setIsMounted(true);
    if (!params.id) return;
    
    // Load screen data
    const unsubscribeScreens = onSnapshot(collection(db, "project_screens", params.id as string, "screens"), (snapshot) => {
      if (!snapshot.empty) {
        const loaded = snapshot.docs.map(d => {
          const s = d.data() as ScreenData;
          const allPins = isAppProject ? [...(s.PC?.pins || [])] : [...(s.PC?.pins || []), ...(s.Mobile?.pins || [])];
          if (allPins.length > 0) {
            s.issueCount = allPins.filter(p => p.status !== "완료됨" && p.status !== "특이사항 없음").length;
          } else {
            s.issueCount = -1;
          }
          return s;
        });
        loaded.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
          return parseInt(a.id.replace('s','')) - parseInt(b.id.replace('s',''));
        });
        setScreens(loaded);
        
        const completedScreensCount = loaded.filter(s => s.issueCount === 0).length;
        // Sync screensCount if out of sync
        getDoc(doc(db, "projects", params.id as string)).then(pDoc => {
          if (pDoc.exists() && (pDoc.data().screensCount !== loaded.length || pDoc.data().completedScreensCount !== completedScreensCount)) {
            setDoc(doc(db, "projects", params.id as string), { 
              screensCount: loaded.length,
              completedScreensCount: completedScreensCount
            }, { merge: true });
          }
        });
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
        if (currentProject.status) setProjectStatus(currentProject.status);
        if (currentProject.lastUpdated) setProjectDueDate(currentProject.lastUpdated);
        if (currentProject.figmaProjectUrl) setProjectFigmaUrl(currentProject.figmaProjectUrl);
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
  }, [params.id, isAppProject]);

  const handleUpdateProjectSettings = async (force: boolean = false) => {
    if (!params.id) return;
    
    if (force !== true && editProjectStatus === "완료됨") {
      const remainingIssuesCount = screens.reduce((acc, s) => acc + (s.issueCount === -1 ? 1 : Math.max(0, s.issueCount)), 0);
      if (remainingIssuesCount > 0) {
        setIsProjectCompleteAlertOpen(true);
        return;
      }
    }

    try {
      await setDoc(doc(db, "projects", params.id as string), {
        name: editProjectName,
        platform: editProjectPlatform,
        status: editProjectStatus,
        figmaProjectUrl: editProjectFigmaUrl,
        lastUpdated: editProjectDueDate || new Date().toISOString().split('T')[0],
      }, { merge: true });
      setProjectTitle(editProjectName);
      setProjectPlatform(editProjectPlatform);
      setProjectStatus(editProjectStatus);
      setProjectDueDate(editProjectDueDate);
      setProjectFigmaUrl(editProjectFigmaUrl);
      setIsProjectSettingsOpen(false);
      toast.success("프로젝트 설정이 저장되었습니다.");
    } catch (e) {
      toast.error("저장에 실패했습니다.");
    }
  };

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
      const MAX_PIXELS = 800000; // Cap at 800k pixels for very small file size
      
      const currentPixels = width * height;
      if (currentPixels > MAX_PIXELS) {
        const ratio = Math.sqrt(MAX_PIXELS / currentPixels);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.50);
        
        setIsUploading(true);
        
        // Firebase Storage 버킷이 생성되지 않아 404 에러가 발생하는 상태입니다.
        // 압축률을 극대화했기 때문에(약 100KB 내외), Firestore의 1MB 문서 용량 제한에
        // 걸리지 않으므로 직접 Firestore에 base64로 저장합니다.
        try {
          updateActiveDeviceState({ actualImage: compressedDataUrl });
          setIsUploading(false);
        } catch (err: any) {
          console.error("Direct upload error:", err);
          setIsUploading(false);
          toast.error("이미지 업로드에 실패했습니다. 용량이 너무 크거나 네트워크 문제일 수 있습니다.");
        }
      }
    };
    img.src = dataUrl;
  };

  const [activeScreenId, setActiveScreenId] = useState("s1");
  const [currentMemberId, setCurrentMemberId] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
  const [isPinDeleteAlertOpen, setIsPinDeleteAlertOpen] = useState(false);
  const [isProjectDeleteAlertOpen, setIsProjectDeleteAlertOpen] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<number | null>(null);
  const filteredMembers = PRESET_MEMBERS.filter(m => m.name.includes(authorSearch) || m.role.toLowerCase().includes(authorSearch.toLowerCase()));
  type Device = "PC" | "Mobile";
  const [device, setDevice] = useState<Device>("PC");
  const [pinSearchQuery, setPinSearchQuery] = useState("");

  const activeScreenIndex = screens.findIndex(s => s.id === activeScreenId);
  const activeScreen = activeScreenIndex >= 0 ? screens[activeScreenIndex] : screens[0];
  const activeDeviceState = activeScreen[device];

  const updateActiveDeviceState = (updates: Partial<ScreenDeviceState>) => {
    setScreens(prev => {
      const nextScreens = prev.map(s => {
        if (s.id === activeScreenId) {
          const updatedDeviceState = { ...s[device], ...updates };
          const newScreen = { ...s, [device]: updatedDeviceState };
          
          const allPins = isAppProject ? [...(newScreen.PC?.pins || [])] : [...(newScreen.PC?.pins || []), ...(newScreen.Mobile?.pins || [])];
          if (allPins.length > 0) {
            newScreen.issueCount = allPins.filter(p => p.status !== "완료됨" && p.status !== "특이사항 없음").length;
          } else {
            newScreen.issueCount = -1;
          }
          
          if (params.id) {
            const cleanScreen = JSON.parse(JSON.stringify(newScreen));
            setDoc(doc(db, "project_screens", params.id as string, "screens", newScreen.id), cleanScreen, { merge: true }).catch((err) => {
              console.error("Failed to save screen:", err);
              toast.error("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
            });
          }
          return newScreen;
        }
        return s;
      });

      if (params.id) {
        let totalIssues = 0;
        let totalCompleted = 0;
        let completedScreensCount = 0;
        nextScreens.forEach(screen => {
          if (screen.issueCount === 0) completedScreensCount++;
          const allPins = isAppProject ? [...(screen.PC?.pins || [])] : [...(screen.PC?.pins || []), ...(screen.Mobile?.pins || [])];
          totalIssues += allPins.length;
          totalCompleted += allPins.filter(p => (p.status === "완료됨" || p.status === "특이사항 없음")).length;
        });
        const cleanProjectData = JSON.parse(JSON.stringify({
          screensCount: nextScreens.length,
          completedScreensCount: completedScreensCount,
          issuesCount: totalIssues,
          completedCount: totalCompleted,
        }));
        setDoc(doc(db, "projects", params.id as string), cleanProjectData, { merge: true }).catch(console.error);
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

  const testUrl = activeDeviceState.testUrl || "";
  const setTestUrl = (url: string) => updateActiveDeviceState({ testUrl: url });
  const [testUrlInput, setTestUrlInput] = useState(testUrl);
  useEffect(() => {
    setTestUrlInput(activeDeviceState.testUrl || "");
  }, [activeDeviceState.testUrl]);

  const pins = activeDeviceState.pins;
  const setPins = (newPins: Pin[] | ((prev: Pin[]) => Pin[])) => {
    updateActiveDeviceState({
      pins: typeof newPins === "function" ? newPins(pins) : newPins
    });
  };

  const [activePinId, setActivePinId] = useState<number | null>(null);

  useEffect(() => {
    const pinIdParam = searchParams.get('pinId');
    if (pinIdParam) {
      setActivePinId(Number(pinIdParam));
    } else {
      setActivePinId(null);
    }
  }, [device, activeScreenId, searchParams]);

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
        devFeedback: activePin.devFeedback || "대기중",
        priority: activePin.priority || "High (크리티컬)",
        status: activePin.status || "이슈발생"
      });
    } else {
      setLocalForm({});
    }
  }, [activePinId]);

  const handleSavePinDetails = () => {
    if (!activePinId) return;

    if (localForm.status !== "특이사항 없음" && !localForm.description?.trim()) {
      toast.error("문제점 설명을 입력해주세요.", { id: "save-error" });
      return;
    }

    setPins(pins.map(p => p.id === activePinId ? { ...p, ...localForm } : p));
    toast.success("내용 저장완료!", { id: "save-success" });
  };

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isCommentDeleteAlertOpen, setIsCommentDeleteAlertOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isLoadingFigma, setIsLoadingFigma] = useState(false);
  const [figmaError, setFigmaError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewComment(val);
    const lastAtIdx = val.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const query = val.slice(lastAtIdx + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setMentionSelectedIndex(0);
        setIsMentionOpen(true);
        return;
      }
    }
    setIsMentionOpen(false);
  };

  const handleMentionSelect = (m: any) => {
    const lastAtIdx = newComment.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      setNewComment(newComment.slice(0, lastAtIdx) + '@' + m.name + ' ');
    }
    setIsMentionOpen(false);
  };

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

  const totalScreens = screens.length;
  const completedScreens = screens.filter(s => s.issueCount === 0).length;
  const allPins = screens.flatMap(s => isAppProject ? [...(s.PC?.pins || [])] : [...(s.PC?.pins || []), ...(s.Mobile?.pins || [])]);
  const totalIssues = allPins.length;
  const completedIssues = allPins.filter(p => (p.status === "완료됨" || p.status === "특이사항 없음")).length;
  const totalTasks = totalScreens + totalIssues;
  const completedTasks = completedScreens + completedIssues;
  const progressRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{x: number, y: number} | null>(null);
  const [currentRect, setCurrentRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canManagePins || !actualImage) return;
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
    setPins([...pins, { id: newId, x: currentRect.x, y: currentRect.y, width: currentRect.w, height: currentRect.h, comments: [], createdAt: new Date().toISOString() }]);
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
    setPinToDelete(activePinId);
    setIsPinDeleteAlertOpen(true);
  };

  const confirmDeletePin = () => {
    if (pinToDelete === null) return;
    setPins(pins.filter(p => p.id !== pinToDelete));
    setActivePinId(null);
    setIsPinDeleteAlertOpen(false);
    setPinToDelete(null);
  };

  const confirmDeleteProject = async () => {
    if (!params.id) return;
    try {
      const projectId = params.id as string;
      await deleteDoc(doc(db, "projects", projectId));
      
      const screensRef = collection(db, "project_screens", projectId, "screens");
      const screensSnapshot = await getDocs(screensRef);
      const batch = writeBatch(db);
      screensSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      await deleteDoc(doc(db, "project_screens", projectId));
      router.push("/");
    } catch (e) {
      console.error("Error deleting project:", e);
    }
  };

  const handleAddComment = () => {
    if (!activePinId || !newComment.trim() || !user) return;
    
    setPins(pins.map(p => {
      if (p.id === activePinId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now(),
            author: user.user_metadata?.full_name || "알 수 없음",
            role: user.user_metadata?.team ? `${user.user_metadata.team} ${user.user_metadata.position || ""}` : "사용자",
            text: newComment,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return p;
    }));
    setNewComment("");
  };

  const handleEditComment = (commentId: number, text: string) => {
    if (!activePinId || !text.trim()) return;
    setPins(pins.map(p => {
      if (p.id === activePinId) {
        return {
          ...p,
          comments: p.comments.map(c => c.id === commentId ? { ...c, text, isEdited: true } : c)
        };
      }
      return p;
    }));
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleDeleteComment = (commentId: number) => {
    setCommentToDelete(commentId);
    setIsCommentDeleteAlertOpen(true);
  };

  const confirmDeleteComment = () => {
    if (!activePinId || commentToDelete === null) return;
    setPins(pins.map(p => {
      if (p.id === activePinId) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentToDelete)
        };
      }
      return p;
    }));
    setIsCommentDeleteAlertOpen(false);
    setCommentToDelete(null);
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

  const unreviewedScreen = screens.find(s => {
    if (s.issueCount === -1) return true;
    const allPins = isAppProject ? [...(s.PC?.pins || [])] : [...(s.PC?.pins || []), ...(s.Mobile?.pins || [])];
    return allPins.some(p => !(p.description || "").trim() && !(p.request || "").trim());
  });
  const exitAlertType = unreviewedScreen?.issueCount === -1 ? 'no-image' : 'empty-pin';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F4F7FB]">
      <header className="h-16 border-b bg-white px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center">
          <NavigationSidebar />
          <button 
            onClick={() => router.push("/")}
            className="flex items-center justify-center hover:bg-slate-100 w-10 h-10 rounded-full transition-colors mr-1"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#0064fa] text-white rounded-md text-xs font-bold flex items-center justify-center">
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
                        device === "PC" ? "bg-white text-[#0064fa] shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> PC
                    </button>
                    <button
                      onClick={() => setDevice("Mobile")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        device === "Mobile" ? "bg-white text-[#0064fa] shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                  </div>
                )}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs font-medium text-slate-500">
                  {projectPlatform || (isAppProject ? "App (iOS/Android)" : "Web (반응형)")} · {projectStatus}
                  {projectDueDate && ` · 요청일: ${projectDueDate}`}
                </p>
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
          {canManageProjects && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-slate-700 hover:bg-slate-50 border-slate-200 h-9 font-bold transition-all"
              onClick={() => {
                setEditProjectName(projectTitle);
                setEditProjectPlatform(projectPlatform || (isAppProject ? "App (iOS/Android)" : "Web (반응형)"));
                setEditProjectStatus(projectStatus);
                setEditProjectDueDate(projectDueDate);
                setEditProjectFigmaUrl(projectFigmaUrl);
                setIsProjectSettingsOpen(true);
              }}
            >
              <Settings className="w-4 h-4" />
              설정
            </Button>
          )}
          <Link href={projectFigmaUrl || "#"} target={projectFigmaUrl ? "_blank" : undefined} className={!projectFigmaUrl ? "pointer-events-none" : ""}>
            <Button variant="outline" size="sm" className="gap-2 text-[#0064fa] border-[#0064fa]/20 hover:bg-[#EEF2FF] h-9" disabled={!projectFigmaUrl}>
              <ExternalLink className="w-4 h-4" />
              피그마 프로젝트 열기
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area - 레이아웃 간격 넓힘 (p-4 gap-4 추가) */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        
        {/* Leftmost: Screen Thumbnail Sidebar */}
        <div className="w-[260px] bg-white border rounded-xl flex flex-col shrink-0 shadow-sm overflow-hidden">
          <div className="h-14 border-b flex items-center justify-between px-5 bg-slate-50/50 shrink-0">
            <div className="flex items-center">
              <LayoutGrid className="w-5 h-5 text-[#0064fa] mr-3" />
              <span className="text-sm font-bold text-slate-800">전체 화면 ({screens.length})</span>
            </div>
            {canManageProjects && (
              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-[#0064fa] hover:bg-slate-200" onClick={() => {
              const newId = `s${Date.now()}`;
              const newScreen: ScreenData = { id: newId, name: "새로운 화면", issueCount: -1, PC: { ...emptyDeviceState }, Mobile: { ...emptyDeviceState }, order: screens.length };
              
              setScreens(prev => {
                const nextScreens = [...prev, newScreen];
                if (params.id) {
                  setDoc(doc(db, "project_screens", params.id as string, "screens", newId), newScreen, { merge: true }).catch(console.error);
                  
                  let totalIssues = 0;
                  let totalCompleted = 0;
                  let completedScreensCount = 0;
                  nextScreens.forEach(s => {
                    if (s.issueCount === 0) completedScreensCount++;
                    const allPins = [...(s.PC?.pins || []), ...(s.Mobile?.pins || [])];
                    totalIssues += allPins.length;
                    totalCompleted += allPins.filter(p => (p.status === "완료됨" || p.status === "특이사항 없음")).length;
                  });
                  setDoc(doc(db, "projects", params.id as string), {
                    screensCount: nextScreens.length,
                    completedScreensCount: completedScreensCount,
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
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-1.5">
              {screens.map((screen) => (
                <div key={screen.id} className="relative group">
                  <button
                    onClick={() => setActiveScreenId(screen.id)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors pr-8 ${
                      activeScreenId === screen.id 
                        ? "bg-[#EEF2FF] border-[#0064fa]/20 border ring-1 ring-[#0064fa]/10 shadow-sm" 
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
                      {canManageProjects ? (
                        <input
                          className={`w-full bg-transparent text-sm font-semibold outline-none focus:ring-1 focus:ring-[#0064fa]/30 rounded px-1 -ml-1 ${activeScreenId === screen.id ? 'text-[#0064fa]' : 'text-slate-700'}`}
                          value={screen.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            setScreens(prev => prev.map(s => s.id === screen.id ? { ...s, name: e.target.value } : s));
                          }}
                          onBlur={() => {
                            if (params.id && screen.name.trim()) {
                              setDoc(doc(db, "project_screens", params.id as string, "screens", screen.id), { name: screen.name }, { merge: true }).catch(console.error);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      ) : (
                        <div className={`w-full text-sm font-semibold truncate px-1 -ml-1 py-[1px] ${activeScreenId === screen.id ? 'text-[#0064fa]' : 'text-slate-700'}`}>
                          {screen.name}
                        </div>
                      )}
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
                  {screens.length > 1 && canManageProjects && (
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
                            let completedScreensCount = 0;
                            nextScreens.forEach(s => {
                              if (s.issueCount === 0) completedScreensCount++;
                              const allPins = isAppProject ? [...(s.PC?.pins || [])] : [...(s.PC?.pins || []), ...(s.Mobile?.pins || [])];
                              totalIssues += allPins.length;
                              totalCompleted += allPins.filter(p => (p.status === "완료됨" || p.status === "특이사항 없음")).length;
                            });
                            setDoc(doc(db, "projects", params.id as string), {
                              screensCount: nextScreens.length,
                              completedScreensCount: completedScreensCount,
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
          const wrapperClass = isWidePCLayout ? "flex-col overflow-y-auto gap-8 pb-12 px-8 items-center" : "flex-row justify-center overflow-x-auto gap-12 pb-2 px-8";
          const maxWClass = isWidePCLayout ? "max-w-5xl" : "max-w-[420px]";
          const aspectClass = isWidePCLayout ? "aspect-[16/9]" : "aspect-[9/19]";
          const headerContainerClass = isWidePCLayout ? "w-full mb-3 flex flex-col justify-end" : "w-full mb-5 h-[120px] flex flex-col justify-end";

          return (
            <div className={`flex-1 flex relative ${wrapperClass}`}>
              
              {/* Figma View (API Fetch Area) */}
              <div className={`flex flex-col w-full shrink-0 order-2 ${isWidePCLayout ? 'flex-none max-w-5xl' : 'max-w-[420px]'}`}>
                <div className={`${isWidePCLayout ? 'w-full mb-3 flex flex-col justify-end' : 'w-full mb-5 h-[120px] flex flex-col justify-end'} ${maxWClass}`}>
              <div className={`bg-white px-5 py-3 border-x border-t shadow-sm flex items-center justify-between shrink-0 ${figmaImageUrl ? 'rounded-xl border-b mb-3' : 'rounded-t-xl'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></span>
                  <span className="text-sm font-bold text-slate-800">Figma 시안</span>
                </div>
                {figmaImageUrl && (
                  <div className="flex items-center gap-2">
                    {canManagePins && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full" onClick={fetchFigmaImage} disabled={isLoadingFigma}>
                          {isLoadingFigma ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                          시안 새로고침
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-3 text-xs font-medium text-slate-600 bg-white" onClick={() => setFigmaImageUrl(null)}>
                          링크 다시 입력
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {!figmaImageUrl && canManagePins && (
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
              )}
              {figmaError && <p className="text-xs font-medium text-red-500 mt-2 px-1">{figmaError}</p>}
            </div>

            <div className={`w-full bg-slate-50 border border-slate-200 shadow-md rounded-2xl flex flex-col relative overflow-y-auto overflow-x-hidden custom-scrollbar group ring-1 ring-black/5 ${maxWClass} ${aspectClass}`}>
              {isLoadingFigma ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-600 z-10 bg-slate-50/50">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-xs font-bold">피그마에서 이미지를 추출하는 중...</p>
                </div>
              ) : figmaImageUrl ? (
                <div className="relative w-full min-h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={figmaImageUrl} alt="Figma Render" className="w-full h-auto block" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-purple-50/40"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-purple-100">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">피그마 시안 렌더링 영역</h3>
                    <p className="text-xs mt-2 text-slate-500 leading-relaxed">
                      {canManagePins ? <>상단에 피그마 링크를 입력하고<br/>불러오기 버튼을 눌러주세요.</> : "아직 등록된 시안이 없습니다."}
                    </p>
                    <div className="h-10 mt-6" aria-hidden="true"></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actual Capture View */}
          <div className={`flex flex-col w-full shrink-0 order-1 ${isWidePCLayout ? 'flex-none max-w-5xl' : 'max-w-[420px]'}`}>
            <div className={`${headerContainerClass} ${maxWClass}`}>
              <div className={`bg-white px-5 py-3 border-x border-t shadow-sm flex items-center justify-between shrink-0 ${(!testUrl && !isAppProject && canManagePins) ? 'rounded-t-xl' : 'rounded-xl border-b mb-3'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span>
                  <span className="text-sm font-bold text-slate-800">테스트 화면</span>
                </div>
                <div className="flex items-center gap-2">
                  {testUrl && !isAppProject && (
                    <>
                      <Link href={testUrl} target="_blank" className="flex-1">
                        <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          테스트 링크 열기
                        </Button>
                      </Link>
                      {canManagePins && (
                        <Button variant="outline" size="sm" className="h-7 px-3 text-xs font-medium text-slate-600 bg-white" onClick={() => setTestUrl("")}>
                          링크 다시 입력
                        </Button>
                      )}
                    </>
                  )}
                  {actualImage && (
                    <>
                      {canManagePins && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md ml-2">클릭하여 핀 추가</span>
                      )}
                      <Button 
                        variant={isOriginalView ? "default" : "outline"} 
                        size="sm" 
                        className={`h-7 text-xs px-3 ml-1 ${isOriginalView ? "bg-[#0064fa] hover:bg-[#0064fa]/90 text-white" : "bg-white text-slate-600"}`} 
                        onClick={() => setIsOriginalView(!isOriginalView)}
                      >
                        원본 보기
                      </Button>
                      {canManagePins && (
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setIsReuploadAlertOpen(true)}>
                          이미지 다시 올리기
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {!testUrl && !isAppProject && canManagePins && (
                <div className="bg-white border-x border-b shadow-sm rounded-b-xl p-4 flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="테스트 웹페이지 URL (http://...)" 
                      className="h-9 pl-9 text-xs bg-slate-50 border-slate-200 focus-visible:ring-blue-500/30"
                      value={testUrlInput}
                      onChange={(e) => setTestUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && testUrlInput) {
                          setTestUrl(testUrlInput);
                        }
                      }}
                    />
                  </div>
                  <Button size="sm" className="h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm px-4 text-white" onClick={() => testUrlInput && setTestUrl(testUrlInput)} disabled={!testUrlInput}>
                    등록
                  </Button>
                </div>
              )}
            </div>

            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              disabled={!canManagePins}
            />
            <div className={`w-full bg-slate-50 border border-slate-200 shadow-md rounded-2xl relative overflow-y-auto overflow-x-hidden group ring-1 ring-black/5 custom-scrollbar ${maxWClass} ${aspectClass}`}>
              {!actualImage && !isUploading ? (
                // 파일 업로드 UI
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center hover:bg-slate-100 transition-colors">
                  <div className={`w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-100 ${canManagePins ? 'cursor-pointer hover:scale-105' : ''} transition-transform`} onClick={() => canManagePins && fileInputRef.current?.click()}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">테스트 화면 업로드</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {canManagePins ? <>실제 구현된 앱/웹의 캡처 화면을<br/>이곳에 업로드해 주세요.</> : "아직 등록된 테스트 화면이 없습니다."}
                  </p>
                  {canManagePins && (
                    <Button className="mt-6 font-bold bg-[#0064fa] hover:bg-[#0064fa]/90 text-white shadow-sm" onClick={() => fileInputRef.current?.click()}>
                      내 PC에서 파일 찾기
                    </Button>
                  )}
                </div>
              ) : isUploading ? (
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-50">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0064fa] mb-4" />
                  <h3 className="text-base font-bold text-slate-800">고해상도 이미지 서버 저장 중...</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    용량이 큰 이미지를 안전하게 업로드하고 있습니다.<br/>잠시만 기다려주세요.
                  </p>
                </div>
              ) : (
                // 캡처 이미지 및 핀 영역
                <div 
                  className="relative w-full cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onDragStart={(e) => e.preventDefault()}
                  draggable={false}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={actualImage || undefined} alt="Actual Upload" className="w-full h-auto block pointer-events-none select-none" draggable={false} />
                  
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
                  
                  {/* Pins overlay (moved inside inner div to sync with image height) */}
                  {!isOriginalView && pins.map((pin, index) => {
                const isBox = pin.width !== undefined && pin.height !== undefined && pin.width > 0.5 && pin.height > 0.5;
                const isActive = activePinId === pin.id;
                const isCompleted = (pin.status === "완료됨" || pin.status === "특이사항 없음");
                const pinNumber = index + 1;
                
                // Search filter logic
                const searchLower = pinSearchQuery.toLowerCase();
                const isMatch = !pinSearchQuery || 
                  String(pinNumber).includes(searchLower) ||
                  (pin.description || "").toLowerCase().includes(searchLower) ||
                  (pin.request || "").toLowerCase().includes(searchLower) ||
                  (pin.status || "").toLowerCase().includes(searchLower) ||
                  pin.comments.some(c => c.text.toLowerCase().includes(searchLower) || c.author.toLowerCase().includes(searchLower));
                
                if (pinSearchQuery && !isMatch) {
                  return (
                    <div
                      key={pin.id}
                      className="absolute z-10 opacity-20 pointer-events-none transition-opacity"
                      style={{ 
                      left: `${Math.max(0, Math.min(100, pin.x))}%`, 
                      top: `${Math.max(0, Math.min(100, pin.y))}%`,
                        width: isBox ? `${pin.width}%` : undefined,
                        height: isBox ? `${pin.height}%` : undefined,
                      }}
                    >
                      {isBox ? (
                        <div className="w-full h-full border-dashed border border-slate-400 bg-slate-400/10">
                          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-slate-400 ring-2 ring-white">
                            {pinNumber}
                          </div>
                        </div>
                      ) : (
                        <div className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-slate-400 ring-2 ring-white">
                          {pinNumber}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={pin.id}
                    className="absolute z-10 group"
                    style={{ 
                      left: `${Math.max(0, Math.min(100, pin.x))}%`, 
                      top: `${Math.max(0, Math.min(100, pin.y))}%`,
                      width: isBox ? `${pin.width}%` : undefined,
                      height: isBox ? `${pin.height}%` : undefined,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                  >
                    {isBox ? (
                      <div 
                        className={`w-full h-full border-dashed transition-all cursor-pointer ${
                          isActive 
                            ? 'border-2 border-rose-500 bg-rose-500/20 z-20' 
                            : isCompleted
                              ? 'border-2 border-slate-400 bg-slate-400/20 opacity-70 hover:opacity-100 hover:bg-slate-400/30'
                              : 'border border-rose-400 bg-rose-400/10 hover:bg-rose-400/20'
                        }`}
                        onMouseDown={(e) => { e.stopPropagation(); setActivePinId(pin.id); }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div 
                          className={`absolute -left-3 -top-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-all ${
                            isActive 
                              ? "bg-emerald-600 scale-110 ring-2 ring-white" 
                              : isCompleted
                                ? "bg-slate-400 ring-2 ring-white"
                                : "bg-emerald-500 ring-2 ring-white"
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : pinNumber}
                        </div>
                      </div>
                    ) : (
                      <button
                        className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-all ring-2 ring-white ${
                          isActive 
                            ? "bg-emerald-600 scale-110 ring-4 ring-emerald-600/30 z-20" 
                            : isCompleted
                              ? "bg-slate-400 opacity-80 hover:bg-slate-500 hover:scale-105 z-10"
                              : "bg-emerald-500 hover:bg-emerald-600 hover:scale-105 z-10"
                        }`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActivePinId(pin.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : pinNumber}
                      </button>
                    )}
                  </div>
                );
              })}
                </div>
              )}
            </div>
          </div>
        </div>
        )
        })()}

        {/* Right: Issue Form Panel */}
        <div className="w-[420px] bg-white border rounded-xl flex flex-col shrink-0 shadow-sm z-10 overflow-hidden">
          {/* Search Bar for Pins */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder="현재 화면의 핀/이슈 검색 (작성자, 내용, 상태 등)"
                className="pl-9 h-9 text-xs bg-white border-slate-200 focus-visible:ring-[#0064fa]/30 w-full"
                value={pinSearchQuery}
                onChange={(e) => setPinSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="border-b flex flex-col justify-center px-6 py-3.5 gap-3 bg-slate-50 shrink-0">
            <h2 className="font-bold text-base text-slate-800 flex items-center gap-2 w-full overflow-hidden">
              <div className="w-1.5 h-5 bg-[#0064fa] rounded-full shrink-0"></div>
              <span className="shrink-0">QA 이슈 상세</span>
              <span className="text-slate-400 font-medium ml-1 text-sm flex items-center gap-2 truncate">
                <span className="shrink-0">(Pin #{activePinId ? pins.findIndex(p => p.id === activePinId) + 1 : '-'})</span>
                {(activePin?.createdAt || activePin?.comments?.[0]?.createdAt) && (
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-300 text-xs shrink-0">|</span>
                    <span className="text-slate-500 text-xs truncate">{(activePin.createdAt || activePin.comments[0].createdAt).split('T')[0].replace(/-/g, '.')}</span>
                  </div>
                )}
              </span>
            </h2>
            <div className="flex items-center gap-2 shrink-0 w-full">
              <Link href={figmaUrl ? (figmaUrl.includes('mode=dev') ? figmaUrl : figmaUrl.includes('?') ? `${figmaUrl}&mode=dev` : `${figmaUrl}?mode=dev`) : "#"} target="_blank" className="flex-1">
                <Button variant="outline" size="sm" className="w-full h-8 px-2.5 text-xs font-bold text-[#0064fa] border-[#0064fa]/30 hover:bg-[#EEF2FF]" disabled={!figmaUrl}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">피그마 Inspect</span>
                </Button>
              </Link>
              {activePinId && canManagePins && (
                <Button variant="ghost" size="sm" onClick={handleDeletePin} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 px-2.5 font-bold shrink-0">
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  핀 삭제
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
              {activePinId && activePin ? (
                <div className="space-y-7 animate-in fade-in slide-in-from-right-2 duration-200">

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
                      <Select disabled={!canManagePins} value={localForm.issueType || "레이아웃/간격"} onValueChange={(val) => val && setLocalForm({...localForm, issueType: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium disabled:opacity-50">
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
                      <Select disabled={!canManagePins} value={localForm.language || "한국어 (KR)"} onValueChange={(val) => val && setLocalForm({...localForm, language: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium disabled:opacity-50">
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

                  {localForm.status !== "특이사항 없음" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-800">문제점 설명</Label>
                        <Textarea 
                          disabled={!canManagePins}
                          placeholder="시안과 다르게 구현된 부분을 적어주세요." 
                          className="resize-none h-24 text-sm bg-slate-50/50 disabled:opacity-50" 
                          value={localForm.description || ""}
                          onChange={(e) => setLocalForm({...localForm, description: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-800">수정 요청사항</Label>
                        <Textarea 
                          disabled={!canManagePins}
                          placeholder="어떻게 수정해야 하는지 구체적으로 적어주세요." 
                          className="resize-none h-24 text-sm bg-slate-50/50 disabled:opacity-50" 
                          value={localForm.request || ""}
                          onChange={(e) => setLocalForm({...localForm, request: e.target.value})}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-800">개발자 피드백</Label>
                    <div className="flex gap-2">
                      <Select disabled={!canEditDevFeedback} value={localForm.devFeedback || "대기중"} onValueChange={(val) => setLocalForm({...localForm, devFeedback: val as string})}>
                        <SelectTrigger className="flex-1 h-10 text-sm bg-blue-50/40 border-blue-200 font-medium text-slate-800 disabled:opacity-50">
                          <SelectValue placeholder="피드백 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="대기중">대기중</SelectItem>
                          <SelectItem value="수정완료 (확인요청)">수정완료 (확인요청)</SelectItem>
                          <SelectItem value="이슈 아님 (정상작동)">이슈 아님 (정상작동)</SelectItem>
                          <SelectItem value="디자인/기획 검토필요">디자인/기획 검토필요</SelectItem>
                          <SelectItem value="기술적 구현불가">기술적 구현불가</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button disabled={!canManagePins && !canEditDevFeedback} onClick={handleSavePinDetails} className="h-10 px-4 bg-[#0064fa] hover:bg-[#0064fa]/90 text-white font-bold shrink-0">저장</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">우선순위</Label>
                      <Select disabled={!canManagePins} value={localForm.priority || "High (크리티컬)"} onValueChange={(val) => val && setLocalForm({...localForm, priority: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium disabled:opacity-50">
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
                      <Select disabled={!canManagePins} value={localForm.status || "이슈발생"} onValueChange={(val) => val && setLocalForm({...localForm, status: val})}>
                        <SelectTrigger className="h-10 text-sm bg-white font-medium disabled:opacity-50">
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="이슈발생">이슈발생</SelectItem>
                          <SelectItem value="확인/검토중">확인/검토중</SelectItem>
                          <SelectItem value="수정완료">수정완료</SelectItem>
                          <SelectItem value="완료됨">완료됨</SelectItem>
                          <SelectItem value="특이사항 없음">특이사항 없음</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    disabled={!canManagePins && !canEditDevFeedback}
                    className="w-full bg-[#0064fa] hover:bg-[#0064fa]/90 text-white font-bold h-12 text-sm shadow-md rounded-lg mt-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    onClick={handleSavePinDetails}
                  >
                    내용 저장하기
                  </Button>

                  {/* 댓글 (Comments) 섹션 */}
                  <div className="mt-10 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      문의 및 코멘트 <span className="text-[#0064fa] bg-blue-50 px-2 py-0.5 rounded text-xs">{activePin.comments.length}</span>
                    </h3>
                    
                    <div className="space-y-4 mb-5">
                      {activePin.comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">등록된 코멘트가 없습니다.</p>
                      ) : (
                        activePin.comments.map((comment) => (
                          <div key={comment.id} className="bg-slate-50/80 rounded-xl p-4 text-sm border border-slate-100 shadow-sm relative group">
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
                              <div className="flex items-center gap-2">
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity mr-1">
                                  <button onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.text); }} className="text-slate-400 hover:text-blue-500 text-[10px] font-bold">수정</button>
                                  <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500 text-[10px] font-bold">삭제</button>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {formatTimeAgo(comment.createdAt)} {comment.isEdited && "(편집됨)"}
                                </span>
                              </div>
                            </div>
                            {editingCommentId === comment.id ? (
                              <div className="flex flex-col gap-2 mt-2">
                                <Input 
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  className="text-xs h-8 bg-white border-slate-200"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.nativeEvent.isComposing) return;
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleEditComment(comment.id, editCommentText);
                                    } else if (e.key === 'Escape') {
                                      setEditingCommentId(null);
                                    }
                                  }}
                                />
                                <div className="flex justify-end gap-3">
                                  <button onClick={() => setEditingCommentId(null)} className="text-[10px] text-slate-500 hover:text-slate-700 font-bold">취소</button>
                                  <button onClick={() => handleEditComment(comment.id, editCommentText)} className="text-[10px] text-blue-600 font-bold hover:text-blue-800">저장</button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-600 text-xs leading-relaxed">{renderTextWithMentions(comment.text)}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                  {user ? (
                    <div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-[#0064fa]/30 overflow-visible h-10 px-1 gap-1 relative shadow-sm transition-all">
                      
                      {isMentionOpen && PRESET_MEMBERS.filter(m => m.name.includes(mentionQuery)).length > 0 && (
                        <div className="absolute bottom-full mb-1 left-24 w-[180px] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-[220px] overflow-y-auto animate-in fade-in zoom-in-95">
                          {PRESET_MEMBERS.filter(m => m.name.includes(mentionQuery)).map((m, index) => (
                            <button
                              key={m.id}
                              className={`w-full text-left px-3 py-2 text-xs transition-colors border-b border-slate-50 last:border-0 flex justify-between items-center ${index === mentionSelectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                              onClick={() => handleMentionSelect(m)}
                            >
                              <span className="font-bold text-slate-800">{m.name}</span>
                              <span className="text-[10px] text-slate-400">{m.role}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="relative flex-1 h-full overflow-hidden">
                        <div 
                          ref={overlayRef}
                          className="absolute inset-0 px-2 flex items-center overflow-x-auto overflow-y-hidden text-xs font-sans tracking-normal pointer-events-none text-slate-800 scrollbar-hide whitespace-pre" 
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                          aria-hidden="true"
                        >
                          <span className="shrink-0">
                            {newComment ? (() => {
                              const memberNames = PRESET_MEMBERS.map(m => m.name).join('|');
                              const regex = new RegExp(`(@(?:${memberNames}))`, 'g');
                              return newComment.split(regex).map((part, i) => {
                                if (part.startsWith('@')) {
                                  return (
                                    <span key={i} className="text-blue-600 font-medium">
                                      {part}
                                    </span>
                                  );
                                }
                                return <span key={i}>{part}</span>;
                              });
                            })() : <span className="text-slate-400">문의 내용 입력 (@로 멘션 가능)</span>}
                          </span>
                        </div>
                        <textarea 
                          className="relative border-0 bg-transparent focus-visible:ring-0 shadow-none px-2 h-full w-full text-xs font-sans tracking-normal text-transparent placeholder:text-transparent resize-none outline-none whitespace-pre overflow-x-auto overflow-y-hidden scrollbar-hide flex items-center"
                          style={{ caretColor: '#1e293b', lineHeight: '40px', paddingTop: 0, paddingBottom: 0 }}
                          value={newComment}
                          onChange={(e: any) => handleCommentChange(e)}
                          onScroll={(e) => {
                            if (overlayRef.current) overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isMentionOpen) {
                                e.preventDefault();
                                handleAddComment();
                                return;
                            }
                            if (e.nativeEvent.isComposing) return;
                            if (isMentionOpen) {
                              const filtered = PRESET_MEMBERS.filter(m => m.name.includes(mentionQuery));
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setMentionSelectedIndex(prev => (prev + 1) % filtered.length);
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setMentionSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
                              } else if (e.key === 'Enter') {
                                e.preventDefault();
                                if (filtered[mentionSelectedIndex]) handleMentionSelect(filtered[mentionSelectedIndex]);
                              } else if (e.key === 'Escape') {
                                setIsMentionOpen(false);
                              }
                              return;
                            }
                            if (e.key === 'Escape') setIsMentionOpen(false);
                          }}
                        />
                      </div>
                      
                      <Button size="icon" className="h-8 w-8 bg-[#0064fa] hover:bg-[#0064fa]/90 shrink-0 shadow-sm rounded-md mr-0.5" onClick={handleAddComment}>
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full text-center p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 mt-2">
                      댓글을 달려면 <Link href="/login" className="text-[#0064fa] font-bold hover:underline">로그인</Link> 해주세요.
                    </div>
                  )}
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
      
      <CustomAlert 
        isOpen={isPinDeleteAlertOpen}
        title="핀 삭제"
        description={<>이 핀을 정말 삭제하시겠습니까?<br/>작성된 코멘트와 함께 모든 데이터가 삭제됩니다.</>}
        onCancel={() => {
          setIsPinDeleteAlertOpen(false);
          setPinToDelete(null);
        }}
        onConfirm={confirmDeletePin}
        variant="2-button"
      />

      <CustomAlert 
        isOpen={isCommentDeleteAlertOpen}
        title="코멘트 삭제"
        description="정말 이 코멘트를 삭제하시겠습니까?"
        onCancel={() => {
          setIsCommentDeleteAlertOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={confirmDeleteComment}
        variant="2-button"
      />

      <CustomAlert 
        isOpen={isProjectDeleteAlertOpen}
        title="프로젝트 삭제"
        description={<>이 프로젝트를 삭제하시겠습니까?<br/>모든 데이터가 삭제되며 복구할 수 없습니다.</>}
        onCancel={() => setIsProjectDeleteAlertOpen(false)}
        onConfirm={confirmDeleteProject}
        variant="2-button"
      />

      <CustomAlert 
        isOpen={isReuploadAlertOpen}
        title="이미지 다시 올리기"
        description={<>현재 올려둔 테스트 화면 이미지가 모두 지워집니다.<br/>정말 다시 올리시겠습니까?</>}
        onCancel={() => setIsReuploadAlertOpen(false)}
        onConfirm={() => {
          setActualImage(null);
          setIsReuploadAlertOpen(false);
        }}
        confirmText="다시 올리기"
        cancelText="취소"
      />

      <CustomAlert 
        isOpen={isExitAlertOpen}
        title={exitAlertType === 'no-image' ? "미작성 화면 안내" : "미작성 이슈 안내"}
        description={
          exitAlertType === 'no-image' 
            ? <>아직 확인 대기 중인 화면이 남아있습니다.<br/>QA를 모두 완료해야 대시보드로 나갈 수 있습니다.</>
            : <>이미지는 업로드되었으나 내용이 비어있는 핀(이슈)이 있습니다.<br/>내용을 작성하거나 불필요한 핀을 삭제해주세요.</>
        }
        confirmText={exitAlertType === 'no-image' ? "다음 미작성 화면으로 이동" : "해당 핀으로 이동"}
        onConfirm={() => {
          if (unreviewedScreen) {
            setActiveScreenId(unreviewedScreen.id);
            if (exitAlertType === 'empty-pin') {
              const allPins = [...(unreviewedScreen.PC?.pins || []), ...(unreviewedScreen.Mobile?.pins || [])];
              const emptyPin = allPins.find(p => !(p.description || "").trim() && !(p.request || "").trim());
              if (emptyPin) {
                const isPC = unreviewedScreen.PC?.pins.some(p => p.id === emptyPin.id);
                const targetDevice = isPC ? "PC" : "Mobile";
                setDevice(targetDevice);
                setDevice(targetDevice);
                setActivePinId(emptyPin.id);
              }
            }
            setIsExitAlertOpen(false);
          }
        }}
        variant="1-button"
      />

      <Dialog open={isProjectSettingsOpen} onOpenChange={setIsProjectSettingsOpen}>
        <DialogContent className="sm:max-w-[500px] p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">프로젝트 설정</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              프로젝트의 이름과 플랫폼, 상태를 변경할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-2">
            <div className="space-y-2.5">
              <Label htmlFor="edit-name" className="text-sm font-bold text-slate-800">프로젝트 이름</Label>
              <Input
                id="edit-name"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="edit-figma" className="text-sm font-bold text-slate-800">전체 피그마 프로젝트 링크 (선택)</Label>
              <Input
                id="edit-figma"
                placeholder="피그마 링크를 넣어주세요."
                value={editProjectFigmaUrl}
                onChange={(e) => setEditProjectFigmaUrl(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-800">플랫폼 유형</Label>
                <div className="flex flex-col gap-2">
                  {["Web (반응형)", "App (iOS/Android)", "기타"].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setEditProjectPlatform(platform)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all text-left ${
                        editProjectPlatform === platform
                          ? "bg-[#0064fa] text-white border-[#0064fa] shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-800">진행 상태</Label>
                <div className="flex flex-col gap-2">
                  {["진행중", "완료됨", "홀딩"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditProjectStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all text-left ${
                        editProjectStatus === status
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="edit-date" className="text-sm font-bold text-slate-800">요청일</Label>
              <Input
                id="edit-date"
                type="date"
                value={editProjectDueDate}
                onChange={(e) => setEditProjectDueDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="mt-8 !bg-transparent !border-none !p-0 !m-0 border-t border-slate-100 pt-6">
            <div className="flex justify-between w-full">
              {canManageProjects ? (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsProjectSettingsOpen(false);
                    setTimeout(() => setIsProjectDeleteAlertOpen(true), 150);
                  }} 
                  className="h-12 px-4 font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  프로젝트 삭제
                </Button>
              ) : <div></div>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsProjectSettingsOpen(false)} className="h-12 px-6 font-semibold rounded-lg text-slate-600 hover:text-slate-800">취소</Button>
                <Button 
                  onClick={() => handleUpdateProjectSettings(false)} 
                  disabled={!editProjectName.trim()}
                  className={`h-12 px-8 font-bold rounded-lg text-base transition-all ${
                    editProjectName.trim()
                      ? "bg-[#0064fa] hover:bg-[#0064fa]/90 text-white shadow-md" 
                      : "bg-slate-200 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  저장하기
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomAlert 
        isOpen={isProjectCompleteAlertOpen}
        title="프로젝트 완료 안내"
        description={<>아직 해결되지 않은 이슈가 남아있습니다.<br/>이대로 QA를 종료하고 완료 처리하시겠습니까?</>}
        onCancel={() => setIsProjectCompleteAlertOpen(false)}
        onConfirm={() => {
          setIsProjectCompleteAlertOpen(false);
          handleUpdateProjectSettings(true);
        }}
        variant="2-button"
      />
    </div>
  );
}
