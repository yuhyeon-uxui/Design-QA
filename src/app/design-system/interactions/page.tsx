"use client";

import { CheckSquare, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function InteractionsPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-2">
        <CheckSquare className="w-5 h-5 text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-800">Interactions (인터랙션)</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Modals & Dialogs</CardTitle>
            <CardDescription>사용자 피드백 및 알림을 위한 모달 인터랙션</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm transition-colors w-full h-12 px-4 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200">
                <span className="flex-1 text-left font-medium">다이얼로그 열기 (Dialog)</span>
                <MousePointerClick className="w-4 h-4 text-slate-400" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>프로젝트 삭제</DialogTitle>
                  <DialogDescription>
                    정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline">취소</Button>
                  <Button variant="destructive">삭제하기</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium transition-colors w-full h-12 px-4 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200">
                <span className="flex-1 text-left font-medium">우측 시트 열기 (Sheet)</span>
                <MousePointerClick className="w-4 h-4 text-slate-400" />
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>상세 설정</SheetTitle>
                  <SheetDescription>
                    이 곳에 화면 설정이나 필터 옵션 등이 들어갑니다.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <p className="text-sm text-slate-500">시트 내부 콘텐츠 예시입니다.</p>
                </div>
              </SheetContent>
            </Sheet>

          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Dropdowns</CardTitle>
            <CardDescription>선택 메뉴 및 팝오버 인터랙션</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="option1">
              <SelectTrigger className="w-full h-12 bg-slate-50 border-slate-200">
                <SelectValue placeholder="드롭다운 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">옵션 1 (Hover 시 스타일 변화)</SelectItem>
                <SelectItem value="option2">옵션 2 (클릭 시 액션)</SelectItem>
                <SelectItem value="option3">옵션 3 (비활성화 상태 가능)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
