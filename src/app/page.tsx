
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

/**
 * @fileOverview الصفحة الرئيسية المطورة (Home/Auth Page)
 * تم تصفير الرصيد، إضافة القائمة الجانبية، وحذف الأرقام الوهمية (1,000,000).
 */

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

  useEffect(() => {
    // إذا كان مسجلاً، يمكنه البقاء هنا أو الانتقال للوحة التحكم، ولكننا سنبقي الواجهة مرنة
  }, [isLoggedIn]);

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
        <Card className="w-full max-w-md shadow-2xl border-none animate-in fade-in zoom-in duration-300">
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-8 md:pt-16" dir="rtl">
      
      {/* Sidebar & Header Button */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="w-full max-w-md flex justify-between items-center mb-10">
        <div className="bg-primary/10 p-2 rounded-xl text-primary font-black text-sm">
          {isLoggedIn ? `${userBalance.toLocaleString()} ${currency}` : "مرحباً بك"}
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="mb-8 text-center animate-in slide-in-from-top duration-500">
        <div className="bg-primary p-4 rounded-3xl inline-block shadow-xl mb-4">
          <ShieldCheck className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold font-headline text-primary">شبك لبيك الرقمي</h1>
        <p className="text-muted-foreground text-sm font-medium">بوابتك الآمنة للخدمات الرقمية</p>
      </div>

      {!isLoggedIn ? (
        <Card className="w-full max-w-md shadow-2xl border-none animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white/80 backdrop-blur-sm">
          <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setIsLogin(v === "login")}>
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="font-bold">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register" className="font-bold">حساب جديد</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label className="text-right block font-bold text-xs">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="أدخل اسمك" className="pr-10 h-11 text-right" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-right block font-bold text-xs">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="09xxxxxxxx" className="pr-10 h-11 text-right" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-right block font-bold text-xs">كلمة السر</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" className="pr-10 h-11 text-right" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                {isLogin && (
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] text-primary font-bold hover:underline block w-full text-right">نسيت كلمة المرور؟</button>
                )}
                <Button type="submit" className="w-full h-12 text-base font-bold mt-2 shadow-lg shadow-primary/20">
                  {isLogin ? "دخول للمنصة" : "إنشاء حساب"} <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                </Button>
              </form>
            </CardContent>
          </Tabs>
        </Card>
      ) : (
        <div className="w-full max-w-md space-y-4 animate-in fade-in duration-500">
           <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-blue-900 text-white p-6 rounded-[32px]">
              <div className="flex justify-between items-center mb-4">
                <div className="bg-white/20 p-2 rounded-xl"><ShieldCheck className="h-6 w-6" /></div>
                <span className="text-xs font-bold opacity-80">محفظتك الرقمية</span>
              </div>
              <p className="text-sm opacity-90">أهلاً بك، {userName}</p>
              <h2 className="text-3xl font-black mt-1">{userBalance.toLocaleString()} <span className="text-xs font-medium">{currency}</span></h2>
              <Button onClick={() => router.push('/dashboard')} className="w-full mt-6 bg-white text-primary hover:bg-white/90 font-bold h-12 rounded-2xl">
                فتح لوحة الخدمات
              </Button>
           </Card>
        </div>
      )}
      
      <div className="mt-auto py-8 text-center text-[10px] text-muted-foreground font-medium">
        © 2024 شبك لبيك الرقمي. جميع الحقوق محفوظة.
      </div>
    </div>
  );
}
