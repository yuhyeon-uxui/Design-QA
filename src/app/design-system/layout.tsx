import { AdminLayout } from "@/components/AdminLayout";
import { Palette } from "lucide-react";

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      <div className="pb-12 bg-white min-h-screen">
        <header className="bg-white border-b sticky top-0 z-10 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-800 font-bold">
            <Palette className="w-6 h-6 text-[#0064fa]" />
            <span className="text-lg">디자인 시스템 가이드</span>
          </div>
        </header>
        <main className="container mx-auto px-8 py-10 max-w-5xl space-y-16">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Design System</h1>
            <p className="text-slate-500 text-lg">
              Design QA Hub 구축에 사용된 색상, 타이포그래피, 컴포넌트 정책입니다.
            </p>
          </div>
          {children}
        </main>
      </div>
    </AdminLayout>
  );
}
