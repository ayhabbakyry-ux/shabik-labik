
"use client";

import { useState } from "react";
import { Send, Landmark, Image as ImageIcon, AlertCircle, Copy, CheckCircle2, Smartphone } from "lucide-react";
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
      setError("عذراً، هذا الحقل مطلوب (المبلغ)");
      return;
    }

    if (numAmount < 120) {
      setError("عذراً، أقل مبلغ للإيداع هو 120 ل.س.ج");
      return;
    }

    if (!imageProof) {
      setError("عذراً، يجب رفع صورة الإشعار لإتمام العملية");
      return;
    }

    requestDeposit(numAmount, imageProof);
    setOpen(false);
    setAmount("");
    setImageProof(null);
    toast({
      title: "تم إرسال الطلب بنجاح",
      description: "سيقوم المسؤول بمراجعة إشعار الدفع وتأكيد الرصيد قريباً.",
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // محاكاة رفع صورة ناجحة
      setImageProof("proof_image_uploaded_sim"); 
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      description: "تم نسخ الرقم بنجاح",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const accounts = [
    { id: 'syriatel', label: 'سيريتل كاش', value: '0939549573', icon: <Send className="h-4 w-4" /> },
    { id: 'mtn', label: 'إم تي إن كاش', value: '0943899403', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'sham', label: 'شام كاش (المعرف)', value: '5d093f196b8cd72873f06d5dbbfb2d43', icon: <Landmark className="h-4 w-4" />, isMono: true },
  ];

  return (
    <div className="bg-[#2d3a5a] p-6 rounded-2xl shadow-xl flex flex-col items-center text-center">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Icon-pictures.svg/1200px-Icon-pictures.svg.png" 
        alt="Logo" 
        className="w-16 h-16 mb-4 object-contain" 
      />
      
      <div className="text-white text-lg opacity-90 mb-1">الرصيد المتاح</div>
      <div className="text-white text-4xl font-bold mb-4">{currency} {userBalance.toLocaleString()}</div>
      
      <div className="flex gap-3 w-full">
        <button className="flex-1 bg-[#475569] py-2 rounded-lg text-white font-medium hover:bg-[#58687e] transition-colors">
          التفاصيل
        </button>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex-1 bg-[#2563eb] py-2 rounded-lg text-white font-bold hover:bg-[#3b82f6] transition-colors">
              إيداع رصيد
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-hidden" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-headline">شحن المحفظة</DialogTitle>
              <DialogDescription className="text-right">
                حول المبلغ للحسابات أدناه وارفع صورة الإشعار.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="bg-muted p-4 rounded-xl text-sm space-y-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold text-primary">{acc.icon} {acc.label}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm group">
                      <span className={`flex-1 text-right font-bold truncate ${acc.isMono ? 'font-mono text-[10px]' : 'text-lg'}`}>
                        {acc.value}
                      </span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={() => copyToClipboard(acc.value, acc.id)}
                      >
                        {copiedId === acc.id ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-xs font-bold">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="grid gap-2 text-right">
                <Label htmlFor="amount" className="font-bold">المبلغ المطلوب ( {currency} )</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="مثال: 50000" 
                  className="text-right h-12"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">أقل مبلغ للإيداع هو 120 ل.س.ج</p>
              </div>

              <div className="grid gap-2 text-right">
                <Label className="font-bold">صورة إشعار التحويل (إجباري)</Label>
                <div className="relative group">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer opacity-0 absolute inset-0 z-10"
                    required
                  />
                  <div className={`h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${imageProof ? 'bg-green-50 border-green-500' : 'bg-muted/50 border-muted'}`}>
                    <ImageIcon className={`h-6 w-6 ${imageProof ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className="text-[10px]">{imageProof ? 'تم اختيار الصورة' : 'اضغط لرفع الإشعار'}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDeposit} className="w-full h-12 text-lg font-bold shadow-lg">إرسال طلب الإيداع</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
