
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Bell,
  Menu
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function NotificationsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#11151d] text-white flex flex-col pb-20" dir="rtl">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#161a23] border-b border-gray-800 sticky top-0 z-40">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-full transition active:scale-90"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold font-headline">الإشعارات</h1>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-yellow-500" />
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col items-center justify-center space-y-6">
        
        <div className="relative">
          <div className="bg-gray-800/30 p-8 rounded-full animate-pulse">
            <Bell className="h-20 w-20 text-gray-600 stroke-[1px]" />
          </div>
          <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full border-4 border-[#11151d] hidden"></div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-gray-400 font-bold text-xl">لا توجد إشعارات جديدة</p>
          <p className="text-gray-500 text-sm max-w-[250px] mx-auto">سوف تظهر هنا إشعارات العمليات المالية والتحديثات الجديدة فور وصولها.</p>
        </div>

      </main>

      <Navbar />
    </div>
  );
}
