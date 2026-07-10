export const dynamic = 'force-dynamic';
"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu } from "lucide-react";

export default function AdminPage() {
  const { isAdmin, isLoggedIn } = useUser();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    } else if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, isLoggedIn, router]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fc]" dir="rtl">
      <DesktopHeader />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40 shadow-sm">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-primary/10 rounded-xl transition active:scale-95 flex items-center gap-1 text-primary"
        >
          <ArrowRight className="h-6 w-6" />
          <span className="text-xs font-bold">الرئيسية</span>
        </button>
        <span className="font-bold text-sm">إدارة المنصة</span>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-muted rounded-xl text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-10 pb-24 md:pb-12">
        {/* Desktop Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 mb-8 animate-in slide-in-from-right duration-500">
           <button 
             onClick={() => router.push('/dashboard')}
             className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-primary font-bold hover:bg-primary hover:text-white transition-all group"
           >
             <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /> 
             العودة للوحة الرئيسية
           </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AdminPanel />
        </div>
      </main>

      <Navbar />
    </div>
  );
}
