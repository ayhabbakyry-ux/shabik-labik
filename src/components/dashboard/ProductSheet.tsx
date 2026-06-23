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
  options?: any[];
  variants?: any[];
  params?: any[];
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

  const fetchProducts = useCallback(async () => {
    if (!activeCategoryId) return;
    setFetching(true);
    try {
      // Fetching from local backend proxy which handles anonymization and spoofing
      const response = await fetch(`/api/products?categoryId=${activeCategoryId}`, {
        cache: 'no-store'
      });
      
      const result = await response.json();
      
      // Extract products from result
      const rawItems = Array.isArray(result) ? result : (result.data || result.products || []);
      setAllProducts(rawItems);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر تجاوز جدار الحماية.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [activeCategoryId, toast]);

  const groupedServices = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts)) return [];

    let baseFilter = allProducts.filter(
      (item) => Number(item.parent_id) === Number(activeCategoryId)
    );

    // Filter for telecom specific networks
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
      let groupKey = item.name?.includes("وحدات") ? "وحدات" : (item.name?.includes("فاتورة") ? "فاتورة" : "عام");
      const cleanTitle = item.name?.split(/[\d.]+/)[0].trim() || serviceName;

      if (!groups[groupKey]) {
        groups[groupKey] = { id: groupKey, mainTitle: cleanTitle, items: [] };
      }

      // Check for nested variations in various fields
      const subItems = item.options || item.variants || item.params || [];
      
      if (Array.isArray(subItems) && subItems.length > 0 && typeof subItems[0] === 'object') {
        subItems.forEach((sub: any) => {
          const nameNums = sub.name?.match(/[\d.]+/);
          const amount = nameNums ? nameNums[0] : (sub.amount || sub.value || "محدد");
          const basePrice = Number(sub.price || item.price || 0);
          
          groups[groupKey].items.push({
            id: sub.id || `${item.id}-${Math.random()}`,
            name: sub.name || item.name,
            extractedAmount: amount,
            customerPrice: (basePrice * 1.04).toFixed(2),
            price: basePrice
          });
        });
      } else {
        const nameNums = item.name?.match(/[\d.]+/);
        const amount = nameNums ? nameNums[0] : (item.amount || "محدد");
        const basePrice = Number(item.price || 0);

        groups[groupKey].items.push({
          id: item.id,
          name: item.name,
          extractedAmount: amount,
          customerPrice: (basePrice * 1.04).toFixed(2),
          price: basePrice
        });
      }
    });

    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => Number(a.price) - Number(b.price));
    });

    return Object.values(groups);
  }, [allProducts, activeCategoryId, serviceName]);

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
      description: `طلب ${serviceName} بقيمة ${variation.customerPrice} ل.س قيد التنفيذ.`,
    });
  };

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchProducts(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none bg-background" dir="rtl">
        {/* DEBUG BLOCK - RAW SERVER RESPONSE */}
        <div className="bg-red-50 border-b-2 border-red-200 p-4 max-h-[200px] overflow-auto">
          <p className="text-[10px] font-bold text-red-700 uppercase mb-1">Server Raw Response Debug:</p>
          <pre className="text-[10px] text-red-600 font-mono" dir="ltr">
            {allProducts && allProducts.length > 0 
              ? JSON.stringify(allProducts[0], null, 2) 
              : fetching ? "FETCHING VIA ANONYMOUS PROXY..." : "DATA IS EMPTY FROM SERVER"}
          </pre>
        </div>

        <div className="p-4 border-b bg-white">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-primary">{serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-right text-xs">مزامنة البيانات حياً عبر بوابة تشفير (Spoofed Gateway).</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground">جاري فك تشفير البيانات من السيرفر...</p>
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
                            <div className="p-3 bg-primary/10 rounded-xl"><Zap className="h-5 w-5 text-primary" /></div>
                            <div className="text-right flex-1">
                              <h4 className="font-bold text-lg text-foreground">{group.mainTitle}</h4>
                              <p className="text-[11px] text-muted-foreground">الرصيد الواصل: {currentItem?.extractedAmount}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground pr-1">اختر الفئة المطلوبة</label>
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
                                    الرصيد الواصل: {item.extractedAmount}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground font-bold">السعر للمستهلك (4%+)</p>
                              <p className="text-primary font-bold text-2xl">
                                {currentItem ? currentItem.customerPrice : "0.00"} <span className="text-xs">ل.س</span>
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleOrder(currentItem)}
                              className="rounded-full px-8 h-12 bg-primary shadow-lg font-bold"
                            >
                              <ShoppingCart className="ml-2 h-4 w-4" /> اطلب الآن
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                  <PackageX className="h-12 w-12 opacity-30" />
                  <p className="text-sm font-bold text-center px-4">لا تتوفر فئات حالياً. تأكد من استقرار بوابة التشفير وصلاحية الحساب.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
