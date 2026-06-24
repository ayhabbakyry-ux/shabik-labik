
"use client";

import { useState } from "react";
import { Send, Landmark, Image as ImageIcon, AlertCircle } from "lucide-react";
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
  const { toast } = useToast();

  const handleDeposit = () => {
    setError("");
    if (!amount || isNaN(Number(amount))) {
      setError("عذراً، هذا الحقل مطلوب (المبلغ)");
      return;
    }
    if (!imageProof) {
      setError("عذراً، يجب رفع صورة الإشعار لإتمام العملية");
      return;
    }

    requestDeposit(Number(amount), imageProof);
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
      setImageProof("proof_image_uploaded_sim"); // محاكاة الرفع
    }
  };

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
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-headline">شحن المحفظة</DialogTitle>
              <DialogDescription className="text-right">
                حول المبلغ للحسابات أدناه وارفع صورة الإشعار.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="bg-muted p-4 rounded-xl text-sm space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-bold text-primary"><Landmark className="h-4 w-4" /> شام كاش (المعرف)</span>
                  <span className="font-mono text-xs bg-white p-2 rounded break-all select-all">5d093f196b8cd72873f06d5dbbfb2d43</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold text-primary"><Send className="h-4 w-4" /> سيريتل كاش</span>
                  <span className="font-bold text-lg font-mono">0964659123</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded text-xs">
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
              </div>

              <div className="grid gap-2 text-right">
                <Label className="font-bold">صورة إشعار التحويل (إجباري)</Label>
                <div className="relative group">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer opacity-0 absolute inset-0 z-10"
                  />
                  <div className={`h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${imageProof ? 'bg-green-50 border-green-500' : 'bg-muted/50 border-muted'}`}>
                    <ImageIcon className={`h-6 w-6 ${imageProof ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className="text-[10px]">{imageProof ? 'تم اختيار الصورة' : 'اضغط لرفع الإشعار'}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDeposit} className="w-full h-12 text-lg font-bold">تأكيد وإرسال الإشعار</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
