"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, Lock, User, ArrowRight, HelpCircle, Menu, Gift, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, requestReset, isLoggedIn, userBalance, currency } = useUser();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast({ variant: "destructive", title: "خطأ", description: "عذراً، جميع الحقول مطلوبة خيو" });
      return;
    }

    setIsLoading(true);
    if (isLogin) {
      const result = await login(phone, password);
      if (result.success) {
        toast({ title: "مرحباً بك", description: result.message });
        router.push("/dashboard");
      } else {
        toast({ variant: "destructive", title: "فشل الدخول", description: result.message });
      }
    } else {
      if (!name) {
        toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال اسمك لإنشاء الحساب" });
        setIsLoading(false);
        return;
      }
      const result = await register(phone, name, password, referralCode);
      if (result.success) {
        toast({ title: "تم التسجيل", description: result.message });
        setIsLogin(true);
      } else {
        toast({ variant: "destructive", title: "فشل التسجيل", description: result.message });
      }
    }
    setIsLoading(false);
  };

  const handleResetRequest = async () => {
    if (!resetPhone) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال رقم الهاتف أولاً." });
      return;
    }
    setIsLoading(true);
    const res = await requestReset(resetPhone);
    setIsLoading(false);
    if (res.success) {
      toast({ title: "تم إرسال الطلب", description: res.message });
    } else {
      toast({ variant: "destructive", title: "فشل الطلب", description: res.message });
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[32px] overflow-hidden">
          <CardHeader className="bg-primary text-white p-8">
            <CardTitle className="text-xl text-right flex items-center gap-2">
              <HelpCircle className="h-6 w-6" /> استعادة الحساب
            </CardTitle>
            <CardDescription className="text-white/80 text-right mt-2">
              أدخل رقم هاتفك ليرسل التطبيق طلباً للمدير ببياناتك ورصيدك لتهيئة حسابك.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="space-y-2">
                <Label className="text-right block font-bold text-xs pr-1">رقم الهاتف المسجل</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="09xxxxxxxx" 
                    className="pr-10 h-12 text-right rounded-xl border-muted bg-muted/20" 
                    value={resetPhone} 
                    onChange={(e) => setResetPhone(e.target.value)} 
                  />
                </div>
             </div>
             
             <div className="space-y-3">
               <Button 
                 onClick={handleResetRequest} 
                 disabled={isLoading}
                 className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black text-md shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
               >
                 <Send className="h-5 w-5 rotate-180" /> {isLoading ? "جاري الإرسال..." : "إرسال طلب استعادة للمدير"}
               </Button>
               
               <a href="https://wa.me/963939549573" target="_blank" className="block w-full">
                 <Button variant="outline" className="w-full h-14 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-2xl font-black">تواصل مباشر عبر واتساب</Button>
               </a>
               
               <Button variant="ghost" className="w-full mt-2 font-bold" onClick={() => setIsForgotPassword(false)}>العودة لتسجيل الدخول</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-8" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="w-full max-w-md flex justify-between items-center mb-10">
        <div className="bg-primary text-white px-4 py-2 rounded-2xl font-black text-sm shadow-md min-w-[100px] text-center">
          {(userBalance || 0).toLocaleString()} {currency}
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-primary border"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="mb-8 text-center">
        <div className="bg-primary p-5 rounded-[32px] inline-block shadow-2xl mb-4 transform rotate-3">
          <ShieldCheck className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold font-headline text-primary">شبك لبيك الرقمي</h1>
        <p className="text-muted-foreground text-sm font-medium">بوابتك الآمنة والموثوقة للشحن التلقائي</p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none bg-white/90 backdrop-blur-md rounded-[32px] overflow-hidden">
        <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setIsLogin(v === "login")}>
          <CardHeader className="pb-4">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-2xl">
              <TabsTrigger value="login" className="font-bold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register" className="font-bold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">حساب جديد</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label className="text-right block font-bold text-xs pr-1">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="أدخل اسمك" className="pr-10 h-12 text-right rounded-xl border-muted bg-muted/20" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block font-bold text-xs pr-1">كود الدعوة (اختياري)</Label>
                    <div className="relative">
                      <Gift className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="أدخل كود صديقك لتربحا 25 ليرة" 
                        className="pr-10 h-12 text-right rounded-xl border-muted bg-muted/20 uppercase font-mono" 
                        value={referralCode} 
                        onChange={(e) => setReferralCode(e.target.value)} 
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label className="text-right block font-bold text-xs pr-1">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="09xxxxxxxx" className="pr-10 h-12 text-right rounded-xl border-muted bg-muted/20" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-right block font-bold text-xs pr-1">كلمة السر</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className="pr-10 h-12 text-right rounded-xl border-muted bg-muted/20" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              {isLogin && (
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] text-primary font-bold hover:underline block w-full text-right pr-1">نسيت كلمة المرور؟</button>
              )}
              <Button type="submit" disabled={isLoading} className="w-full h-14 text-base font-bold mt-2 shadow-xl shadow-primary/20 rounded-2xl">
                {isLoading ? "جاري المعالجة..." : isLogin ? "دخول للمنصة" : "إنشاء حساب"} <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              </Button>
            </form>
          </CardContent>
        </Tabs>
      </Card>
      
      <div className="mt-auto py-8 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        © 2024 Shabik Labik Digital. All Rights Reserved.
      </div>
    </div>
  );
}
