
"use client";

import { Smartphone, FileText, Globe, SmartphoneNfc, ShieldCheck, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";

type ServiceItem = {
  id: string;
  name: string;
  icon: any;
  color: string;
  bg: string;
  categoryId?: number; // Added: Direct ID from Al-Ragheb
};

export function ServiceGrid({ isAdmin }: { isAdmin?: boolean }) {
  // Static UI structure matching screenshot 1000197511.jpg
  // Once the user checks the console, we will fill in the 'categoryId' values here.
  const lineChargingServices: ServiceItem[] = [
    { id: "mtn_units", name: "إم تي إن وحدات", icon: Smartphone, color: "text-yellow-600", bg: "bg-yellow-50", categoryId: undefined },
    { id: "syr_units", name: "سيريتل وحدات", icon: Smartphone, color: "text-red-600", bg: "bg-red-50", categoryId: undefined },
    { id: "mtn_bill", name: "إم تي إن فاتورة", icon: FileText, color: "text-yellow-700", bg: "bg-yellow-100", categoryId: undefined },
    { id: "syr_bill", name: "سيريتل فاتورة", icon: FileText, color: "text-red-700", bg: "bg-red-100", categoryId: undefined },
    { id: "elux", name: "ELUX", icon: SmartphoneNfc, color: "text-blue-600", bg: "bg-blue-50", categoryId: undefined },
    { id: "syr_old", name: "سيريتل - الليرة القديمة", icon: Smartphone, color: "text-rose-600", bg: "bg-rose-50", categoryId: undefined },
    { id: "asiacell", name: "ASIACELL", icon: Globe, color: "text-purple-600", bg: "bg-purple-50", categoryId: undefined },
    { id: "sentence", name: "SENTENCE", icon: Smartphone, color: "text-indigo-600", bg: "bg-indigo-50", categoryId: undefined },
  ];

  const renderServiceCard = (service: ServiceItem) => {
    const Icon = service.icon;
    return (
      <ProductSheet 
        key={service.id} 
        serviceName={service.name} 
        categoryId={service.categoryId}
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
    <div className="space-y-8">
      {/* Line Charging Section (قسم شحن الخطوط) */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg border-r-4 border-primary pr-3 flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          قسم شحن الخطوط
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {lineChargingServices.map(renderServiceCard)}
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg border-r-4 border-destructive pr-3">الإدارة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ProductSheet serviceName="لوحة التحكم" serviceId="admin">
              <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-[13px] font-bold leading-tight text-muted-foreground group-hover:text-primary transition-colors">
                    لوحة التحكم
                  </p>
                </CardContent>
              </Card>
            </ProductSheet>
          </div>
        </div>
      )}
    </div>
  );
}
