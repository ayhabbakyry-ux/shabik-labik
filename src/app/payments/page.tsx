
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Menu, 
  ChevronDown, 
  CheckCircle2, 
  XCircle,
  Inbox,
  Wallet,
  Home,
  ShoppingBag,
  Bell
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

interface PaymentItem {
  id: number;
  method: string;
  amount: string;
  status: 'accepted' | 'rejected';
  statusText: string;
  transactionId: string;
  total: string;
  value: string;
  date: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(52006);

  const paymentsData: PaymentItem[] = [
    {
      id: 52006,
      method: 'شام كاش',
      amount: '680.00 SYP',
      status: 'accepted',
      statusText: 'مقبول',
      transactionId: '52006',
      total: '680 SYP',
      value: 'SYP 680.00',
      date: '2026-06-20 23:09:17',
    },
    {
      id: 52007,
      method: 'سيريتل كاش',
      amount: '1,500.00 SYP',
      status: 'rejected',
      statusText: 'مرفوض',
      transactionId: '52007',
      total: '1500 SYP',
      value: 'SYP 1,500.00',
      date: '2026-06-21 11:45:12',
    }
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
        <h1 className="text-xl font-bold font-headline">دفعاتي</h1>
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
        
        {paymentsData.map((item) => {
          const isOpen = expandedId === item.id;
          const isAccepted = item.status === 'accepted';
          const statusBgColor = isAccepted ? 'bg-[#4caf50]' : 'bg-[#e53935]';

          return (
            <div key={item.id} className="flex flex-col">
              
              <button
                onClick={() => toggleExpand(item.id)}
                className={`flex items-center justify-between p-4 ${statusBgColor} rounded-xl text-white font-bold shadow-md transition-all active:scale-[0.98]`}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                  <span className="text-lg">{item.method} - {item.amount}</span>
                </div>

                <div className="text-sm bg-black/20 px-4 py-1 rounded-lg">
                  {item.statusText}
                </div>
              </button>

              {isOpen && (
                <div className="bg-[#1c232d] border border-gray-800 rounded-b-xl p-5 -mt-2 pt-6 space-y-4 shadow-inner animate-in slide-in-from-top-2">
                  
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400 font-medium">رقم العملية :</span>
                    <span className="font-mono text-lg">{item.transactionId}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400 font-medium">الجمالي :</span>
                    <span className="text-lg">{item.total}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400 font-medium">القيمة :</span>
                    <span className="font-mono text-lg">{item.value}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400 font-medium">التاريخ :</span>
                    <span className="font-mono text-md text-gray-300">{item.date}</span>
                  </div>

                  {/* Receipt Preview */}
                  <div className="bg-[#11151d] p-3 rounded-xl border border-gray-800 flex justify-center items-center mt-4">
                    <div className="bg-white text-black p-4 rounded shadow-md w-full max-w-xs text-center text-[10px] font-sans space-y-2">
                      <div className="font-bold border-b pb-1 flex justify-between text-gray-700">
                        <span>{item.method}</span>
                        <span className={isAccepted ? "text-green-600" : "text-red-600"}>
                          {isAccepted ? "✓ ناجحة" : "✕ مرفوضة"}
                        </span>
                      </div>
                      <p className="text-right text-gray-600">اسم المرسل: أيهم محمد باكير</p>
                      <p className="text-right text-gray-600">المبلغ: {item.total}</p>
                      <p className="text-gray-400 font-mono pt-1">{item.date}</p>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}

      </main>

      <Navbar />
    </div>
  );
}
