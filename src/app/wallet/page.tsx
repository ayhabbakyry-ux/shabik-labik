"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { 
  ArrowRight, 
  ShieldCheck, 
  Menu, 
  Search, 
  ShoppingBag, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/Sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function WalletPage() {
  const router = useRouter();
  const { userBalance, isLoggedIn, currency } = useUser();
  const [fromDate, setFromDate] = useState('2026-06-24');
  const [toDate, setToDate] = useState('2026-06-24');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const logoImage = PlaceHolderImages.find(img => img.id === 'app-logo');

  return (
    <div className="min-h-screen bg-[#11151d] text-white flex flex-col pb-20" dir="rtl">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#161a23] border-b border-gray-800 sticky top-0 z-40">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-800 rounded-xl transition active:scale-90 flex items-center gap-1 text-white"
        >
          <ArrowRight className="h-6 w-6" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <h1 className="text-xl font-bold font-headline">المحفظة</h1>
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
      <main className="flex-1 p-4 space-y-6 overflow-y-auto">
        
        {/* Card Row */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
          <div className="min-w-[85%] sm:min-w-[300px] flex flex-col items-center justify-center bg-green-500 p-6 rounded-2xl snap-center shadow-xl transition-transform active:scale-95 group">
            <img 
              src={logoImage?.imageUrl} 
              alt="رصيد" 
              className="w-16 h-16 mb-2 object-contain group-hover:scale-110 transition-transform" 
              data-ai-hint={logoImage?.imageHint}
            />
            <span className="text-white font-bold text-lg font-headline">رصيدك الحالي</span>
            <span className="text-white font-black text-2xl mt-1">
              SYP {userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="min-w-[85%] sm:min-w-[300px] bg-[#ff5252] p-6 rounded-2xl flex flex-col justify-between h-40 snap-center shadow-xl relative overflow-hidden group">
            <span className="text-[10px] font-bold self-start bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm z-10">SYP</span>
            <div className="text-right z-10">
              <h3 className="text-3xl font-black tracking-wide font-mono">0.00</h3>
              <p className="text-sm opacity-90 font-medium mt-2">إجمالي مشتريات</p>
            </div>
            <ShoppingBag className="absolute left-[-10px] bottom-[-10px] h-24 w-24 opacity-10 -rotate-12 group-hover:scale-110 transition-transform" />
          </div>

          <div className="min-w-[85%] sm:min-w-[300px] bg-[#7c4dff] p-6 rounded-2xl flex flex-col justify-between h-40 snap-center shadow-xl relative overflow-hidden group">
            <span className="text-[10px] font-bold self-start bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm z-10">SYP</span>
            <div className="text-right z-10">
              <h3 className="text-3xl font-black tracking-wide font-mono">0.00</h3>
              <p className="text-sm opacity-90 font-medium mt-2">الوارد</p>
            </div>
            <ArrowRight className="absolute left-[-10px] bottom-[-10px] h-24 w-24 opacity-10 rotate-[135deg] group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="absolute -top-2.5 right-4 bg-[#11151d] px-2 text-[10px] text-gray-400 z-10 font-bold">من</label>
            <div className="bg-[#161a23] border border-gray-800 rounded-full px-4 py-3 flex items-center justify-center">
              <input 
                type="text" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-center w-full focus:outline-none font-mono text-sm text-white"
              />
            </div>
          </div>

          <div className="relative">
            <label className="absolute -top-2.5 right-4 bg-[#11151d] px-2 text-[10px] text-gray-400 z-10 font-bold">إلى</label>
            <div className="bg-[#161a23] border border-gray-800 rounded-full px-4 py-3 flex items-center justify-center">
              <input 
                type="text" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-center w-full focus:outline-none font-mono text-sm text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="icon" className="bg-[#0091ea] hover:bg-blue-600 h-14 w-14 rounded-full shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
            <Search className="h-6 w-6 text-white stroke-[3px]" />
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center pt-10 space-y-4">
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
            <p className="text-gray-400 font-bold text-lg font-headline">لا توجد عناصر</p>
            <p className="text-gray-500 text-xs mt-1 font-body">لم يتم العثور على أي عمليات مالية في هذه الفترة.</p>
          </div>
        </div>
      </main>

      <Navbar />
    </div>
  );
}