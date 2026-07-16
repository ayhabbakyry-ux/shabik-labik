"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Bell,
  Menu,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Hash,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { useUser } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface OrdersProps {
  initialTab?: 'orders' | 'notifications';
}

export default function Orders({ initialTab = 'orders' }: OrdersProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { transactions, currency, checkPendingOrders, refreshCloudData } = useUser();
  const { toast } = useToast();
  
  const [currentTab, setCurrentTab] = useState<'orders' | 'notifications'>(initialTab);

  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkPendingOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, [checkPendingOrders]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCloudData();
      await checkPendingOrders();
      toast({ 
        title: "تم التحديث", 
        description: "تم فحص حالة كافة طلباتك بلمح البصر." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "فشل التحديث", 
        description: "تعذر الاتصال بالسيرفر حالياً." 
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Completed': return { color: 'bg-green-600', text: 'مكتمل', icon: <CheckCircle2 className="h-4 w-4" /> };
      case 'Rejected': return { color: 'bg-red-600', text: 'مرفوض', icon: <XCircle className="h-4 w-4" /> };
      default: return { color: 'bg-orange-500', text: 'قيد الانتظار', icon: <Clock className="h-4 w-4" /> };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('ar-SY', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = a.createdAt || a.date || "";
    const dateB = b.createdAt || b.date || "";
    return dateB.localeCompare(dateA);
  });

  const filteredTransactions = sortedTransactions.filter(tx => 
    tx.type.includes(searchQuery) || 
    (tx.details || '').includes(searchQuery) || 
    tx.id.includes(searchQuery) ||
    (tx.external_order_id || '').includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#11151d] text-white flex flex-col" dir="rtl">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#161a23] border-b border-gray-800 sticky top-0 z-40">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-800 rounded-full transition active:scale-90 flex items-center gap-1"
        >
          <ArrowRight className="h-6 w-6" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <h1 className="text-xl font-bold font-headline">
          {currentTab === 'orders' ? 'سجل الطلبات' : 'الإشعارات'}
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

      <main className="flex-1 p-4 space-y-5 overflow-y-auto pb-24">
        
        {currentTab === 'orders' ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-3 bg-[#161a23] border border-gray-800 rounded-full px-4 py-1 shadow-inner">
                <input
                  type="text"
                  placeholder="ابحث برقم الطلب أو النوع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-right w-full focus:outline-none text-sm text-gray-200 pr-2 h-10"
                />
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <Button 
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                size="icon" 
                className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-full shadow-lg shrink-0"
              >
                <RefreshCw className={`h-5 w-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-16 space-y-4">
                   <AlertCircle className="h-12 w-12 text-gray-600 opacity-20" />
                   <p className="text-gray-400 font-bold">لا توجد طلبات مسجلة</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const status = getStatusConfig(tx.status);
                  return (
                    <div key={tx.id} className="bg-[#1c232d] border border-gray-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
                      <div className="p-4 flex justify-between items-start">
                        <div className="text-right space-y-1">
                          <p className="font-bold text-sm text-primary">{tx.type}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{formatDate(tx.createdAt || tx.date)}</p>
                          <p className="text-[11px] text-gray-300 font-medium leading-relaxed">{tx.details}</p>
                          
                          {tx.balanceBefore !== undefined && (
                            <div className="mt-3 bg-black/30 p-2 rounded-xl border border-white/5 flex items-center gap-2 text-[10px] font-bold">
                              <Calculator className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-400">الرصيد:</span>
                              <span className="text-green-500">{(tx.balanceBefore).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <span className="text-gray-500">-</span>
                              <span className="text-red-500">{(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <span className="text-gray-500">=</span>
                              <span className="text-primary">{(tx.balanceAfter ?? (tx.balanceBefore - tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${status.color} text-white font-bold text-[10px]`}>
                            {status.icon} <span className="mr-1">{status.text}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="bg-black/20 p-3 px-4 flex justify-between items-center border-t border-gray-800/50">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                          <Hash className="h-3 w-3" /> {tx.id}
                        </div>
                        <p className="font-black text-lg">
                          {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] font-medium">{currency}</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
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
              <p className="text-gray-400 font-bold text-xl font-headline">لا توجد إشعارات حالياً</p>
              <p className="text-gray-500 text-sm max-w-[250px] mx-auto font-body">سيتم تنبيهك هنا بأي تحديثات على طلباتك أو رصيدك فوراً.</p>
            </div>
          </div>
        )}

      </main>
      <Navbar />
    </div>
  );
}
