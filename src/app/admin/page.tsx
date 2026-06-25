
"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, ShieldAlert } from "lucide-react";

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
    <div className="min-h-screen bg-background" dir="rtl">
      <DesktopHeader />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition active:scale-95 flex items-center gap-1"
        >
          <ArrowRight className="h-6 w-6 text-primary" />
          <span className="text-xs font-bold text-primary">الرئيسية</span>
        </button>
        <h1 className="text-lg font-bold font-headline">لوحة الإدارة</h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Menu className="h-6 w-6 text-primary" />
        </button>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
        <div className="hidden md:flex items-center gap-2 mb-6">
           <button 
             onClick={() => router.push('/dashboard')}
             className="flex items-center gap-2 text-primary font-bold hover:underline"
           >
             <ArrowRight className="h-5 w-5" /> العودة للرئيسية
           </button>
        </div>
        <AdminPanel />
      </main>

      <Navbar />
    </div>
  );
}
