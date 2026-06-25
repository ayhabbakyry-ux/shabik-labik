
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
import { Loader2, PackageX, RefreshCw, ShoppingCart, Zap, User as UserIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/lib/store";
import { Input } from "@/components/ui/input";
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
  const [targetIds, setTargetIds] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { currency, userBalance } = useUser();

  const fetchProducts = useCallback(async () => {
    if (!activeCategoryId) return;
    setFetching(true);
    try {
      const response = await fetch(`/api/products?categoryId=${activeCategoryId}`);
      const data = await response.json();
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "خطأ في الاتصال",
        description: "فشل جلب المنتجات من الراغب.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [activeCategoryId, toast]);

  const groupedServices = useMemo(() => {
    if (!allProducts.length) return [];

    return allProducts.map(item => {
      // تطبيق عمولة 4% على السعر الآتي من الراغب
      const applyMargin = (price: number) => (price * 1.04).toFixed(0);

      const subItems = item.options || item.variants || item.params || [];
      const items = Array.isArray(subItems) && subItems.length > 0 
        ? subItems.map((sub: any) => ({
            id: sub.id || `${item.id}-${Math.random()}`,
            name: sub.name || item.name,
            customerPrice: applyMargin(Number(sub.price || item.price || 0)),
          }))
        : [{
            id: item.id,
            name: item.name,
            customerPrice: applyMargin(Number(item.price || 0)),
          }];

      return {
        id: item.id.toString(),
        mainTitle: item.name || serviceName,
        items
      };
    });
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

  const handleOrder = (groupId: string, variation: any) => {
    const targetId = targetIds[groupId];
    const price = Number(variation.customerPrice);

    if (!targetId || !targetId.trim()) {
      toast({
        title: "حقل مطلوب",
        description: "يرجى إدخال الآي دي أو الرقم.",
        variant: "destructive",
      });
      return;
    }

    if (userBalance < price) {
      toast({
        title: "رصيد غير كافٍ",
        description: "يرجى شحن محفظتك للمتابعة.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم استلام طلبك",
      description: `طلب ${variation.name} قيد المعالجة الآن.`,
    });
    setTargetIds(prev => ({ ...prev, [groupId]: "" }));
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
            <SheetDescription className="text-right text-xs">تحديث مباشر من الراغب (سعر +4%).</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground">جاري التحديث...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {groupedServices.length > 0 ? (
                <div className="grid gap-4">
                  {groupedServices.map((group) => {
                    const selectedId = selectedOptions[group.id];
                    const currentItem = group.items.find((i) => i.id.toString() === selectedId) || group.items[0];

                    return (
                      <Card key={group.id} className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><Zap className="h-5 w-5 text-primary" /></div>
                            <h4 className="font-bold text-foreground text-right flex-1">{group.mainTitle}</h4>
                          </div>

                          {group.items.length > 1 && (
                            <Select 
                              value={selectedId} 
                              onValueChange={(val) => setSelectedOptions(prev => ({ ...prev, [group.id]: val }))}
                            >
                              <SelectTrigger className="w-full text-right bg-muted/30 border-none h-11">
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                              <SelectContent dir="rtl">
                                {group.items.map((item) => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-muted-foreground pr-1 flex items-center gap-1">
                              <UserIcon className="h-3 w-3" /> الآي دي أو الرقم المطلوب
                            </label>
                            <Input 
                              placeholder="أدخل الـ ID هنا..." 
                              className="text-right h-11 bg-muted/30 border-none"
                              value={targetIds[group.id] || ""}
                              onChange={(e) => setTargetIds(prev => ({ ...prev, [group.id]: e.target.value }))}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-dashed">
                            <p className="text-primary font-bold text-xl">
                              {currentItem ? Number(currentItem.customerPrice).toLocaleString() : "0"} <span className="text-xs">{currency}</span>
                            </p>
                            <Button 
                              onClick={() => handleOrder(group.id, currentItem)}
                              className="rounded-full bg-primary font-bold px-6 shadow-lg active:scale-95"
                            >
                              <ShoppingCart className="ml-2 h-4 w-4" /> اطلب
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <PackageX className="h-10 w-10 opacity-30" />
                  <p className="text-sm font-bold">لا توجد منتجات متاحة لهذه الفئة.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
