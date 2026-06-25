
"use client";

import { useState } from "react";
import { Send, Landmark, Image as ImageIcon, AlertCircle, Copy, CheckCircle2, Smartphone, Wallet, ArrowUpCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";

export function WalletCard() {
  const { userBalance, requestDeposit, currency } = useUser();
  const [amount, setAmount] = useState("");
  const [imageProof, setImageProof] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeposit = () => {
    setError("");
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount)) {
      setError("يرجى إدخال المبلغ");
      return;
    }
    if (numAmount < 100) {
      setError("أقل مبلغ للشحن هو 100 ليرة");
      return;
    }
    if (!imageProof) {
      setError("يجب رفع صورة الإشعار");
      return;
    }
    requestDeposit(numAmount, imageProof);
    setOpen(false);
    setAmount("");
    setImageProof(null);
    toast({ title: "تم إرسال الطلب", description: "سيتم تفعيل الرصيد بعد مراجعة الإدارة." });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ description: "تم النسخ بنجاح" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const accounts = [
    { id: 'syriatel', label: 'سيريتل كاش', value: '0939549573', icon: <Send className="h-4 w-4" /> },
    { id: 'mtn', label: 'إم تي إن كاش', value: '0943899403', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'sham', label: 'شام كاش', value: '5d093f196b8cd72873f06d5dbbfb2d43', icon: <Landmark className="h-4 w-4" />, isMono: true },
  ];

  return (
    <div className="bg-gradient-to-br from-[#1c232d] to-[#11151d] p-8 rounded-[32px] shadow-2xl flex flex-col items-center text-center relative overflow-hidden border border-white/5">
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mt-16 blur-[60px]"></div>
      
      <div className="bg-primary/20 p-4 rounded-2xl mb-4 backdrop-blur-md border border-white/5">
        <Wallet className="h-8 w-8 text-primary" />
      </div>
      
      <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">الرصيد المتاح حالياً</div>
      <div className="text-white text-5xl font-black mb-8 tracking-tighter">
        {(userBalance || 0).toLocaleString()} <span className="text-xs font-medium text-gray-500">{currency}</span>
      </div>
      
      <div className="flex gap-3 w-full">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex-1 bg-primary hover:bg-primary/90 py-5 rounded-2xl text-white font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <ArrowUpCircle className="h-5 w-5" /> إيداع رصيد جديد
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-hidden bg-[#11151d] border-gray-800 text-white" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-headline text-xl">شحن المحفظة</DialogTitle>
              <DialogDescription className="text-right text-gray-400">حول المبلغ وارفع صورة الإشعار للمراجعة.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="bg-[#1c232d] p-4 rounded-2xl border border-gray-800 space-y-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className="space-y-2">
                    <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400">{acc.icon} {acc.label}</span>
                    <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className={`flex-1 text-right font-bold truncate ${acc.isMono ? 'font-mono text-[10px]' : 'text-md'}`}>{acc.value}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => copyToClipboard(acc.value, acc.id)}>
                        {copiedId === acc.id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 text-right">
                <Label className="font-bold text-xs text-gray-400">المبلغ المطلوب شحنه ( {currency} )</Label>
                <Input type="number" placeholder="مثال: 50000" className="bg-[#1c232d] border-gray-800 h-12 text-right text-white rounded-xl focus:ring-primary" value={amount} onChange={(e) => setAmount(e.target.value)} />
                {error && <p className="text-xs text-destructive mt-1 font-bold">{error}</p>}
              </div>
              <div className="grid gap-2 text-right">
                <Label className="font-bold text-xs text-gray-400">صورة إشعار التحويل (إجباري)</Label>
                <Input type="file" accept="image/*" className="bg-[#1c232d] border-gray-800 h-12 text-right text-white cursor-pointer rounded-xl" onChange={(e) => setImageProof("uploaded")} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDeposit} className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20">تأكيد وإرسال الطلب</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
