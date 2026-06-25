
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Menu, 
  ChevronDown, 
  Clock,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { useUser } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

export default function PaymentsPage() {
  const router = useRouter();
  const { transactions, currency, isLoggedIn } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Completed': return { color: 'bg-green-600', text: 'مقبول', icon: <CheckCircle2 className="h-4 w-4" /> };
      case 'Rejected': return { color: 'bg-red-600', text: 'مرفوض', icon: <XCircle className="h-4 w-4" /> };
      default: return { color: 'bg-orange-500', text: 'قيد الانتظار', icon: <Clock className="h-4 w-4" /> };
    }
  };

  return (
    <div className="min-h-screen bg-[#11151d] text-white flex flex-col pb-20" dir="rtl">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#161a23] border-b border-gray-800 sticky top-0 z-40">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-800 rounded-full transition active:scale-90 flex items-center gap-1"
        >
          <ArrowRight className="h-6 w-6" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <h1 className="text-xl font-bold font-headline">دفعاتي المالية</h1>
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
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Clock className="h-12 w-12 opacity-20 mb-4" />
            <p className="text-sm font-bold">لا يوجد أي عمليات مالية حالياً.</p>
          </div>
        ) : (
          transactions.map((item) => {
            const isOpen = expandedId === item.id;
            const config = getStatusConfig(item.status);

            return (
              <div key={item.id} className="flex flex-col">
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={`flex items-center justify-between p-4 ${config.color} rounded-xl text-white font-bold shadow-md transition-all active:scale-[0.98]`}
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                    <span className="text-lg">{item.type} - {item.amount.toLocaleString()} {currency}</span>
                  </div>

                  <div className="text-xs bg-black/20 px-3 py-1 rounded-full flex items-center gap-1">
                    {config.icon} {config.text}
                  </div>
                </button>

                {isOpen && (
                  <div className="bg-[#1c232d] border border-gray-800 rounded-b-xl p-5 -mt-2 pt-6 space-y-4 shadow-inner animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="text-gray-400 font-medium">رقم العملية :</span>
                      <span className="font-mono text-lg flex items-center gap-1 text-primary">
                        <Hash className="h-4 w-4" /> {item.id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="text-gray-400 font-medium">المبلغ :</span>
                      <span className="text-lg font-bold">{item.amount.toLocaleString()} {currency}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="text-gray-400 font-medium">التاريخ :</span>
                      <span className="font-mono text-sm text-gray-300">{item.date}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="text-gray-400 font-medium">الحالة :</span>
                      <Badge className={config.color}>{config.text}</Badge>
                    </div>

                    {/* Simple Receipt Preview */}
                    <div className="bg-[#11151d] p-4 rounded-xl border border-gray-800 flex justify-center items-center mt-2">
                      <div className="bg-white text-black p-4 rounded shadow-md w-full max-w-xs text-center text-[10px] space-y-2">
                        <div className="font-bold border-b pb-1 flex justify-between">
                          <span>إشعار إيداع</span>
                          <span className={item.status === 'Completed' ? "text-green-600" : item.status === 'Rejected' ? "text-red-600" : "text-orange-500"}>
                            {config.text}
                          </span>
                        </div>
                        <p className="text-right">المبلغ: {item.amount.toLocaleString()} ل.س.ج</p>
                        <p className="text-center font-mono text-[8px] text-gray-400">{item.id}</p>
                        <p className="text-center font-mono text-[8px] text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      <Navbar />
    </div>
  );
}
