
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useUser } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useUser();
  const router = useRouter();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!phone || !password || (name === "" && !isLogin)) {
      setError("عذراً، جميع الحقول مطلوبة");
      return;
    }

    if (phone.length < 10) {
      setError("عذراً، رقم الهاتف يجب أن يكون 10 أرقام على الأقل");
      return;
    }

    login(phone, name || "مستخدم");
    router.push("/dashboard");
  };

  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="mb-8 text-center">
        <div className="bg-primary p-4 rounded-3xl inline-block shadow-xl mb-4">
          <ShieldCheck className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold font-headline text-primary">شبك لبيك الرقمي</h1>
        <p className="text-muted-foreground font-medium">بوابتك للخدمات الرقمية المتكاملة</p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none">
        <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setIsLogin(v === "login")}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
            </TabsList>
            <CardTitle className="text-xl text-right">{isLogin ? "مرحباً بك مجدداً" : "حساب جديد"}</CardTitle>
            <CardDescription className="text-right">أدخل بياناتك للوصول إلى محفظتك الرقمية.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {error && <p className="text-destructive text-sm font-bold text-right">{error}</p>}
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right block">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="أدخل اسمك" 
                      className="pr-10 h-11 text-right" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right block">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    placeholder="09xxxxxxxx" 
                    className="pr-10 h-11 text-right" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">كلمة السر</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pr-10 h-11 text-right"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold">
                {isLogin ? "دخول للمنصة" : "تسجيل الحساب"} <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-center text-muted-foreground">
              بتسجيل دخولك، أنت توافق على شروط الخدمة الرقمية الخاصة بنا.
            </p>
          </CardFooter>
        </Tabs>
      </Card>
      
      <div className="mt-8 text-center text-xs text-muted-foreground">
        © 2024 شبك لبيك الرقمي. آمن ومحمي.
      </div>
    </div>
  );
}
