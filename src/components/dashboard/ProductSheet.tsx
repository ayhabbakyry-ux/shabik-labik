
"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PackageX, RefreshCw, ShoppingCart, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductItem {
  id: string | number;
  product_id?: string | number;
  parent_id: string | number;
  name: string;
  price: string | number;
  options?: any;
  variants?: any;
}

export function ProductSheet({ 
  children, 
  serviceName, 
  categoryId: activeCategoryId 
}: { 
  children: React.ReactNode; 
  serviceName: string; 
  categoryId?: number;
}) {
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // جلب البيانات مباشرة من السيرفر داخل المكون لضمان التحديث التلقائي
  const fetchProducts = useCallback(async () => {
    if (!activeCategoryId) return;
    setFetching(true);
    try {
      const response = await fetch(`/api/products?categoryId=${activeCategoryId}`);
      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();
      
      // طباعة البيانات للتأكد من هيكلية السيرفر (للديبيغ)
      console.log("[API DEBUG] Raw response for category", activeCategoryId, data);
      
      const rawItems = Array.isArray(data) ? data : (data.data || data.products || []);
      setAllProducts(rawItems);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر تحديث البيانات من السيرفر.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [activeCategoryId, toast]);

  // معالجة البيانات وتجميعها (المنطق البرمجي المطلوب)
  const groupedServices = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts)) return [];

    let baseFilter = allProducts.filter(
      (item) => Number(item.parent_id) === Number(activeCategoryId)
    );

    // عزل الشبكات لخدمات الاتصال (الفئة 6)
    if (Number(activeCategoryId) === 6 && serviceName) {
      const title = serviceName.toLowerCase();
      if (title.includes("إم تي إن") || title.includes("mtn")) {
        baseFilter = baseFilter.filter(
          (item) => item.name?.includes("إم تي إن") || item.name?.toUpperCase().includes("MTN")
        );
      } else if (title.includes("سيريتل") || title.includes("syriatel")) {
        baseFilter = baseFilter.filter((item) => item.name?.includes("سيريتل"));
      }
    }

    const groups: Record<string, { id: string; mainTitle: string; items: any[] }> = {};

    baseFilter.forEach((item) => {
      let groupKey = "عام";
      if (item.name?.includes("وحدات")) groupKey = "وحدات";
      else if (item.name?.includes("فاتورة")) groupKey = "فاتورة";

      const cleanTitle = item.name ? item.name.split(/[\d.]+/)[0].trim() : (serviceName || "خدمة شحن");

      if (!groups[groupKey]) {
        groups[groupKey] = { id: groupKey, mainTitle: cleanTitle, items: [] };
      }

      // فحص الخيارات المندرجة (Nested Options/Variants) وهي النقطة التي كان فيها الخلل
      const nestedOptions = item.options || item.variants || [];
      if (Array.isArray(nestedOptions) && nestedOptions.length > 0) {
        nestedOptions.forEach((opt: any) => {
          const nameNumbers = opt.name?.match(/[\d.]+/);
          const extractedAmount = nameNumbers ? nameNumbers[0] : (opt.amount || opt.denomination || "محدد");
          
          // تطبيق المربح المخفي 4%
          const basePrice = Number(opt.price || item.price || 0);
          const finalCustomerPrice = (basePrice * 1.04).toFixed(2);

          groups[groupKey].items.push({
            id: opt.id || `${item.id}-${Math.random()}`,
            name: item.name,
            extractedAmount: extractedAmount,
            customerPrice: finalCustomerPrice,
            price: basePrice
          });
        });
      } else {
        // إذا لم يوجد خيارات مندرجة، نأخذ المنتج الأساسي نفسه
        const nameNumbers = item.name?.match(/[\d.]+/);
        const extractedAmount = nameNumbers ? nameNumbers[0] : (item.amount || "محدد");
        const basePrice = Number(item.price || 0);
        const finalCustomerPrice = (basePrice * 1.04).toFixed(2);

        groups[groupKey].items.push({
          id: item.id,
          name: item.name,
          extractedAmount: extractedAmount,
          customerPrice: finalCustomerPrice,
          price: basePrice
        });
      }
    });

    // ترتيب المنتجات تصاعدياً حسب السعر داخل كل مجموعة
    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => Number(a.price) - Number(b.price));
    });

    return Object.values(groups);
  }, [allProducts, activeCategoryId, serviceName]);

  // تعيين الخيار الأول تلقائياً عند تحميل المجموعات
  useEffect(() => {
    const initialSelections: Record<string, string> = {};
    groupedServices.forEach((group) => {
      if (group.items.length > 0) {
        initialSelections[group.id] = group.items[0].id.toString();
      }
    });
    setSelectedOptions(initialSelections);
  }, [groupedServices]);

  const handleOrder = (variation: any) => {
    toast({
      title: "تم استلام الطلب",
      description: `طلب شحن بقيمة ${variation.customerPrice} ل.س قيد المعالجة.`,
    });
  };

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchProducts(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none bg-background" dir="rtl">
        <div className="p-4 border-b bg-white">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-right text-primary">{serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-right text-xs">
              اختر الفئة المطلوبة وسيظهر لك السعر النهائي المشمول بالمربح.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري مزامنة الأسعار من السيرفر...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {groupedServices.length > 0 ? (
                <div className="grid gap-6">
                  {groupedServices.map((group) => {
                    const selectedId = selectedOptions[group.id];
                    const currentItem = group.items.find((i) => i.id.toString() === selectedId) || group.items[0];

                    return (
                      <Card key={group.id} className="border-none shadow-md bg-white overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-right flex-1">
                              <h4 className="font-bold text-lg text-foreground leading-tight">{group.mainTitle}</h4>
                              <p className="text-[11px] text-muted-foreground">الرصيد الواصل: {currentItem ? currentItem.extractedAmount : "محدد"}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground pr-1">اختر القيمة / الكمية المطلوبة</label>
                            <Select 
                              value={selectedId || (group.items[0]?.id.toString())} 
                              onValueChange={(val) => setSelectedOptions(prev => ({ ...prev, [group.id]: val }))}
                            >
                              <SelectTrigger className="w-full text-right bg-muted/30 border-none h-12 text-sm font-medium">
                                <SelectValue placeholder="اختر الفئة..." />
                              </SelectTrigger>
                              <SelectContent dir="rtl">
                                {group.items.map((item) => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    رصيد {item.extractedAmount}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground mb-1 font-bold">السعر للمستهلك (4%+)</p>
                              <p className="text-primary font-bold text-2xl leading-none">
                                {currentItem ? currentItem.customerPrice : "0.00"} <span className="text-xs opacity-70">ل.س</span>
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleOrder(currentItem)}
                              className="rounded-full px-8 h-12 bg-primary text-white font-bold hover:scale-105 transition-transform shadow-lg"
                            >
                              <ShoppingCart className="ml-2 h-4 w-4" />
                              اطلب الآن
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <PackageX className="h-10 w-10 opacity-40" />
                  <p className="text-sm font-bold text-center">لا توجد بيانات متاحة لهذا القسم حالياً.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
