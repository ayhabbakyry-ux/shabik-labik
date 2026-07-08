"use client";

import { AIChat } from "@/components/support/AIChat";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu } from "lucide-react";

export default function AIAssistantPage() {
  const { isLoggedIn } = useUser();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col" dir="rtl">
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
        <span className="font-bold text-sm">المساعد الذكي</span>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-muted rounded-xl text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-10 pb-20 md:pb-12 h-[calc(100vh-80px)] md:h-auto">
        <AIChat />
      </main>

      <Navbar />
    </div>
  );
}
