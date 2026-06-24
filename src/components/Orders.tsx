
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  History,
  Bell,
  Home,
  Wallet,
  ShoppingBag,
  Inbox,
  Menu
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
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
  
  // حالة التبديل بين الطلبات والإشعارات
  const [currentTab, setCurrentTab] = useState<'orders' | 'notifications'>(initialTab);

  // تحديث التاب إذا تغير الـ prop (مفيد عند التنقل بين الروابط)
  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  return (
    <div className="min-h-screen bg-[#11151d] text-white flex flex-col" dir="rtl">
      
      {/* 1. شريط العنوان العلوي (Header) */}
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

      {/* 2. محتوى الصفحة الأساسي */}
      <main className="flex-1 p-4 space-y-5 overflow-y-auto pb-24">
        
        {currentTab === 'orders' ? (
          /* واجهة الطلبات */
          <>
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
              <Button 
                size="icon" 
                className="bg-[#0091ea] hover:bg-blue-600 h-12 w-12 rounded-full shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
              >
                <Search className="h-5 w-5 text-white stroke-[3px]" />
              </Button>
            </div>

            {/* حقل البحث الرئيسي */}
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
                <p className="text-gray-400 font-bold text-lg font-headline">لا توجد عناصر</p>
                <p className="text-gray-500 text-xs mt-1 font-body">لم يتم العثور على أي طلبات في هذه الفترة.</p>
              </div>
            </div>
          </>
        ) : (
          /* واجهة الإشعارات */
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

      {/* 3. شريط التنقل السفلي (Bottom Navigation) */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#161a23] border-t border-gray-800 h-20 flex items-center justify-around px-4 shadow-2xl">
        {/* زر الوارد/الدفعات */}
        <button 
          onClick={() => router.push('/payments')}
          className="p-3 text-gray-400 hover:text-white transition-all"
        >
          <Inbox className="h-6 w-6" />
        </button>
        
        {/* زر المحفظة */}
        <button 
          onClick={() => router.push('/wallet')}
          className="p-3 text-gray-400 hover:text-white transition-all"
        >
          <Wallet className="h-6 w-6" />
        </button>
        
        {/* الزر الرئيسي (الرئيسية) */}
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-[#1b222c] p-4 rounded-full border border-gray-700 shadow-xl -mt-10 text-gray-400 hover:text-white transition-all active:scale-95"
        >
          <Home className="h-7 w-7" />
        </button>
        
        {/* زر المشتريات/الطلبات */}
        <button 
          onClick={() => setCurrentTab('orders')}
          className={cn(
            "p-3 rounded-xl transition-all duration-300",
            currentTab === 'orders' ? "bg-[#242b35] text-white shadow-inner" : "text-gray-400 hover:text-white"
          )}
        >
          <ShoppingBag className="h-6 w-6" />
        </button>
        
        {/* زر الإشعارات (الجرس) */}
        <button 
          onClick={() => setCurrentTab('notifications')}
          className={cn(
            "p-3 rounded-xl transition-all duration-300",
            currentTab === 'notifications' ? "bg-[#242b35] text-white shadow-inner" : "text-gray-400 hover:text-white"
          )}
        >
          <Bell className="h-6 w-6" />
        </button>
      </footer>

    </div>
  );
}
