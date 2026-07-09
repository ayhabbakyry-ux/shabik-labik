"use client";

import { useState } from "react";
import { Send, Landmark, Image as ImageIcon, AlertCircle, Copy, CheckCircle2, Smartphone, Wallet, ArrowUpCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function WalletCard() {
  const { userBalance, requestDeposit, currency } = useUser();
  const [amount, setAmount] = useState("");
  const [imageProof, setImageProof] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار ملف صورة صالح." });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageProof(reader.result as string);
      setUploading(false);
      toast({ title: "نجاح العملية", description: "تم تحميل صورة الإشعار بنجاح وهي جاهزة للإرسال." });
    };
    reader.readAsDataURL(file);
  };

  const handleDeposit = () => {
    setError("");
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount)) {
      setError("يرجى إدخال المبلغ المطلوب.");
      return;
    }
    if (numAmount < 100) {
      setError("الحد الأدنى للإيداع هو 100 ليرة.");
      return;
    }
    if (!imageProof) {
      setError("يجب إرفاق صورة الإشعار الرسمي لإتمام الطلب.");
      return;
    }
    requestDeposit(numAmount, imageProof);
    setOpen(false);
    setAmount("");
    setImageProof(null);
    toast({ title: "تم إرسال الطلب", description: "جاري مراجعة العملية من قبل الإدارة لتفعيل الرصيد في محفظتكم." });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ description: "تم نسخ البيانات إلى الحافظة." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const accounts = [
    { id: 'syriatel', label: 'سيريتل كاش', value: '0939549573', icon: <Send className="h-4 w-4" /> },
    { id: 'mtn', label: 'إم تي إن كاش', value: '0943899403', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'sham', label: 'شام كاش', value: '5d093f196b8cd72873f06d5dbbfb2d43', icon: <Landmark className="h-4 w-4" />, isMono: true },
  ];

  return (
    <div className="bg-gradient-to-br from-[#1c232d] to-[#11151d] p-6 md:p-8 rounded-[32px] shadow-2xl flex flex-col items-center text-center relative overflow-hidden border border-white/5">
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mt-16 blur-[60px]"></div>
      
      <div className="bg-primary/20 p-4 rounded-2xl mb-4 backdrop-blur-md border border-white/5">
        <Wallet className="h-8 w-8 text-primary" />
      </div>
      
      <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">الرصيد المتاح حالياً</div>
      <div className="text-white text-4xl md:text-5xl font-black mb-8 tracking-tighter">
        {(userBalance || 0).toLocaleString()} <span className="text-xs font-medium text-gray-500">{currency}</span>
      </div>
      
      <div className="flex gap-3 w-full">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex-1 bg-primary hover:bg-primary/90 py-5 rounded-2xl text-white font-bold text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <ArrowUpCircle className="h-5 w-5" /> إيداع رصيد جديد
            </button>
          </DialogTrigger>
          <DialogContent className="w-[95%] max-w-[425px] max-h-[85vh] overflow-hidden bg-[#11151d] border-gray-800 text-white flex flex-col p-0 rounded-[32px]" dir="rtl">
            <div className="p-6 pb-2 text-right">
              <DialogHeader>
                <DialogTitle className="text-right font-headline text-xl">شحن رصيد المحفظة</DialogTitle>
                <DialogDescription className="text-right text-gray-400 text-xs">يرجى تحويل المبلغ المطلوب ثم إرفاق صورة الإشعار للمراجعة والتدقيق.</DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1 px-6">
              <div className="grid gap-4 py-2">
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
                  <Label className="font-bold text-xs text-gray-400">المبلغ المطلوب إيداعه</Label>
                  <Input type="number" placeholder="مثال: 50000" className="bg-[#1c232d] border-gray-800 h-12 text-right text-white rounded-xl focus:ring-primary" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  {error && <p className="text-xs text-destructive mt-1 font-bold">{error}</p>}
                </div>

                <div className="grid gap-2 text-right pb-4">
                  <Label className="font-bold text-xs text-gray-400">إرفاق صورة الإشعار الرسمي (إجباري)</Label>
                  <div className="relative">
                    <Input type="file" accept="image/*" className="hidden" id="proof-upload" onChange={handleFileChange} />
                    <label htmlFor="proof-upload" className="flex items-center justify-center gap-2 w-full h-14 bg-[#1c232d] border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-primary transition-colors text-sm font-bold text-gray-300">
                      {uploading ? "جاري التحميل..." : imageProof ? "تم تحديد الصورة بنجاح ✅" : <><Upload className="h-4 w-4" /> اختر صورة الإشعار</>}
                    </label>
                  </div>
                  {imageProof && (
                    <div className="mt-2 rounded-2xl overflow-hidden border border-gray-800 h-24 relative group">
                      <img src={imageProof} alt="Preview" className="w-full h-full object-contain bg-black" />
                      <button onClick={() => setImageProof(null)} className="absolute top-2 left-2 bg-red-500 p-1 rounded-full shadow-lg">
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 shrink-0 bg-[#161a23] border-t border-gray-800">
              <Button onClick={handleDeposit} disabled={uploading} className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">تأكيد وإرسال طلب الإيداع</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}