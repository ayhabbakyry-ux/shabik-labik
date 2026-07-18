
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
  ChevronLeft,
  ArrowRight,
  LayoutGrid,
  Trophy,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger
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
};

type Section = {
  id: string;
  title: string;
  description: string;
  icon: any;
  items: ServiceItem[];
  colorClass: string;
  bgClass: string;
};

export function ServiceGrid({ isAdmin, searchQuery = "" }: { isAdmin?: boolean, searchQuery?: string }) {
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: "telecom",
      title: "شحن الخطوط (وحدات وفواتير)",
      description: "سيريتل، إم تي إن، وخدمات شام كاش",
      colorClass: "text-red-600",
      bgClass: "bg-red-50",
      icon: Phone,
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
      id: "games",
      title: "الألعاب العالمية والجواكر",
      description: "ببجي، فري فاير، كلاش، وأقوى الألعاب",
      colorClass: "text-green-600",
      bgClass: "bg-green-50",
      icon: Gamepad2,
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
          id: "coc", 
          name: "كلاش اوف كلانس", 
          filter: "Clash", 
          icon: Castle, 
          color: "text-blue-600", 
          bg: "bg-blue-50",
          imageUrl: "https://i.postimg.cc/fbYd630T/coc.png"
        },
        { 
          id: "clash_royale", 
          name: "كلاش رويال", 
          filter: "Royale", 
          icon: Swords, 
          color: "text-red-600", 
          bg: "bg-red-50",
          imageUrl: "https://i.postimg.cc/mD363z07/royale.png"
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
      title: "تطبيقات البث المباشر",
      description: "تيك توك، بيجو، والبرامج الترفيهية",
      colorClass: "text-pink-600",
      bgClass: "bg-pink-50",
      icon: Radio,
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
          imageUrl: "https://i.postimg.cc/nLRCSyHB/1784236005436.png"
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

  // منطق البحث: إذا وجدنا نصاً، نعرض كافة الخدمات المطابقة مباشرة
  const searchResults = useMemo(() => {
    if (!searchQuery) return null;
    const flatItems: ServiceItem[] = [];
    sections.forEach(s => {
      s.items.forEach(item => {
        if (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.filter.toLowerCase().includes(searchQuery.toLowerCase())) {
          flatItems.push(item);
        }
      });
    });
    return flatItems;
  }, [searchQuery, sections]);

  // إذا كان هناك بحث، نعرض النتائج مباشرة دون أقسام
  if (searchResults) {
    return (
      <div className="space-y-6">
        <h3 className="font-bold text-sm text-muted-foreground pr-2">نتائج البحث عن: {searchQuery}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
          {searchResults.length > 0 ? (
            searchResults.map((service) => (
              <ProductSheet key={service.id} serviceName={service.name} filterValue={service.filter}>
                <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white overflow-hidden">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <div className={`w-20 h-20 rounded-full ${service.bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden`}>
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
      <div className="grid grid-cols-1 gap-4" dir="rtl">
        {sections.map((section) => (
          <Sheet key={section.id}>
            <SheetTrigger asChild>
              <Card className="hover:shadow-xl transition-all cursor-pointer group active:scale-[0.98] border-none bg-white overflow-hidden relative shadow-sm">
                <div className={`absolute top-0 right-0 w-1.5 h-full ${section.colorClass.replace('text', 'bg')}`} />
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[24px] ${section.bgClass} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                      <section.icon className={`h-8 w-8 ${section.colorClass}`} />
                    </div>
                    <div className="text-right">
                      <h3 className={`text-lg font-black font-headline ${section.colorClass}`}>{section.title}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{section.description}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </SheetTrigger>
            
            <SheetContent side="bottom" className="h-[75vh] rounded-t-[40px] bg-background border-none shadow-2xl p-0 overflow-hidden" dir="rtl">
               <div className="h-full flex flex-col">
                  <div className="p-6 border-b bg-white/50 backdrop-blur-md sticky top-0 z-20">
                     <SheetHeader className="text-right flex flex-row items-center gap-4">
                        <div className={`p-3 rounded-2xl ${section.bgClass}`}>
                           <section.icon className={`h-6 w-6 ${section.colorClass}`} />
                        </div>
                        <div>
                           <SheetTitle className={`text-xl font-black font-headline ${section.colorClass}`}>{section.title}</SheetTitle>
                           <SheetDescription className="text-xs font-bold">اختر نوع الخدمة المطلوب شحنها</SheetDescription>
                        </div>
                     </SheetHeader>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {section.items.map((service) => (
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
                        ))}
                     </div>
                  </div>
                  
                  <div className="p-6 bg-white border-t flex justify-center">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid className="h-3 w-3" /> قسم {section.title}
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
