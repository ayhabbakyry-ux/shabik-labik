
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
import { useUser } from "@/lib/store";
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
  const { currency } = useUser();

  const fetchProducts = useCallback(async () => {
    if (!activeCategoryId) return;
    setFetching(true);
    try {
      const response = await fetch(`/api/products?categoryId=${activeCategoryId}`, {
        cache: 'no-store'
      });
      const result = await response.json();
      console.log(`[FETCH ${serviceName}]:`, result); // تتبع البيانات
      
      const rawItems = Array.isArray(result) ? result : (result.data || result.products || []);
      setAllProducts(rawItems);
    } catch (error: any) {
      console.error("[FETCH ERROR]:", error);
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر جلب البيانات. يرجى المحاولة لاحقاً.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [activeCategoryId, toast, serviceName]);

  const groupedServices = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts)) return [];

    // نظام الفلترة المرن
    const searchTerms = serviceName.toLowerCase().split(' ').filter(k => k.length > 2);
    
    let filtered = allProducts;

    if (searchTerms.length > 0) {
      filtered = allProducts.filter(item => {
        const itemName = item.name?.toLowerCase() || "";
        // إذا كان هناك أي كلمة مطابقة، نعتبرها صالحة لضمان ظهور البيانات
        return searchTerms.some(kw => itemName.includes(kw));
      });
    }

    // إذا لم ينجح الفلترة الدقيقة، نعرض جميع منتجات هذا القسم لضمان عدم ظهور "لا توجد منتجات"
    if (filtered.length === 0) {
      filtered = allProducts;
    }

    const groups: Record<string, { id: string; mainTitle: string; items: any[] }> = {};

    filtered.forEach((item) => {
      const groupKey = item.id.toString();
      const mainTitle = item.name || serviceName;

      if (!groups[groupKey]) {
        groups[groupKey] = { id: groupKey, mainTitle: mainTitle, items: [] };
      }

      const subItems = item.options || item.variants || item.params || [];
      
      if (Array.isArray(subItems) && subItems.length > 0) {
        subItems.forEach((sub: any) => {
          const basePrice = Number(sub.price || item.price || 0);
          groups[groupKey].items.push({
            id: sub.id || `${item.id}-${Math.random()}`,
            name: sub.name || item.name,
            customerPrice: (basePrice * 1.04).toFixed(0),
            price: basePrice
          });
        });
      } else {
        const basePrice = Number(item.price || 0);
        groups[groupKey].items.push({
          id: item.id,
          name: item.name,
          customerPrice: (basePrice * 1.04).toFixed(0),
          price: basePrice
        });
      }
    });

    return Object.values(groups);
  }, [allProducts, serviceName]);

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
      description: `طلب ${serviceName} بقيمة ${Number(variation.customerPrice).toLocaleString()} ${currency} قيد التنفيذ.`,
    });
  };

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchProducts(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none bg-background" dir="rtl">
        <div className="p-4 border-b bg-white">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-primary text-right w-full">{serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-right text-xs">مزامنة البيانات الحية من مزود الخدمة.</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground">جاري جلب الفئات المخصصة...</p>
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
                              <p className="text-[11px] text-muted-foreground">اختر الكمية المطلوبة بالأسفل</p>
                            </div>
                          </div>

                          {group.items.length > 1 && (
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-muted-foreground pr-1">الفئات المتوفرة</label>
                              <Select 
                                value={selectedId} 
                                onValueChange={(val) => setSelectedOptions(prev => ({ ...prev, [group.id]: val }))}
                              >
                                <SelectTrigger className="w-full text-right bg-muted/30 border-none h-12 text-sm font-medium">
                                  <SelectValue placeholder="اختر الفئة..." />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                  {group.items.map((item) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                      {item.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground font-bold">السعر (مع عمولة 4%)</p>
                              <p className="text-primary font-bold text-2xl">
                                {currentItem ? Number(currentItem.customerPrice).toLocaleString() : "0"} <span className="text-xs">{currency}</span>
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
                  <p className="text-sm font-bold text-center px-4">عذراً، لم يتم العثور على منتجات مطابقة لهذا القسم حالياً.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
