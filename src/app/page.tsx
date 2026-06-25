
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, Lock, User, ArrowRight, HelpCircle, Menu } from "lucide-react";
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
  const { login, register, isLoggedIn, requestPasswordReset, userBalance, currency, userName } = useUser();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast({ variant: "destructive", title: "خطأ", description: "عذراً، جميع الحقول مطلوبة" });
      return;
    }

    if (isLogin) {
      const result = login(phone, password);
      if (result.success) {
        toast({ title: "مرحباً بك", description: result.message });
        router.push("/dashboard");
      } else {
        toast({ variant: "destructive", title: "فشل الدخول", description: result.message });
      }
    } else {
      if (!name) {
        toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال اسمك لإنشاء الحساب" });
        return;
      }
      const result = register(phone, name, password);
      if (result.success) {
        toast({ title: "تم التسجيل", description: result.message });
        setIsLogin(true);
      } else {
        toast({ variant: "destructive", title: "فشل التسجيل", description: result.message });
      }
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-md shadow-2xl border-none">
          <CardHeader>
            <CardTitle className="text-xl text-right flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> استعادة الحساب
            </CardTitle>
            <CardDescription className="text-right">أدخل رقم هاتفك المسجل لنرسل طلباً للإدارة.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); requestPasswordReset(phone); setIsForgotPassword(false); toast({ title: "تم الإرسال" }); }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right block">رقم الهاتف</Label>
                <Input placeholder="09xxxxxxxx" className="pr-10 h-11 text-right" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button type="submit" className="w-full h-11">إرسال طلب استعادة</Button>
              <Button variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)}>العودة</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-8" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="w-full max-w-md flex justify-between items-center mb-10">
        <div className="bg-primary text-white px-4 py-2 rounded-2xl font-black text-sm shadow-md">
          {isLoggedIn ? `${userBalance.toLocaleString()} ${currency}` : "مرحباً بك"}
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

      {!isLoggedIn ? (
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
                  <div className="space-y-2">
                    <Label className="text-right block font-bold text-xs pr-1">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="أدخل اسمك" className="pr-10 h-12 text-right rounded-xl border-muted bg-muted/20" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
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
                <Button type="submit" className="w-full h-14 text-base font-bold mt-2 shadow-xl shadow-primary/20 rounded-2xl">
                  {isLogin ? "دخول للمنصة" : "إنشاء حساب"} <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                </Button>
              </form>
            </CardContent>
          </Tabs>
        </Card>
      ) : (
        <div className="w-full max-w-md space-y-4">
           <Card className="border-none shadow-2xl bg-gradient-to-br from-primary via-blue-800 to-indigo-950 text-white p-8 rounded-[40px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="flex justify-between items-center mb-6">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10"><ShieldCheck className="h-7 w-7" /></div>
                <span className="text-[10px] font-black tracking-widest bg-yellow-500 text-black px-3 py-1 rounded-full uppercase">VIP Member</span>
              </div>
              <p className="text-sm opacity-80 font-medium">أهلاً بعودتك، {userName}</p>
              <h2 className="text-4xl font-black mt-2 tracking-tight">{userBalance.toLocaleString()} <span className="text-xs font-medium opacity-70">{currency}</span></h2>
              <Button onClick={() => router.push('/dashboard')} className="w-full mt-8 bg-white text-primary hover:bg-white/90 font-black h-14 rounded-2xl shadow-lg">
                فتح لوحة الخدمات الرقمية
              </Button>
           </Card>
        </div>
      )}
      
      <div className="mt-auto py-8 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        © 2024 Shabik Labik Digital. All Rights Reserved.
      </div>
    </div>
  );
}
