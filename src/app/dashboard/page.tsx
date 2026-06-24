
"use client";

import { WalletCard } from "@/components/dashboard/WalletCard";
import { ServiceGrid } from "@/components/dashboard/ServiceGrid";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { useUser } from "@/lib/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardPage() {
  const { isLoggedIn, userPhone } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background" dir="rtl">
        <AppSidebar />
        
        <SidebarInset className="flex-1 overflow-x-hidden">
          <DesktopHeader />
          
          <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-24 md:pb-8">
            {/* Mobile Header Area */}
            <div className="md:hidden flex items-center justify-between mb-2">
              <div className="text-right">
                <h1 className="text-lg font-bold font-headline">أهلاً، <span className="text-primary">{userPhone}</span></h1>
                <p className="text-xs text-muted-foreground">وصول سريع للخدمات الرقمية</p>
              </div>
              <button className="p-2 bg-white rounded-full shadow-sm">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <WalletCard />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">الخدمات</h3>
                <span className="text-xs text-primary font-bold uppercase tracking-widest cursor-pointer hover:underline">عرض الكل</span>
              </div>
              
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pr-10 bg-white border-none shadow-sm h-11 text-right" placeholder="ابحث عن ألعاب، بطاقات شحن..." />
              </div>

              <ServiceGrid isAdmin={userPhone === "0939549573"} />
            </div>

            {/* Featured Section */}
            <div className="rounded-2xl bg-gradient-to-br from-secondary to-blue-700 p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-xl mb-2">تحديث ببجي موبايل 3.5</h4>
                <p className="text-sm opacity-90 mb-4 max-w-md">تمت مزامنة عناصر الموسم الجديدة من الراغب. احصل على حزم UC الحصرية الآن بأفضل الأسعار!</p>
                <button className="px-8 py-2.5 bg-white text-secondary rounded-full font-bold text-sm shadow-md hover:scale-105 transition-transform active:scale-95">
                  تصفح الحزم
                </button>
              </div>
              <div className="absolute left-[-20px] bottom-[-20px] opacity-20 transform -rotate-12">
                <Search className="h-40 w-40" />
              </div>
            </div>
          </main>

          <Navbar />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
