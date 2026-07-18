
"use client";

import React, { useState, useMemo } from "react";
import { 
  Smartphone, 
  Phone, 
  Gamepad2, 
  Zap, 
  Radio, 
  Sword, 
  Landmark, 
  MessageSquare, 
  Castle, 
  Swords,
  ArrowRight,
  LayoutGrid,
  X,
  CircleDollarSign,
  Banknote,
  ChevronLeft
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type ServiceItem = {
  id: string;
  name: string;
  filter: string; 
  icon: any;
  color: string;
  bg: string;
  imageUrl?: string;
  isGroup?: boolean;
};

type Section = {
  id: string;
  title: string;
  description: string;
  icon: any;
  items: ServiceItem[];
  colorClass: string;
  bgClass: string;
  imageUrl?: string;
};

export function ServiceGrid({ isAdmin, searchQuery = "" }: { isAdmin?: boolean, searchQuery?: string }) {
  const [activeSubGroup, setActiveSubGroup] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: "sham_cash_main",
      title: "قسم الشام كاش",
      description: "إرسال واستقبال الأموال",
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
      icon: Landmark,
      imageUrl: "https://i.postimg.cc/3JmhPXxg/Screenshot-20260716-213800.png",
      items: [
        { 
          id: "sham_cash", 
          name: "شام كاش", 
          filter: "Sham Cash", 
          icon: Landmark, 
          color: "text-emerald-600", 
          bg: "bg-emerald-50",
          imageUrl: "https://i.postimg.cc/3JmhPXxg/Screenshot-20260716-213800.png"
        },
      ]
    },
    {
      id: "telecom",
      title: "شحن الخطوط",
      description: "سيريتل وإم تي إن",
      colorClass: "text-red-600",
      bgClass: "bg-red-50",
      icon: Phone,
      imageUrl: "https://i.postimg.cc/5yQ43qqy/file-00000000cb008246a724502ee0786cb1.png",
      items: [
        { 
          id: "mtn_units", 
          name: "إم تي إن وحدات", 
          filter: "MTN", 
          icon: Smartphone, 
          color: "text-yellow-600", 
          bg: "bg-yellow-50",
          imageUrl: "https://i.postimg.cc/LXQfNGBF/Screenshot-20260712-221317.png"
        },
        { 
          id: "syr_units", 
          name: "سيريتل وحدات", 
          filter: "Syriatel", 
          icon: Smartphone, 
          color: "text-red-600", 
          bg: "bg-red-50",
          imageUrl: "https://i.postimg.cc/9MwTgJxR/Screenshot-20260712-221408.png"
        },
      ]
    },
    {
      id: "games",
      title: "قسم الألعاب",
      description: "ببجي، فري فاير، وكلاش",
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
      icon: Gamepad2,
      imageUrl: "https://i.postimg.cc/wB9DG3rB/file-00000000d73481f48215504fda7bec65.png",
      items: [
        { 
          id: "pubg", 
          name: "ببجي موبايل", 
          filter: "PUBG", 
          icon: Gamepad2, 
          color: "text-green-600", 
          bg: "bg-green-50",
          imageUrl: "https://i.postimg.cc/Kz7cYTjq/Screenshot-20260712-221644.png"
        },
        { 
          id: "pubg_tr", 
          name: "ببجي تركي", 
          filter: "PUBG TR", 
          icon: Gamepad2, 
          color: "text-red-600", 
          bg: "bg-red-50",
          imageUrl: "https://i.postimg.cc/Kz7cYTjq/Screenshot-20260712-221644.png"
        },
        { 
          id: "freefire", 
          name: "فري فاير", 
          filter: "Free Fire", 
          icon: Zap, 
          color: "text-orange-600", 
          bg: "bg-orange-50",
          imageUrl: "https://i.postimg.cc/HWPRyx5d/Screenshot-20260712-221757.png"
        },
        { 
          id: "pool_main_group", 
          name: "BALL POOL 8", 
          filter: "pool", 
          icon: Gamepad2, 
          color: "text-indigo-600", 
          bg: "bg-indigo-50",
          isGroup: true,
          imageUrl: "https://i.postimg.cc/G2SRtjrQ/Screenshot-20260712-224536.png"
        },
        { 
          id: "coc", 
          name: "كلاش اوف كلانس", 
          filter: "Clash", 
          icon: Castle, 
          color: "text-blue-600", 
          bg: "bg-blue-50",
          imageUrl: "https://i.postimg.cc/P5CqrH8Q/Screenshot-20260718-100947.png"
        },
        { 
          id: "clash_royale", 
          name: "كلاش رويال", 
          filter: "Royale", 
          icon: Swords, 
          color: "text-red-600", 
          bg: "bg-red-50",
          imageUrl: "https://i.postimg.cc/mkkvNL4M/Screenshot-20260718-101357.png"
        },
        { 
          id: "jawaker", 
          name: "الجواكر", 
          filter: "Jawaker", 
          icon: Sword, 
          color: "text-indigo-600", 
          bg: "bg-indigo-50",
          imageUrl: "https://i.postimg.cc/G2SRtjrQ/Screenshot-20260712-224536.png"
        },
      ]
    },
    {
      id: "apps",
      title: "قسم التطبيقات",
      description: "تيك توك، بيجو، لايكي",
      colorClass: "text-pink-600",
      bgClass: "bg-pink-50",
      icon: Radio,
      imageUrl: "https://i.postimg.cc/bvn43CKq/file-00000000a75481f4a661b3f2f65c898c.png",
      items: [
        { 
          id: "tiktok", 
          name: "تيك توك", 
          filter: "TikTok", 
          icon: Smartphone, 
          color: "text-pink-600", 
          bg: "bg-pink-50",
          imageUrl: "https://i.postimg.cc/J0vR6523/Screenshot-20260712-224351.png"
        },
        { 
          id: "bigo", 
          name: "بيجو لايف", 
          filter: "Bigo", 
          icon: Radio, 
          color: "text-teal-600", 
          bg: "bg-teal-50",
          imageUrl: "https://i.postimg.cc/QxmBb2Xw/Screenshot-20260712-221513.png"
        },
        { 
          id: "azal_live", 
          name: "آزال لايف", 
          filter: "Azal", 
          icon: MessageSquare, 
          color: "text-blue-500", 
          bg: "bg-blue-50",
          imageUrl: "https://i.postimg.cc/5y8wrvfH/Screenshot-20260718-094134.png"
        },
        { 
          id: "likee", 
          name: "لايكي", 
          filter: "Likee", 
          icon: Smartphone, 
          color: "text-purple-600", 
          bg: "bg-purple-50",
          imageUrl: "https://i.postimg.cc/j2FjVbL5/Screenshot-20260712-224255.png"
        },
      ]
    }
  ];

  const searchResults = useMemo(() => {
    if (!searchQuery) return null;
    const flatItems: ServiceItem[] = [];
    sections.forEach(s => {
      s.items.forEach(item => {
        if (!item.isGroup && (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.filter.toLowerCase().includes(searchQuery.toLowerCase()))) {
          flatItems.push(item);
        }
      });
    });
    return flatItems;
  }, [searchQuery, sections]);

  if (searchResults) {
    return (
      <div className="space-y-6">
        <h3 className="font-bold text-sm text-muted-foreground pr-2">نتائج البحث عن: {searchQuery}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
          {searchResults.length > 0 ? (
            searchResults.map((service) => (
              <ProductSheet key={service.id} serviceName={service.name} filterValue={service.filter}>
                <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white overflow-hidden shadow-sm">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <div className={`w-20 h-20 rounded-full ${service.bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden border border-white`}>
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain" />
                      ) : (
                        <service.icon className={`h-10 w-10 ${service.color}`} />
                      )}
                    </div>
                    <p className="text-[13px] font-bold leading-tight text-foreground group-hover:text-primary transition-colors">{service.name}</p>
                  </CardContent>
                </Card>
              </ProductSheet>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-muted-foreground font-bold border-2 border-dashed rounded-3xl">عذراً، لم يتم العثور على أي خدمة.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
        {sections.map((section) => (
          <Sheet key={section.id} onOpenChange={(open) => { if(!open) setActiveSubGroup(null); }}>
            <SheetTrigger asChild>
              <Card className="hover:shadow-xl transition-all cursor-pointer group active:scale-[0.98] border-none bg-white overflow-hidden relative shadow-sm h-full">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                  <div className={`w-20 h-20 rounded-full ${section.bgClass} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden border border-white`}>
                    {section.imageUrl ? (
                      <img src={section.imageUrl} alt={section.title} className="w-full h-full object-contain" />
                    ) : (
                      <section.icon className={`h-10 w-10 ${section.colorClass}`} />
                    )}
                  </div>
                  <p className="text-[14px] font-black leading-tight text-foreground group-hover:text-primary transition-colors">{section.title}</p>
                </CardContent>
              </Card>
            </SheetTrigger>
            
            <SheetContent side="bottom" className="h-full bg-background border-none shadow-none p-0 overflow-hidden" dir="rtl">
               <div className="h-full flex flex-col">
                  {/* Header with Back Button */}
                  <div className="p-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        {activeSubGroup === 'pool' ? (
                          <Button variant="ghost" onClick={() => setActiveSubGroup(null)} className="font-bold gap-2 text-primary bg-primary/10 rounded-xl px-4 py-2">
                             <ChevronLeft className="h-5 w-5" /> رجوع لقائمة الألعاب
                          </Button>
                        ) : (
                          <>
                            <div className={`p-3 rounded-2xl ${section.bgClass} w-12 h-12 flex items-center justify-center overflow-hidden border border-white/50 shadow-sm`}>
                               {section.imageUrl ? (
                                 <img src={section.imageUrl} alt={section.title} className="w-full h-full object-contain" />
                               ) : (
                                 <section.icon className={`h-6 w-6 ${section.colorClass}`} />
                               )}
                            </div>
                            <div className="text-right">
                               <SheetTitle className={`text-xl font-black font-headline ${section.colorClass}`}>{section.title}</SheetTitle>
                               <SheetDescription className="text-xs font-bold">تصفح كافة خدمات {section.title}</SheetDescription>
                            </div>
                          </>
                        )}
                     </div>
                     
                     <SheetClose asChild>
                        <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-primary/10 rounded-xl px-4 py-2">
                           <ArrowRight className="h-5 w-5" /> إغلاق
                        </Button>
                     </SheetClose>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                     {activeSubGroup === 'pool' && section.id === 'games' ? (
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-left-4">
                          <ProductSheet serviceName="العملات الذهبية" filterValue="pool coins">
                              <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white overflow-hidden shadow-sm">
                                 <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                                    <div className={`w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden border border-white`}>
                                       <CircleDollarSign className="h-10 w-10 text-yellow-600" />
                                    </div>
                                    <p className="text-[14px] font-black leading-tight text-foreground group-hover:text-primary transition-colors">العملات الذهبية</p>
                                 </CardContent>
                              </Card>
                          </ProductSheet>
                          <ProductSheet serviceName="العملات الورقية" filterValue="pool cash">
                              <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white overflow-hidden shadow-sm">
                                 <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                                    <div className={`w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden border border-white`}>
                                       <Banknote className="h-10 w-10 text-emerald-600" />
                                    </div>
                                    <p className="text-[14px] font-black leading-tight text-foreground group-hover:text-primary transition-colors">العملات الورقية</p>
                                 </CardContent>
                              </Card>
                          </ProductSheet>
                       </div>
                     ) : (
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                        {section.items.map((service) => (
                           service.isGroup ? (
                            <Card key={service.id} onClick={() => setActiveSubGroup('pool')} className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white overflow-hidden shadow-sm">
                               <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                                  <div className={`w-20 h-20 rounded-full ${service.bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden border border-white`}>
                                     {service.imageUrl ? (
                                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain" />
                                     ) : (
                                        <service.icon className={`h-10 w-10 ${service.color}`} />
                                     )}
                                  </div>
                                  <p className="text-[14px] font-black leading-tight text-foreground group-hover:text-primary transition-colors">{service.name}</p>
                               </CardContent>
                            </Card>
                           ) : (
                            <ProductSheet key={service.id} serviceName={service.name} filterValue={service.filter}>
                                <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white overflow-hidden shadow-sm">
                                   <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                                      <div className={`w-20 h-20 rounded-full ${service.bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden border border-white`}>
                                         {service.imageUrl ? (
                                            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain" />
                                         ) : (
                                            <service.icon className={`h-10 w-10 ${service.color}`} />
                                         )}
                                      </div>
                                      <p className="text-[14px] font-black leading-tight text-foreground group-hover:text-primary transition-colors">{service.name}</p>
                                   </CardContent>
                                </Card>
                             </ProductSheet>
                           )
                        ))}
                       </div>
                     )}
                  </div>
                  
                  <div className="p-6 bg-white border-t flex justify-center pb-10">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid className="h-3 w-3" /> شبك لبيك - {section.title}
                      </p>
                  </div>
               </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>

      <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 flex items-center justify-between">
         <div className="text-right">
            <h4 className="font-black text-primary text-sm">برنامج المكافآت</h4>
            <p className="text-[10px] text-muted-foreground font-medium">شارك كودك واربح رصيد مجاني عن كل صديق</p>
         </div>
         <Button onClick={() => window.location.href='/referral'} size="sm" className="rounded-2xl font-bold gap-2">
            اكتشف المزيد <ArrowRight className="h-4 w-4 rotate-180" />
         </Button>
      </div>
    </div>
  );
}
