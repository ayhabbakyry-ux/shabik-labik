"use client";

import { WalletCard } from "@/components/dashboard/WalletCard";
import { ServiceGrid } from "@/components/dashboard/ServiceGrid";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from "@/lib/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Menu, ShieldAlert, BellRing } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { 
    isLoggedIn, userPhone, isAdmin, notificationsEnabled, 
    isNotificationSupported, requestNotificationPermission, userName 
  } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !userPhone) {
      router.replace("/");
    }
  }, [isLoggedIn, userPhone, router]);

  if (!isLoggedIn || !userPhone) return null;

  return (
    <div className="min-h-screen w-full bg-background" dir="rtl">
      <DesktopHeader />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div className="md:hidden flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
            >
              <Menu className="h-6 w-6 text-primary" />
            </button>
            <div className="text-right">
              <h1 className="text-lg font-bold font-headline">مرحباً، <span className="text-primary">{isAdmin ? "المدير العام" : (userName || userPhone)}</span></h1>
              <p className="text-[10px] text-muted-foreground">الوصول السريع للخدمات الرقمية</p>
            </div>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* بنر تفعيل الإشعارات - ضروري جداً لتفعيل الصوت */}
        {isNotificationSupported && !notificationsEnabled && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <BellRing className="h-4 w-4 text-white" />
              </div>
              <div className="text-right">
                <p className="font-bold text-xs text-primary">تفعيل التنبيهات ونغمة شبيك لبيك</p>
                <p className="text-[9px] text-muted-foreground">لتصلك تحديثات الطلبات والرصيد فوراً مع تنبيه صوتي.</p>
              </div>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              onClick={requestNotificationPermission}
              className="font-bold text-[10px] rounded-xl h-8 px-4"
            >
              تفعيل الآن
            </Button>
          </div>
        )}

        {isAdmin && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="bg-destructive p-2 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-destructive">لوحة الإدارة نشطة</p>
                <p className="text-[10px] text-muted-foreground">يرجى مراجعة طلبات الإيداع المعلقة.</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => router.push('/admin')}
              className="font-bold text-xs rounded-xl"
            >
              فتح اللوحة
            </Button>
          </div>
        )}

        <div className="w-full my-4 animate-in fade-in zoom-in duration-700">
          <img 
            src="https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg" 
            alt="Banner" 
            className="w-full h-auto rounded-3xl object-cover shadow-2xl border-2 border-primary/5" 
          />
        </div>

        <WalletCard />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg font-headline">الخدمات الرقمية</h3>
            <span className="text-xs text-primary font-bold uppercase tracking-widest cursor-pointer hover:underline">عرض الكل</span>
          </div>
          
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pr-10 bg-white border-none shadow-sm h-12 text-right rounded-2xl" placeholder="البحث عن الخدمات المتاحة..." />
          </div>

          <ServiceGrid isAdmin={isAdmin} />
        </div>
      </main>

      <Navbar />
    </div>
  );
}
