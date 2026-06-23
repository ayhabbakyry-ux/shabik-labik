
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

interface Product {
  id: string | number;
  name: string;
  price: string | number;
  parent_id: string | number;
  [key: string]: any;
}

interface GroupedService {
  baseName: string;
  items: Array<Product & { displayPrice: string; displayAmount: string }>;
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
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // 1. منطق التجميع الذكي (Smart Grouping) مثل تطبيق الراغب
  const groupedServices = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) {
      return [];
    }
    
    // الفلترة الأولية حسب القسم
    let baseFilter = allProducts.filter(item => Number(item.parent_id) === Number(activeCategoryId));

    // عزل الشبكات بشكل قطعي (Syriatel vs MTN)
    if (Number(activeCategoryId) === 6 && serviceName) {
      const title = serviceName.toLowerCase();
      if (title.includes("إم تي إن") || title.includes("mtn")) {
        baseFilter = baseFilter.filter(item => 
          item.name?.includes("إم تي إن") || item.name?.toUpperCase().includes("MTN")
        );
      } else if (title.includes("سيريتل") || title.includes("syriatel")) {
        baseFilter = baseFilter.filter(item => 
          item.name?.includes("سيريتل") || item.name?.toUpperCase().includes("SYRIATEL")
        );
      }
    }

    // تجهيز البيانات وحساب المربح واستخراج الرصيد
    const processedItems = baseFilter.map(item => {
      // تطبيق المربح المخفي 4%
      const basePrice = Number(item.price || 0);
      const finalPrice = (basePrice * 1.04).toFixed(2);
      
      // استخراج الرقم من الاسم بأمان (الرصيد الواصل)
      const match = item.name?.match(/[\d.]+/);
      const amount = item.amount || item.denomination || (match ? match[0] : "محدد");
      
      return {
        ...item,
        displayPrice: finalPrice,
        displayAmount: amount
      };
    });

    // التجميع بناءً على اسم الخدمة (بدون الأرقام)
    const groups: Record<string, GroupedService> = {};
    
    processedItems.forEach(item => {
      // استخراج الاسم الأساسي (مثلاً "إم تي إن وحدات") وحذف الأرقام والكميات من النهاية
      const baseName = item.name.replace(/[\d.]+.*$/, '').trim();
      
      if (!groups[baseName]) {
        groups[baseName] = { baseName, items: [] };
      }
      groups[baseName].items.push(item);
    });

    // ترتيب العناصر داخل كل مجموعة حسب الرصيد الواصل
    Object.values(groups).forEach(group => {
      group.items.sort((a, b) => Number(a.displayAmount) - Number(b.displayAmount));
    });

    return Object.values(groups);
  }, [allProducts, activeCategoryId, serviceName]);

  // تعيين أول فئة تلقائياً عند تحميل البيانات
  useEffect(() => {
    if (groupedServices.length > 0) {
      const initial: Record<string, string> = {};
      groupedServices.forEach(group => {
        if (group.items.length > 0) {
          initial[group.baseName] = String(group.items[0].id);
        }
      });
      setSelectedItemIds(initial);
    }
  }, [groupedServices]);

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    setFetching(true);
    try {
      const response = await fetch(`/api/products?categoryId=${activeCategoryId}`);
      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();
      const rawItems = Array.isArray(data) ? data : (data.data || data.products || []);
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

  const handleOrder = (product: any) => {
    toast({
      title: "تم استلام الطلب",
      description: `طلب ${product.name} بقيمة ${product.displayPrice} ل.س قيد المعالجة.`,
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
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col border-none bg-background">
        <div className="p-4 border-b bg-white">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-right text-primary">{serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-right text-xs">
              اختر الرصيد المطلوب من القائمة لتحديث السعر.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري مزامنة الأسعار المباشرة...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {Array.isArray(groupedServices) && groupedServices.length > 0 ? (
                <div className="grid gap-6" dir="rtl">
                  {groupedServices.map((group, gIdx) => {
                    const selectedId = selectedItemIds[group.baseName];
                    const selectedProduct = group.items.find(i => String(i.id) === selectedId) || group.items[0];

                    return (
                      <Card key={gIdx} className="border-none shadow-md bg-white overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-right flex-1">
                              <h4 className="font-bold text-lg text-foreground leading-tight">{group.baseName}</h4>
                              <p className="text-[12px] text-muted-foreground">متوفر {group.items.length} فئات شحن</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground pr-1">الرصيد الواصل / الكمية</label>
                            <Select 
                              value={selectedId || String(group.items[0]?.id)} 
                              onValueChange={(val) => setSelectedItemIds(prev => ({ ...prev, [group.baseName]: val }))}
                            >
                              <SelectTrigger className="w-full text-right bg-muted/30 border-none h-12 text-sm font-medium">
                                <SelectValue placeholder="اختر الفئة..." />
                              </SelectTrigger>
                              <SelectContent dir="rtl" className="font-body">
                                {group.items.map((item) => (
                                  <SelectItem key={item.id} value={String(item.id)}>
                                    الرصيد الواصل: {item.displayAmount}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground mb-1 font-bold">السعر النهائي للمستهلك</p>
                              <p className="text-primary font-bold text-2xl leading-none">
                                {selectedProduct?.displayPrice || "0.00"} <span className="text-xs opacity-70">ل.س</span>
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleOrder(selectedProduct)}
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
                  <p className="text-sm font-bold text-center">لا توجد خدمات متوفرة حالياً.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
