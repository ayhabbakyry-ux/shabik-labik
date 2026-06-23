
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, RefreshCw, Zap, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Variation {
  id: string | number;
  name: string;
  price: string | number;
  amount?: string | number;
  [key: string]: any;
}

interface Product {
  id: string | number;
  name: string;
  price: string | number;
  parent_id: string | number;
  options?: Variation[];
  variants?: Variation[];
  product_options?: Variation[];
  [key: string]: any;
}

export function ProductSheet({ 
  children, 
  serviceName, 
  serviceId,
  categoryId: activeCategoryId 
}: { 
  children: React.ReactNode; 
  serviceName: string; 
  serviceId?: string;
  categoryId?: number;
}) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // 1. Fetching logic with Debug Log to inspect nested data
  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    setFetching(true);
    try {
      const response = await fetch(`/api/products?categoryId=${activeCategoryId}`);
      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();
      
      const rawItems = Array.isArray(data) ? data : (data.data || data.products || []);
      
      // DEBUG LOG: Inspect raw item structure for nested variations
      if (rawItems.length > 0) {
        console.log("[DEBUG] Raw Server Data Item:", JSON.stringify(rawItems[0], null, 2));
      }

      setAllProducts(Array.isArray(rawItems) ? rawItems : []);
    } catch (error: any) {
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر تحديث البيانات من السيرفر.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [activeCategoryId, serviceId, toast]);

  // 2. Production-Grade Filtering & Nested Mapping Logic
  const groupedServices = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    // Filter by category parent_id
    let filtered = allProducts.filter(p => Number(p.parent_id) === Number(activeCategoryId));

    // Brand Isolation for Telecom (ID 6)
    if (Number(activeCategoryId) === 6 && serviceName) {
      const title = serviceName.toLowerCase();
      if (title.includes("إم تي إن") || title.includes("mtn")) {
        filtered = filtered.filter(p => p.name?.includes("إم تي إن") || p.name?.toUpperCase().includes("MTN"));
      } else if (title.includes("سيريتل") || title.includes("syriatel")) {
        filtered = filtered.filter(p => p.name?.includes("سيريتل") || p.name?.toUpperCase().includes("SYRIATEL"));
      }
    }

    // Process nested variations and apply business rules
    return filtered.map(product => {
      // Look for nested variations in potential server property names
      const nestedRaw = product.options || product.variants || product.product_options || [];
      
      const variations = nestedRaw.length > 0 
        ? nestedRaw.map((v: any, index: number) => {
            const vMatch = v.name?.match(/[\d.]+/);
            const markedUp = (Number(v.price || 0) * 1.04).toFixed(2);
            return {
              id: v.id ? String(v.id) : `${product.id}-v-${index}`,
              name: v.name,
              displayPrice: markedUp,
              displayAmount: v.amount || v.value || (vMatch ? vMatch[0] : "محدد")
            };
          })
        : [{
            id: String(product.id),
            name: product.name,
            displayPrice: (Number(product.price || 0) * 1.04).toFixed(2),
            displayAmount: product.name?.match(/[\d.]+/)?.[0] || product.amount || "محدد"
          }];

      // Header clean-up (Removes numbers from the main product title)
      const cleanTitle = product.name?.split(/[\d.]+/)[0].trim() || serviceName;

      return {
        id: String(product.id),
        title: cleanTitle,
        variations
      };
    });
  }, [allProducts, activeCategoryId, serviceName]);

  // Sync initial selections
  useEffect(() => {
    if (groupedServices.length > 0) {
      const defaults: Record<string, string> = {};
      groupedServices.forEach(group => {
        if (group.variations.length > 0) {
          defaults[group.id] = String(group.variations[0].id);
        }
      });
      setSelectedIds(defaults);
    }
  }, [groupedServices]);

  const handleOrder = (variation: any) => {
    toast({
      title: "تم استلام الطلب",
      description: `طلب شحن بقيمة ${variation.displayPrice} ل.س قيد المعالجة.`,
    });
  };

  if (serviceId === 'admin') {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <AdminPanel />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchProducts(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none bg-background">
        <div className="p-4 border-b bg-white">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-right text-primary">{serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-right text-xs">
              اختر الفئة المطلوبة من القائمة وسيظهر لك السعر النهائي المشمول بالمربح.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري مزامنة الأسعار من الراغب...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {groupedServices.length > 0 ? (
                <div className="grid gap-6" dir="rtl">
                  {groupedServices.map((group) => {
                    const selectedId = selectedIds[group.id];
                    const currentVariation = group.variations.find(v => String(v.id) === selectedId) || group.variations[0];

                    return (
                      <Card key={group.id} className="border-none shadow-md bg-white overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-right flex-1">
                              <h4 className="font-bold text-lg text-foreground leading-tight">{group.title}</h4>
                              <p className="text-[11px] text-muted-foreground">متوفر {group.variations.length} فئات شحن مختلفة</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground pr-1">الرصيد الواصل / الكمية</label>
                            <Select 
                              value={selectedId || String(group.variations[0]?.id)} 
                              onValueChange={(val) => setSelectedIds(prev => ({ ...prev, [group.id]: val }))}
                            >
                              <SelectTrigger className="w-full text-right bg-muted/30 border-none h-12 text-sm font-medium">
                                <SelectValue placeholder="اختر الفئة..." />
                              </SelectTrigger>
                              <SelectContent dir="rtl">
                                {group.variations.map((v) => (
                                  <SelectItem key={v.id} value={String(v.id)}>
                                    الرصيد الواصل: {v.displayAmount}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground mb-1 font-bold">السعر النهائي (شامل المربح)</p>
                              <p className="text-primary font-bold text-2xl leading-none">
                                {currentVariation?.displayPrice || "0.00"} <span className="text-xs opacity-70">ل.س</span>
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleOrder(currentVariation)}
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
                  <p className="text-sm font-bold text-center">لا توجد منتجات متاحة لهذا القسم حالياً.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
