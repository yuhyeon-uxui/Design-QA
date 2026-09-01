"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(5);
  
  // Mock data based on the 5 rules from push_notification_policy.md
  const notifications = [
    {
      id: 1,
      type: "deadline",
      icon: "🚨",
      title: "마감일 임박 경고",
      message: "[피닉스다트 오피셜 웹페이지] 마감일이 하루 남았습니다! (미해결 이슈 3건)",
      time: "방금 전",
      isRead: false,
    },
    {
      id: 2,
      type: "gitlab",
      icon: "✅",
      title: "깃랩(GitLab) 연동 알림",
      message: "[피닉스다트 오피셜 웹페이지] 김개발 개발자님이 이슈를 해결 처리했습니다. 재검수를 진행해 주세요.",
      time: "10분 전",
      isRead: false,
    },
    {
      id: 3,
      type: "reopen",
      icon: "🔥",
      title: "잦은 반려(Re-open) 경고",
      message: "[피닉스다트 오피셜 웹페이지] 특정 이슈의 수정 요청이 3회 반복되었습니다. 개발팀과 디자인팀의 싱크(허들)를 권장합니다.",
      time: "2시간 전",
      isRead: false,
    },
    {
      id: 4,
      type: "bottleneck",
      icon: "⚠️",
      title: "병목(Bottleneck) 방치 경고",
      message: "[애니멀파크 미니게임] 3일 이상 방치된 이슈가 2건 있습니다. 담당자 확인이 필요합니다.",
      time: "어제",
      isRead: false,
    },
    {
      id: 5,
      type: "all_clear",
      icon: "🎉",
      title: "올 클리어(All Clear) 알림",
      message: "[열정팩토리] 모든 개발 수정이 완료되었습니다! 디자이너의 최종 검수를 진행해 주세요.",
      time: "어제",
      isRead: false,
    }
  ];

  const handleRead = () => {
    setUnreadCount(0);
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) handleRead(); }}>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="relative w-9 h-9 text-slate-500 hover:text-slate-800 transition-colors mr-2">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </Button>
      } />
      <DropdownMenuContent className="w-[380px] p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800">알림 센터</h4>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">New {unreadCount}</span>
            )}
          </div>
          <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setUnreadCount(0)}>
            모두 읽음 처리
          </span>
        </div>
        
        <ScrollArea className="h-[400px]">
          <div className="flex flex-col">
            {notifications.map((noti) => (
              <div 
                key={noti.id} 
                className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3 items-start"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shrink-0">
                  {noti.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">{noti.title}</p>
                    <span className="text-[10px] text-slate-400">{noti.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors break-keep">
                    {noti.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-slate-100 text-center bg-slate-50 rounded-b-xl">
          <Link href="#" className="text-xs font-bold text-[#0064fa] hover:underline">
            모든 알림 보기
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
