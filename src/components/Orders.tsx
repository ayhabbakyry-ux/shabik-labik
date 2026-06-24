
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Bell,
  Menu
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';

interface OrdersProps {
  initialTab?: 'orders' | 'notifications';
}

export default function Orders({ initialTab = 'orders' }: OrdersProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate] = useState('2026-06-24');
  const [toDate] = useState('2026-06-24');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [currentTab, setCurrentTab] = useState<'orders' | 'notifications'>(initialTab);

  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  return (
    <div className="min-h-screen bg-[#11151d] text-white flex flex-col" dir="rtl">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#161a23] border-b border-gray-800 sticky top-0 z-40">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-800 rounded-full transition active:scale-90"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold font-headline">
          {currentTab === 'orders' ? 'الطلبات' : 'الإشعارات'}
        </h1>
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
      <main className="flex-1 p-4 space-y-5 overflow-y-auto pb-24">
        
        {currentTab === 'orders' ? (
          <>
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

            <div className="flex justify-end">
              <Button 
                size="icon" 
                className="bg-[#0091ea] hover:bg-blue-600 h-12 w-12 rounded-full shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
              >
                <Search className="h-5 w-5 text-white stroke-[3px]" />
              </Button>
            </div>

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
                <p className="text-gray-400 font-bold text-lg font-headline">لا توجد عناصر</p>
                <p className="text-gray-500 text-xs mt-1 font-body">لم يتم العثور على أي طلبات في هذه الفترة.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 space-y-6">
            <div className="relative">
              <div className="bg-gray-800/30 p-8 rounded-full animate-pulse">
                <Bell className="h-20 w-20 text-gray-600 stroke-[1px]" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-400 font-bold text-xl font-headline">لا توجد إشعارات جديدة</p>
              <p className="text-gray-500 text-sm max-w-[250px] mx-auto font-body">سوف تظهر هنا إشعارات العمليات المالية والتحديثات الجديدة فور وصولها.</p>
            </div>
          </div>
        )}

      </main>

      {/* Shared Bottom Navigation */}
      <Navbar />

    </div>
  );
}
