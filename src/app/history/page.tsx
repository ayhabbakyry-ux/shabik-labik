
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  History,
  Calendar
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate] = useState('2026-06-24');
  const [toDate] = useState('2026-06-24');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#11151d] text-white flex flex-col pb-20" dir="rtl">
      
      {/* 1. شريط العنوان العلوي (Header) */}
      <header className="flex items-center justify-between p-4 bg-[#161a23] border-b border-gray-800 sticky top-0 z-40">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-full transition active:scale-90"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold font-headline">الطلبات</h1>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-yellow-500" />
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1"
          >
            <History className="h-6 w-6" />
          </button>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. محتوى الصفحة الأساسي */}
      <main className="flex-1 p-4 space-y-5 overflow-y-auto">
        
        {/* فلاتر التواريخ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="absolute -top-2.5 right-4 bg-[#11151d] px-2 text-[10px] text-gray-400 z-10 font-bold">من</label>
            <div className="bg-[#161a23] border border-gray-800 rounded-full px-4 py-3 flex items-center justify-center">
              <span className="text-center w-full font-mono text-sm text-white">{fromDate}</span>
            </div>
          </div>

          <div className="relative">
            <label className="absolute -top-2.5 right-4 bg-[#11151d] px-2 text-[10px] text-gray-400 z-10 font-bold">إلى</label>
            <div className="bg-[#161a23] border border-gray-800 rounded-full px-4 py-3 flex items-center justify-center">
              <span className="text-center w-full font-mono text-sm text-white">{toDate}</span>
            </div>
          </div>
        </div>

        {/* زر البحث الأزرق العلوي */}
        <div className="flex justify-end">
          <Button size="icon" className="bg-[#0091ea] hover:bg-blue-600 h-12 w-12 rounded-full shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
            <Search className="h-5 w-5 text-white stroke-[3px]" />
          </Button>
        </div>

        {/* حقل البحث الرئيسي مع الأيقونة الزرقاء الجانبية */}
        <div className="flex items-center gap-3 bg-[#161a23] border border-gray-800 rounded-full px-4 py-1 shadow-inner group focus-within:border-blue-500/50 transition-colors">
          <input
            type="text"
            placeholder="بحث"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-right w-full focus:outline-none text-sm text-gray-200 pr-2 h-10"
          />
          <button className="text-[#0091ea] p-1.5 hover:scale-110 transition-transform">
            <Search className="h-5 w-5 stroke-[2.5px]" />
          </button>
        </div>

        {/* حالة لا توجد عناصر */}
        <div className="flex flex-col items-center justify-center pt-16 space-y-4">
          <div className="relative w-28 h-28 opacity-60">
            <div className="absolute inset-0 bg-gray-700 rounded-xl transform -rotate-6 border border-gray-600"></div>
            <div className="absolute inset-0 bg-gray-100 rounded-xl border border-white flex flex-col p-3 shadow-2xl">
              <div className="w-10 h-2.5 bg-purple-500 rounded-full self-center -mt-5 mb-4 shadow-md"></div>
              <div className="w-full h-2 bg-gray-300 rounded-full mb-2"></div>
              <div className="w-full h-2 bg-gray-300 rounded-full mb-2"></div>
              <div className="w-2/3 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-400 font-bold text-lg">لا توجد عناصر</p>
            <p className="text-gray-500 text-xs mt-1">لم يتم العثور على أي طلبات في هذه الفترة.</p>
          </div>
        </div>

      </main>

      <Navbar />
    </div>
  );
}
