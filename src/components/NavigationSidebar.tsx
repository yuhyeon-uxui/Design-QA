"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Menu, BarChart3, Palette, ChevronDown, ChevronRight, Activity, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

export function NavigationSidebar() {
  const { isMaster } = useAuthStore();
  const pathname = usePathname();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(pathname.startsWith("/analytics"));

  if (!isMaster) return null;

  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 mr-2 h-9 w-9 text-slate-500 hover:text-slate-800 shrink-0">
        <Menu className="w-5 h-5" />
        <span className="sr-only">Toggle Menu</span>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col border-r shadow-xl">
        <SheetHeader className="p-6 border-b text-left bg-slate-50/50">
          <SheetTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0064fa] text-white flex items-center justify-center font-bold text-xs shrink-0">QA</div>
            관리자 메뉴
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Analytics Accordion */}
          <Collapsible
            open={isAnalyticsOpen}
            onOpenChange={setIsAnalyticsOpen}
            className="w-full"
          >
            <CollapsibleTrigger 
              className={`inline-flex items-center whitespace-nowrap rounded-md text-sm transition-colors w-full justify-between h-11 px-3 ${isAnalyticsOpen || pathname.startsWith("/analytics") ? 'bg-[#EEF2FF] text-[#0064fa] font-semibold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'}`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 shrink-0" />
                <span>통계 대시보드</span>
              </div>
              {isAnalyticsOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-1 pb-2 px-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link href="/analytics">
                <SheetClose 
                  className={`inline-flex items-center whitespace-nowrap rounded-md transition-colors w-full justify-start h-9 pl-9 text-sm font-medium ${pathname === "/analytics" ? 'text-[#0064fa] bg-[#0064fa]/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  프로젝트 현황
                </SheetClose>
              </Link>
              
              <Link href="/analytics/metrics">
                <SheetClose 
                  className={`inline-flex items-center whitespace-nowrap rounded-md transition-colors w-full justify-start h-9 pl-9 text-sm font-medium ${pathname === "/analytics/metrics" ? 'text-[#0064fa] bg-[#0064fa]/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  유저 행동 지표
                </SheetClose>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          {/* Design System Link */}
          <Link href="/design-system">
            <SheetClose 
              className={`inline-flex items-center whitespace-nowrap rounded-md transition-colors w-full justify-start h-11 px-3 mt-1 font-medium ${pathname === "/design-system" ? 'bg-[#EEF2FF] text-[#0064fa] font-semibold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Palette className="w-5 h-5 mr-3 shrink-0" />
              디자인 시스템
            </SheetClose>
          </Link>
        </div>
        
        <div className="p-6 border-t bg-slate-50">
          <p className="text-xs text-slate-400 font-medium">관리자(Master) 전용 설정 메뉴입니다.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
