
"use client";

import { useState } from "react";
import { useUser } from "@/lib/store";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, ArrowRight, Menu, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ChangePasswordPage() {
  const { changePassword, isLoggedIn } = useUser();
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  if (!isLoggedIn) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPass !== confirmPass) {
      toast({ variant: "destructive", title: "خطأ", description: "كلمة المرور الجديدة غير متطابقة." });
      return;
    }

    if (newPass.length < 6) {
      toast({ variant: "destructive", title: "خطأ", description: "كلمة المرور يجب أن تكون 6 خانات على الأقل." });
      return;
    }

    setLoading(true);
    const result = await changePassword(currentPass, newPass);
    setLoading(false);

    if (result.success) {
      toast({ title: "تم التحديث", description: result.message });
      router.push("/dashboard");
    } else {
      toast({ variant: "destructive", title: "فشل التعديل", description: result.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-24" dir="rtl">
      <DesktopHeader />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40 shadow-sm">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-primary/10 rounded-xl transition active:scale-95 text-primary"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
        <span className="font-bold text-sm">أمان الحساب</span>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-muted rounded-xl text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <main className="max-w-md mx-auto p-4 pt-10 space-y-6">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4">
           <div className="bg-primary/10 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto shadow-inner transform rotate-6">
              <KeyRound className="h-10 w-10 text-primary" />
           </div>
           <h1 className="text-2xl font-black font-headline">تغيير كلمة المرور</h1>
           <p className="text-muted-foreground text-sm">حافظ على أمان محفظتك بتحديث كلمة السر دورياً</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b p-6">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> تأكيد الهوية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-right block font-bold text-xs pr-1">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••" 
                    className="pr-10 pl-12 h-12 text-right rounded-xl border-muted bg-muted/20" 
                    value={currentPass} 
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute left-3 top-3 h-6 w-6 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-right block font-bold text-xs pr-1">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-3 h-4 w-4 text-primary opacity-50" />
                  <Input 
                    type={showNew ? "text" : "password"}
                    placeholder="أدخل كلمة مرور قوية" 
                    className="pr-10 pl-12 h-12 text-right rounded-xl border-muted bg-white" 
                    value={newPass} 
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)}
                    className="absolute left-3 top-3 h-6 w-6 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-right block font-bold text-xs pr-1">تأكيد كلمة المرور الجديدة</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary opacity-50" />
                  <Input 
                    type={showConfirm ? "text" : "password"}
                    placeholder="أعد كتابة الجديدة" 
                    className="pr-10 pl-12 h-12 text-right rounded-xl border-muted bg-white" 
                    value={confirmPass} 
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-3 top-3 h-6 w-6 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
           <ShieldCheck className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
           <p className="text-[11px] text-orange-700 leading-relaxed font-medium">
             ملاحظة أكاديمية: في حال فقدان كلمة المرور بالكامل، يرجى طلب استعادة الحساب من صفحة تسجيل الدخول لتهيئة حسابك عن طريق المدير.
           </p>
        </div>
      </main>

      <Navbar />
    </div>
  );
}
