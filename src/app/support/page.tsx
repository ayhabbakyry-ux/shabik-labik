
"use client";

import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Phone, ShieldCheck, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SupportPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pb-24 bg-background" dir="rtl">
      <DesktopHeader />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition active:scale-95"
        >
          <ArrowRight className="h-6 w-6 text-primary" />
        </button>
        <h1 className="text-lg font-bold font-headline">الدعم الفني</h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Menu className="h-6 w-6 text-primary" />
        </button>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-6 pt-10">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-headline">مركز مساعدة شبيك لبيك</h1>
          <p className="text-muted-foreground text-sm">نحن هنا لخدمتك، تواصل معنا عبر الوسائل التالية</p>
        </div>

        <div className="grid gap-4">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
            <CardContent className="p-0">
              <a 
                href="https://wa.me/963939549573" 
                target="_blank" 
                className="flex items-center gap-4 p-6 bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <div className="bg-white/20 p-3 rounded-2xl">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">تواصل عبر واتساب</p>
                  <p className="text-xs opacity-80">رد سريع خلال دقائق</p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardContent className="p-0">
              <a 
                href="tel:0939549573" 
                className="flex items-center gap-4 p-6 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Phone className="h-8 w-8" />
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">اتصال هاتفي مباشر</p>
                  <p className="text-xs opacity-80">0939549573</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30 border-dashed border-2 text-center p-8 rounded-[32px]">
           <p className="text-sm font-bold text-muted-foreground leading-relaxed">
             أوقات الدوام الرسمي من الساعة 10 صباحاً وحتى 10 مساءً. 
             <br />
             سيتم الرد على استفساراتكم في أسرع وقت ممكن.
           </p>
        </Card>
      </main>

      <Navbar />
    </div>
  );
}
