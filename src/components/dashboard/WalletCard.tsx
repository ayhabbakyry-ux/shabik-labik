
"use client";

import { useState } from "react";
import { Send, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import genieLogo from '@/public/1000189207.png';

export function WalletCard() {
  const { userBalance, requestDeposit } = useUser();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDeposit = () => {
    if (!amount || isNaN(Number(amount))) return;
    requestDeposit(Number(amount));
    setOpen(false);
    setAmount("");
    toast({
      title: "تم إرسال الطلب",
      description: "سيقوم المسؤول بمراجعة إشعار الدفع الخاص بك قريباً.",
    });
  };

  return (
    <div className="bg-[#2d3a5a] p-6 rounded-2xl shadow-xl flex flex-col items-center text-center">
      {/* لوجو التطبيق */}
      <img 
        src={genieLogo.src} 
        alt="Logo" 
        className="w-16 h-16 mb-4 object-contain" 
      />
      
      {/* نصوص الرصيد */}
      <div className="text-white text-lg opacity-90 mb-1">Available Balance</div>
      <div className="text-white text-4xl font-bold mb-4">SYR {userBalance.toLocaleString()}</div>
      
      {/* الأزرار */}
      <div className="flex gap-3 w-full">
        <button className="flex-1 bg-[#475569] py-2 rounded-lg text-white font-medium hover:bg-[#58687e] transition-colors">
          Details
        </button>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex-1 bg-[#2563eb] py-2 rounded-lg text-white font-bold hover:bg-[#3b82f6] transition-colors">
              Deposit
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-headline">شحن المحفظة</DialogTitle>
              <DialogDescription className="text-right">
                قم بتحويل المبلغ إلى أحد حساباتنا وارفاق إشعار التحويل.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="bg-muted p-4 rounded-xl text-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium"><Landmark className="h-4 w-4 text-primary" /> شام كاش</span>
                  <span className="font-bold text-lg font-mono">57394</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium"><Send className="h-4 w-4 text-primary" /> سيريتل كاش</span>
                  <span className="font-bold text-lg font-mono">0964659123</span>
                </div>
              </div>
              <div className="grid gap-2 text-right">
                <Label htmlFor="amount" className="font-bold">المبلغ المطلوب شحنه (SYP)</Label>
                <input 
                  id="amount" 
                  type="number" 
                  placeholder="مثال: 50000" 
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-right text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDeposit} className="w-full h-12 text-lg font-bold">إرسال إشعار التحويل</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
