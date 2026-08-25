"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [team, setTeam] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUpMode && !name.trim()) {
      toast.error("실명을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    
    const metadata = {
      full_name: name,
      position: position,
      team: team,
      is_external: isExternal
    };
    
    try {
      if (isSignUpMode) {
        const signUpRes = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata }
        });
        
        if (signUpRes.error) {
          toast.error(signUpRes.error.message);
        } else {
          toast.success("회원가입이 완료되었습니다.");
          router.push("/");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
        } else if (data.user) {
          toast.success("로그인 성공!");
          router.push("/");
        }
      }
    } catch (error) {
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold text-sm">홈으로 돌아가기</span>
      </Link>
      
      <Card className="w-full max-w-md border-none shadow-xl shadow-blue-900/5 my-8">
        <CardHeader className="space-y-3 pb-6 text-center pt-8">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-[#0064fa]" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">{isSignUpMode ? "회원가입" : "로그인"}</CardTitle>
          <CardDescription className="text-base">
            프로젝트 열람 및 QA 참여를 위해 {isSignUpMode ? "가입하세요." : "로그인하세요."}
            {!isSignUpMode && (
              <>
                <br />
                <span className="text-xs text-slate-400">(관리자 권한은 등록된 이메일 로그인 시 자동 부여됩니다)</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {isSignUpMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">실명 (필수)</Label>
                    <Input id="name" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} required={isSignUpMode} className="h-11 bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-semibold text-slate-700">직급 (선택)</Label>
                    <Input id="position" placeholder="예: 선임, 프로" value={position} onChange={(e) => setPosition(e.target.value)} className="h-11 bg-slate-50 border-slate-200" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team" className="text-sm font-semibold text-slate-700">소속 팀명 (선택)</Label>
                  <Input id="team" placeholder="예: 디자인 1팀, 개발팀" value={team} onChange={(e) => setTeam(e.target.value)} className="h-11 bg-slate-50 border-slate-200" />
                </div>

                <div className="flex items-center space-x-2 py-1">
                  <Checkbox id="external" checked={isExternal} onCheckedChange={(checked) => setIsExternal(checked === true)} />
                  <label htmlFor="external" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600">
                    외주사 직원입니다 (선택)
                  </label>
                </div>
              </>
            )}

            <div className={`space-y-2 ${isSignUpMode ? 'pt-2 border-t border-slate-100' : ''}`}>
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">이메일 주소</Label>
              <Input
                id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="h-12 px-4 bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">비밀번호</Label>
              <Input
                id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="h-12 px-4 bg-slate-50 border-slate-200"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-bold bg-[#0064fa] hover:bg-[#0064fa]/90 mt-4" disabled={isLoading}>
              {isLoading ? (isSignUpMode ? "가입 중..." : "로그인 중...") : (isSignUpMode ? "회원가입" : "로그인")}
            </Button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-sm text-slate-500 hover:text-[#0064fa] hover:underline transition-colors"
              >
                {isSignUpMode ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
