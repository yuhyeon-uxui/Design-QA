"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Palette, ChevronDown, ChevronRight, Activity, LayoutGrid, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsAnalyticsOpen(pathname.startsWith("/analytics"));
  }, [pathname]);

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Fixed Sidebar (LNB) */}
      <aside className="w-[260px] bg-white border-r flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="h-16 px-6 flex items-center border-b shrink-0">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">홈으로 돌아가기</span>
          </Link>
        </div>
        
        <div className="p-6 pb-2 border-b bg-slate-50/30">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Panel</h2>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0064fa] text-white flex items-center justify-center font-bold text-[10px] shrink-0">QA</div>
            <span className="font-bold text-slate-800 tracking-tight">관리자 센터</span>
          </div>
        </div>
        
        <div className="flex-1 py-4 px-4 space-y-2">
          {/* Analytics Accordion */}
          <Collapsible
            open={isAnalyticsOpen}
            onOpenChange={setIsAnalyticsOpen}
            className="w-full"
          >
            <CollapsibleTrigger 
              className={`inline-flex items-center whitespace-nowrap rounded-md text-sm transition-colors w-full justify-between h-10 px-3 ${isAnalyticsOpen || pathname.startsWith("/analytics") ? 'bg-[#EEF2FF] text-[#0064fa] font-semibold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'}`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>통계 대시보드</span>
              </div>
              {isAnalyticsOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-1 pb-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link href="/analytics" className={`flex items-center whitespace-nowrap rounded-md transition-colors w-full h-9 pl-10 text-sm font-medium ${pathname === "/analytics" ? 'text-[#0064fa] bg-[#0064fa]/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                <LayoutGrid className="w-3.5 h-3.5 mr-2" />
                프로젝트 현황
              </Link>
              
              <Link href="/analytics/metrics" className={`flex items-center whitespace-nowrap rounded-md transition-colors w-full h-9 pl-10 text-sm font-medium ${pathname === "/analytics/metrics" ? 'text-[#0064fa] bg-[#0064fa]/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Activity className="w-3.5 h-3.5 mr-2" />
                유저 행동 지표
              </Link>
            </CollapsibleContent>
          </Collapsible>

          {/* Design System Accordion */}
          <Collapsible
            open={pathname.startsWith("/design-system")}
            className="w-full"
          >
            <CollapsibleTrigger 
              className={`inline-flex items-center whitespace-nowrap rounded-md text-sm transition-colors w-full justify-between h-10 px-3 ${pathname.startsWith("/design-system") ? 'bg-[#EEF2FF] text-[#0064fa] font-semibold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'}`}
            >
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 shrink-0" />
                <span>디자인 시스템</span>
              </div>
              {pathname.startsWith("/design-system") ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-1 pb-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link href="/design-system/colors" className={`flex items-center whitespace-nowrap rounded-md transition-colors w-full h-9 pl-10 text-sm font-medium ${pathname === "/design-system/colors" ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                Colors
              </Link>
              <Link href="/design-system/typography" className={`flex items-center whitespace-nowrap rounded-md transition-colors w-full h-9 pl-10 text-sm font-medium ${pathname === "/design-system/typography" ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                Typography
              </Link>
              <Link href="/design-system/components" className={`flex items-center whitespace-nowrap rounded-md transition-colors w-full h-9 pl-10 text-sm font-medium ${pathname === "/design-system/components" ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                Components
              </Link>
              <Link href="/design-system/interactions" className={`flex items-center whitespace-nowrap rounded-md transition-colors w-full h-9 pl-10 text-sm font-medium ${pathname === "/design-system/interactions" ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                Interactions
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
