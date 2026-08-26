"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Users, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

interface RoleRecord {
  email: string;
  role: UserRole;
  createdAt: number;
}

export default function MembersRolePage() {
  const { canViewAdminMenu, isMaster } = useAuthStore();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("GENERAL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (canViewAdminMenu) {
      fetchRoles();
    }
  }, [canViewAdminMenu]);

  const fetchRoles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const roleData: RoleRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        roleData.push({
          email: doc.id,
          role: data.role as UserRole,
          createdAt: data.createdAt || Date.now(),
        });
      });
      // Sort by creation time
      roleData.sort((a, b) => b.createdAt - a.createdAt);
      setRoles(roleData);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      toast.error("권한 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateRole = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }
    
    if (email === "aayhh1127@gmail.com") {
      toast.error("최고 관리자 계정은 권한을 변경할 수 없습니다.");
      return;
    }

    try {
      await setDoc(doc(db, "users", email), {
        role: newRole,
        createdAt: Date.now()
      }, { merge: true });
      
      toast.success(`${email} 계정에 ${newRole} 권한이 부여되었습니다.`);
      setNewEmail("");
      setNewRole("GENERAL");
      fetchRoles();
    } catch (err) {
      console.error("Failed to update role:", err);
      toast.error("권한 부여에 실패했습니다.");
    }
  };

  const handleDeleteRole = async (email: string) => {
    if (!confirm(`${email} 계정의 권한 설정을 삭제하시겠습니까? (삭제 시 GENERAL 권한으로 강등됩니다)`)) return;
    
    try {
      await deleteDoc(doc(db, "users", email));
      toast.success(`${email} 계정의 권한이 삭제되었습니다.`);
      fetchRoles();
    } catch (err) {
      console.error("Failed to delete role:", err);
      toast.error("권한 삭제에 실패했습니다.");
    }
  };

  if (!isMaster) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">접근 권한이 없습니다</h2>
            <p className="text-slate-500 mt-2">최고 관리자(Master)만 접근할 수 있는 페이지입니다.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0064fa]" />
            사용자 권한 관리
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            팀원 또는 외주사의 이메일을 등록하고 권한 등급을 지정합니다. 이곳에 등록되지 않은 사용자는 기본적으로 'GENERAL (일반)' 등급을 갖습니다.
          </p>
        </div>

        <div className="grid gap-8">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg">새 권한 부여</CardTitle>
              <CardDescription>유저의 가입 이메일을 정확히 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email" className="font-semibold text-slate-700">이메일 계정</Label>
                  <Input 
                    id="email" 
                    placeholder="example@gmail.com" 
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="w-48 space-y-2">
                  <Label className="font-semibold text-slate-700">권한 등급 (Role)</Label>
                  <Select value={newRole} onValueChange={(val) => setNewRole(val as UserRole)}>
                    <SelectTrigger className="h-10 font-medium">
                      <SelectValue placeholder="권한 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUB_MASTER">부마스터 (SUB_MASTER)</SelectItem>
                      <SelectItem value="DEVELOPER">개발자 (DEVELOPER)</SelectItem>
                      <SelectItem value="GENERAL">일반 (GENERAL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddOrUpdateRole}
                  className="h-10 px-8 bg-[#0064fa] hover:bg-[#0064fa]/90 text-white font-bold"
                >
                  부여하기
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg">가입된 전체 회원 목록</CardTitle>
              <CardDescription>우리 서비스에 접속(로그인/가입)했던 모든 사용자 목록입니다.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center text-slate-500">목록을 불러오는 중입니다...</div>
              ) : roles.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-50/30">
                  <p>아직 등록된 사용자가 없습니다. (사용자가 로그인하면 자동으로 이곳에 추가됩니다!)</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {roles.map((roleRecord) => (
                    <div key={roleRecord.email} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-800">{roleRecord.email}</span>
                        <span className="text-xs text-slate-400">
                          등록일: {new Date(roleRecord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          roleRecord.role === 'SUB_MASTER' ? 'bg-purple-100 text-purple-700' :
                          roleRecord.role === 'DEVELOPER' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {roleRecord.role}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteRole(roleRecord.email)}
                          className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 w-8 h-8"
                          title="권한 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
