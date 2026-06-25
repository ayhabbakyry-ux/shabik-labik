
"use client";

import { WalletCard } from "@/components/dashboard/WalletCard";
import { ServiceGrid } from "@/components/dashboard/ServiceGrid";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from "@/lib/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Menu, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { isLoggedIn, userPhone, isAdmin } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen w-full bg-background" dir="rtl">
      {/* Desktop Header */}
      <DesktopHeader />
      
      {/* Sidebar Overlay */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Mobile Header Area */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
            >
              <Menu className="h-6 w-6 text-primary" />
            </button>
            <div className="text-right">
              <h1 className="text-lg font-bold font-headline">أهلاً، <span className="text-primary">{isAdmin ? "المدير أيهم" : userPhone}</span></h1>
              <p className="text-[10px] text-muted-foreground">وصول سريع للخدمات الرقمية</p>
            </div>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {isAdmin && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-destructive p-2 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-destructive">لوحة الإدارة نشطة</p>
                <p className="text-[10px] text-muted-foreground">لديك طلبات إيداع بانتظار المراجعة</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => router.push('/admin')}
              className="font-bold text-xs"
            >
              فتح اللوحة
            </Button>
          </div>
        )}

        <WalletCard />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg font-headline">الخدمات</h3>
            <span className="text-xs text-primary font-bold uppercase tracking-widest cursor-pointer hover:underline">عرض الكل</span>
          </div>
          
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pr-10 bg-white border-none shadow-sm h-11 text-right" placeholder="ابحث عن ألعاب، بطاقات شحن..." />
          </div>

          <ServiceGrid isAdmin={isAdmin} />
        </div>
      </main>

      <Navbar />
    </div>
  );
}
