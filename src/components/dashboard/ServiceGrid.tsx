"use client";

import { Smartphone, SmartphoneNfc, Phone, Gamepad2, Zap, Radio, Sword, Landmark, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";

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
  title: string;
  icon: any;
  items: ServiceItem[];
  colorClass: string;
};

export function ServiceGrid({ isAdmin }: { isAdmin?: boolean }) {
  const sections: Section[] = [
    {
      title: "قسم شحن الخطوط (وحدات وفواتير)",
      colorClass: "text-primary",
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
        { id: "elux", name: "ELUX", filter: "ELUX", icon: SmartphoneNfc, color: "text-blue-600", bg: "bg-blue-50" },
      ]
    },
    {
      title: "قسم الألعاب العالمية والجواكر",
      colorClass: "text-green-600",
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
          id: "freefire", 
          name: "فري فاير", 
          filter: "Free Fire", 
          icon: Zap, 
          color: "text-orange-600", 
          bg: "bg-orange-50",
          imageUrl: "https://i.postimg.cc/HWPRyx5d/Screenshot-20260712-221757.png"
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
      title: "تطبيقات البث المباشر (أكاديمية)",
      colorClass: "text-pink-600",
      icon: SmartphoneNfc,
      items: [
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
          id: "tiktok", 
          name: "تيك توك", 
          filter: "TikTok", 
          icon: SmartphoneNfc, 
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
          id: "likee", 
          name: "لايكي", 
          filter: "Likee", 
          icon: SmartphoneNfc, 
          color: "text-purple-600", 
          bg: "bg-purple-50",
          imageUrl: "https://i.postimg.cc/j2FjVbL5/Screenshot-20260712-224255.png"
        },
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-10">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h3 className={`font-bold text-lg border-r-4 border-current pr-3 flex items-center gap-2 ${section.colorClass} justify-end`}>
            {section.title}
            <section.icon className="h-5 v-5" />
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
            {section.items.map((service) => (
              <ProductSheet 
                key={service.id} 
                serviceName={service.name} 
                filterValue={service.filter}
              >
                <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white overflow-hidden">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <div className={`w-20 h-20 rounded-full ${service.bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden`}>
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain" />
                      ) : (
                        <service.icon className={`h-10 w-10 ${service.color}`} />
                      )}
                    </div>
                    <p className="text-[13px] font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </p>
                  </CardContent>
                </Card>
              </ProductSheet>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
