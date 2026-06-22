"use client";

import { Smartphone, Zap, Gamepad2, CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";

/**
 * Service Grid Configuration
 * Note: IDs '1' and '2' are placeholders for Syriatel and MTN Category IDs.
 * Please replace them with the actual IDs from your Al-Ragheb API response.
 */
const services = [
  { id: 'alragheb', name: "Al-Ragheb Digital Goods", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  { id: '1', name: "Syriatel Units", icon: Smartphone, color: "text-red-500", bg: "bg-red-50" },
  { id: '2', name: "MTN Units", icon: Smartphone, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: 'syriatel-cash', name: "Syr Cash Topup", icon: CreditCard, color: "text-red-600", bg: "bg-red-50" },
  { id: 'gaming', name: "Gaming & Chat Apps", icon: Gamepad2, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 'admin', name: "Admin (Maalam Console)", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10", isAdmin: true },
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
