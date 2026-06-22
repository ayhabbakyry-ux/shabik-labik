"use client";

import { Smartphone, Gamepad2, CreditCard, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";

/**
 * Service Grid Configuration
 * Flattened UI to avoid Code 109 errors.
 * Using EXACT Arabic strings for direct dynamic resolution from Al-Ragheb API.
 */
const services = [
  { id: 'mtn-units', name: "إم تي ان وحدات", icon: Smartphone, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: 'syriatel-units', name: "سيريتل وحدات", icon: Smartphone, color: "text-red-500", bg: "bg-red-50" },
  { id: 'syriatel-cash', name: "سيريتل كاش", icon: CreditCard, color: "text-red-600", bg: "bg-red-50" },
  { id: 'gaming', name: "العاب", icon: Gamepad2, color: "text-blue-500", bg: "bg-blue-50" },
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
