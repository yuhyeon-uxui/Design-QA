"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function MyPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [team, setTeam] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      const meta = user.user_metadata || {};
      setName(meta.full_name || "");
      setPosition(meta.position || "");
      setTeam(meta.team || "");
      setIsExternal(meta.is_external === true);
    }
  }, [user, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("실명을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        position: position,
        team: team,
        is_external: isExternal,
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error("정보 수정에 실패했습니다: " + error.message);
    } else {
      toast.success("내 정보가 성공적으로 저장되었습니다!");
      // useAuthStore will automatically update since it listens to onAuthStateChange
      router.push("/");
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold text-sm">홈으로 돌아가기</span>
      </Link>
      
      <Card className="w-full max-w-md border-none shadow-xl shadow-blue-900/5 my-8">
        <CardHeader className="space-y-3 pb-6 text-center pt-8">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <UserCircle className="w-6 h-6 text-[#0064fa]" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">마이페이지</CardTitle>
          <CardDescription className="text-base">
            내 계정 정보를 수정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">이메일 주소</Label>
              <Input
                type="email" value={user.email || ""} disabled
                className="h-12 px-4 bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">실명 <span className="text-xs font-medium text-slate-400">필수</span></Label>
                <Input
                  id="name" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)}
                  className="h-12 px-4 bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">직급 <span className="text-xs font-medium text-slate-400">선택</span></Label>
                <Input
                  id="position" placeholder="예: 선임, 프로" value={position} onChange={(e) => setPosition(e.target.value)}
                  className="h-12 px-4 bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">소속 팀명 <span className="text-xs font-medium text-slate-400">선택</span></Label>
              <Input
                id="team" placeholder="예: 디자인 1팀, 개발팀" value={team} onChange={(e) => setTeam(e.target.value)}
                className="h-12 px-4 bg-slate-50 border-slate-200"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="external" checked={isExternal} onCheckedChange={(checked) => setIsExternal(checked === true)} />
              <label htmlFor="external" className="text-sm font-medium leading-none text-slate-600 cursor-pointer flex items-center gap-1.5">
                외주사 직원입니다 <span className="text-xs font-medium text-slate-400">선택</span>
              </label>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-[#0064fa] hover:bg-[#0064fa]/90 mt-6" disabled={isLoading}>
              {isLoading ? "저장 중..." : "변경사항 저장"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
