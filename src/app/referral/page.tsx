
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { useUser } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Users, Gift, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReferralPage() {
  const { userPhone, currency, isLoggedIn } = useUser();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const referralLink = `https://shabik-labik.com/register?ref=${userPhone}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "تم النسخ بنجاح",
      description: "رابط الإحالة الخاص بك جاهز للمشاركة الآن.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <DesktopHeader />
      
      <main className="max-w-md mx-auto p-4 space-y-6 pt-6">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-headline">ادعُ أصدقاءك واربح!</h1>
          <p className="text-muted-foreground text-sm">
            احصل على <span className="text-primary font-bold">100 {currency}</span> مجاناً عن كل مستخدم جديد يسجل عن طريقك.
          </p>
        </div>

        <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-blue-900 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">رابط الإحالة الخاص بك</CardTitle>
            <CardDescription className="text-blue-100/70">شارك هذا الرابط مع أصدقائك لبدء الربح.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex items-center gap-3 border border-white/20">
              <p className="flex-1 text-xs font-mono truncate text-right rtl">{referralLink}</p>
              <Button size="icon" variant="ghost" className="hover:bg-white/20 text-white" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button className="w-full bg-white text-primary hover:bg-gray-100 font-bold h-12 rounded-xl">
              <Share2 className="ml-2 h-4 w-4" /> مشاركة الرابط الآن
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center p-4 border-none shadow-sm bg-white">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-black">0</p>
            <p className="text-[10px] text-muted-foreground font-bold">إجمالي الدعوات</p>
          </Card>
          <Card className="text-center p-4 border-none shadow-sm bg-white">
            <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-green-500">0</p>
            <p className="text-[10px] text-muted-foreground font-bold">إجمالي الأرباح</p>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-right pr-2">كيف تعمل المكافآت؟</h3>
          <div className="space-y-3">
            {[
              { step: 1, text: "انسخ رابط الدعوة الخاص بك." },
              { step: 2, text: "أرسله لأصدقائك عبر الواتساب أو تيليجرام." },
              { step: 3, text: "ستحصل على 100 ل.س.ج فور تأكيد حسابهم." }
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">{item.step}</span>
                <p className="text-sm font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Navbar />
    </div>
  );
}
