
"use client";

import { Smartphone, FileText, Globe, SmartphoneNfc, ShieldCheck, Phone, Gamepad2, CreditCard, ShoppingBag, Tv, Hash, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";

type ServiceItem = {
  id: string;
  name: string;
  icon: any;
  color: string;
  bg: string;
};

type Section = {
  title: string;
  categoryId: number;
  icon: any;
  items: ServiceItem[];
  colorClass: string;
};

export function ServiceGrid({ isAdmin }: { isAdmin?: boolean }) {
  const sections: Section[] = [
    {
      title: "قسم شحن الخطوط (وحدات وفواتير)",
      categoryId: 6,
      icon: Phone,
      colorClass: "text-primary",
      items: [
        { id: "mtn_units", name: "إم تي إن وحدات", icon: Smartphone, color: "text-yellow-600", bg: "bg-yellow-50" },
        { id: "syr_units", name: "سيريتل وحدات", icon: Smartphone, color: "text-red-600", bg: "bg-red-50" },
        { id: "mtn_bill", name: "إم تي إن فاتورة", icon: FileText, color: "text-yellow-700", bg: "bg-yellow-100" },
        { id: "syr_bill", name: "سيريتل فاتورة", icon: FileText, color: "text-red-700", bg: "bg-red-100" },
        { id: "elux", name: "ELUX", icon: SmartphoneNfc, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "syr_old", name: "سيريتل ليرة قديمة", icon: Smartphone, color: "text-rose-600", bg: "bg-rose-50" },
      ]
    },
    {
      title: "قسم الألعاب العالمية",
      categoryId: 2,
      icon: Gamepad2,
      colorClass: "text-green-600",
      items: [
        { id: "pubg", name: "ببجي موبايل", icon: Gamepad2, color: "text-green-600", bg: "bg-green-50" },
        { id: "freefire", name: "فري فاير", icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
      ]
    },
    {
      title: "تطبيقات البث المباشر",
      categoryId: 1,
      icon: SmartphoneNfc,
      colorClass: "text-pink-600",
      items: [
        { id: "tiktok", name: "تيك توك", icon: SmartphoneNfc, color: "text-pink-600", bg: "bg-pink-50" },
        { id: "likee", name: "لايكي", icon: SmartphoneNfc, color: "text-purple-600", bg: "bg-purple-50" },
      ]
    },
    {
      title: "بطاقات الدفع والمتاجر",
      categoryId: 5,
      icon: ShoppingBag,
      colorClass: "text-amber-600",
      items: [
        { id: "google_play", name: "جوجل بلاي", icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
        { id: "netflix", name: "نتفليكس", icon: Tv, color: "text-rose-600", bg: "bg-rose-50" },
      ]
    }
  ];

  const renderServiceCard = (service: ServiceItem, categoryId: number) => {
    const Icon = service.icon;
    return (
      <ProductSheet 
        key={service.id} 
        serviceName={service.name} 
        categoryId={categoryId}
      >
        <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white overflow-hidden">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className={`w-20 h-20 rounded-full ${service.bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
              <Icon className={`h-10 w-10 ${service.color}`} />
            </div>
            <p className="text-[13px] font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
              {service.name}
            </p>
          </CardContent>
        </Card>
      </ProductSheet>
    );
  };

  return (
    <div className="space-y-12 pb-10">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h3 className={`font-bold text-lg border-r-4 border-current pr-3 flex items-center gap-2 ${section.colorClass} justify-end`}>
            {section.title}
            <section.icon className="h-5 w-5" />
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
            {section.items.map((item) => renderServiceCard(item, section.categoryId))}
          </div>
        </div>
      ))}
    </div>
  );
}
