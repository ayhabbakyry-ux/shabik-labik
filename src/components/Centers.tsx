
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Menu, 
  MapPin, 
  MessageCircle
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function Centers() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#11151d] text-white flex flex-col pb-20" dir="rtl">
      
      {/* 1. الشريط العلوي (Header) */}
      <header className="flex items-center justify-between p-4 bg-[#161a23] border-b border-gray-800 sticky top-0 z-40">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-full transition active:scale-90"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold font-headline">المراكز المعتمدة</h1>
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

      {/* 2. المحتوى الأساسي - رسالة الانضمام */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        
        {/* أيقونة الموقع الجغرافي المتحركة بشكل خفيف */}
        <div className="w-24 h-24 bg-[#1c232d] border border-gray-800 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <MapPin className="h-12 w-12 text-primary" />
        </div>

        {/* نصوص الرسالة بالتنسيق والعبارات المطلوبة */}
        <div className="space-y-3 max-w-sm">
          <h2 className="text-xl font-bold text-gray-300 font-headline">لا يوجد حالياً</h2>
          
          <p className="text-gray-400 text-md leading-relaxed font-body">
            إذا كنت ترغب بالانضمام إلينا تواصل معنا
          </p>
          
          <p className="text-[#22c55e] font-black text-xl pt-2 tracking-wide font-headline">
            نكبر بكم إن شاء الله ❤️
          </p>
        </div>

        {/* زر التواصل السريع عبر الواتساب */}
        <a 
          href="https://wa.me/963939549573" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#1e3329] border border-[#22c55e] text-[#22c55e] font-bold px-8 py-3 rounded-full hover:bg-[#22c55e] hover:text-white transition-all shadow-md text-md mt-4"
        >
          <MessageCircle className="h-5 w-5" />
          تواصل معنا الآن
        </a>

      </main>

      {/* 3. شريط التنقل السفلي */}
      <Navbar />

    </div>
  );
}
