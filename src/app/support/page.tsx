
"use client";

import { AIChat } from "@/components/support/AIChat";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageSquare } from "lucide-react";

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-background" dir="rtl">
      <DesktopHeader />
      
      {/* Mobile Header with Back Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition active:scale-95"
        >
          <ArrowRight className="h-6 w-6 text-primary" />
        </button>
        <h1 className="text-lg font-bold font-headline">الدعم الذكي</h1>
        <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      <main className="max-w-4xl mx-auto h-[calc(100vh-64px)] md:h-[calc(100vh-128px)] flex flex-col justify-center">
        <div className="p-4 flex-1">
          <div className="mb-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-headline">مساعد الدعم الذكي</h1>
            <p className="text-sm text-muted-foreground">مدعوم بالذكاء الاصطناعي لحل مشاكلك فوراً.</p>
          </div>
          <AIChat />
        </div>
      </main>

      <Navbar />
    </div>
  );
}
