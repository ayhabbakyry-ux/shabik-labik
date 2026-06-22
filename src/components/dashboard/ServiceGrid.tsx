
"use client";

import { Smartphone, Zap, Gamepad2, CreditCard, ShieldCheck, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";

/**
 * Service Grid Configuration
 * Using descriptive slugs that ProductSheet will resolve to numeric IDs 
 * by searching the live API /client/api/content/0 response.
 */
const services = [
  { id: 'alragheb', name: "بضاعة ومنتجات الراغب", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  { id: 'line-recharge', name: "قسم شحن الخطوط", icon: Layers, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 'syriatel-units', name: "وحدات سيريتل", icon: Smartphone, color: "text-red-500", bg: "bg-red-50" },
  { id: 'mtn-units', name: "وحدات الام تي ان", icon: Smartphone, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: 'syriatel-cash', name: "سيريتل كاش", icon: CreditCard, color: "text-red-600", bg: "bg-red-50" },
  { id: 'gaming', name: "العاب وتطبيقات دردشة", icon: Gamepad2, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 'admin', name: "لوحة التحكم (المعلم)", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10", isAdmin: true },
];

export function ServiceGrid({ isAdmin }: { isAdmin?: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {services
        .filter(s => !s.isAdmin || isAdmin)
        .map((service) => (
          <ProductSheet key={service.id} serviceName={service.name} serviceId={service.id}>
            <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className={`p-3 rounded-2xl ${service.bg} group-hover:scale-110 transition-transform`}>
                  <service.icon className={`h-6 w-6 ${service.color}`} />
                </div>
                <p className="text-xs font-bold leading-tight uppercase tracking-wide text-muted-foreground group-hover:text-primary transition-colors">
                  {service.name}
                </p>
              </CardContent>
            </Card>
          </ProductSheet>
        ))}
    </div>
  );
}
