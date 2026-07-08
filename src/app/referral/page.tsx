"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Users, Gift, CheckCircle2, ArrowRight, Menu, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReferralPage() {
  const { userPhone, currency, isLoggedIn, isAdmin } = useUser();
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  // كود المدير ADMEN والمشترك آخر 5 أرقام
  const myReferralCode = isAdmin ? "ADMEN" : (userPhone ? userPhone.slice(-5) : "00000");
  const referralLink = `https://shabik-labik.vercel.app`;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(myReferralCode);
      setCopied(true);
      toast({
        title: "تم النسخ بنجاح",
        description: `كود الإحالة (${myReferralCode}) جاهز للمشاركة الآن.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "فشل النسخ",
        description: "يرجى نسخ الكود يدوياً.",
      });
    }
  };

  const handleShare = async () => {
    const shareText = `أهلاً بك! أدعوك للتسجيل في تطبيق شبك لبيك الرقمي والاستفادة من عروض الشحن التلقائي.\n🌐 رابط الموقع: ${referralLink}\n🔑 كود الدعوة الخاص بي: ${myReferralCode}\n(أدخل الكود عند التسجيل لتحصل على 25 ل.س مجاناً!)`;
    
    const shareData = {
      title: 'شبك لبيك الرقمي',
      text: shareText,
      url: referralLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error("Share API not available");
      }
    } catch (err) {
      // نظام التراجع التلقائي في حال فشل ميزة المشاركة الذكية
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "تم نسخ نص المشاركة",
          description: "رسالة الدعوة جاهزة للإرسال عبر أي تطبيق تواصل الآن.",
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "عذراً يا غالي",
          description: "حدث خطأ غير متوقع، يرجى نسخ الكود ومشاركته يدوياً.",
        });
      }
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
        <span className="font-bold text-sm">برنامج المكافآت الأكاديمي</span>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-muted rounded-xl text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      <main className="max-w-2xl mx-auto p-4 space-y-6 pt-10">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative inline-block">
            <div className="bg-primary/10 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto shadow-inner transform -rotate-6">
              <Gift className="h-12 w-12 text-primary" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-headline text-slate-900 tracking-tight">ادعُ أصدقاءك واربح!</h1>
            <p className="text-muted-foreground text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed">
              شارك كودك الخاص واحصل على <span className="text-primary font-bold text-lg">25 {currency}</span> مجاناً لكل صديق ينضم إلينا.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[32px] bg-white overflow-hidden relative border-t-4 border-primary">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-slate-800 font-bold">كود الإحالة الخاص بك</CardTitle>
            <CardDescription>هذا هو مفتاحك للحصول على رصيد مجاني</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={handleCopy}
                className="bg-slate-50 border-2 border-dashed border-slate-200 w-full p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors group relative"
              >
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">اضغط للنسخ</span>
                <span className="text-5xl font-black text-primary font-mono tracking-widest group-hover:scale-105 transition-transform">{myReferralCode}</span>
                {copied && <CheckCircle2 className="h-6 w-6 text-green-500 absolute top-4 left-4 animate-bounce" />}
              </div>
              
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <Button onClick={handleCopy} className="w-full h-14 bg-white border-2 border-primary text-primary hover:bg-primary/5 rounded-2xl font-black text-lg shadow-sm active:scale-[0.98] transition-all">
                   {copied ? "تم النسخ!" : "نسخ الكود"} <Copy className="mr-2 h-5 w-5" />
                </Button>
                <Button onClick={handleShare} className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
                   مشاركة الرابط <Share2 className="mr-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-primary/5 border border-primary/10 p-6 rounded-[32px] text-center space-y-2">
           <h4 className="font-black text-primary text-sm flex items-center justify-center gap-2">
             <Sparkles className="h-4 w-4" /> كيف تعمل المكافأة؟
           </h4>
           <p className="text-xs text-slate-600 leading-relaxed font-medium">
             بمجرد استخدام صديقك لكودك عند تسجيله لأول مرة، سيتم إضافة <span className="font-bold text-primary">25 ليرة</span> لمحفظتك فوراً، وسيحصل صديقك أيضاً على <span className="font-bold text-primary">25 ليرة</span> كهدية ترحيبية.
           </p>
        </div>
      </main>

      <Navbar />
    </div>
  );
}
