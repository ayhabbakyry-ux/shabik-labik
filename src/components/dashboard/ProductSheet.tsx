"use client";

import { useState, useCallback, useMemo } from "react";
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
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // 1. منطق الفلترة والعزل وحساب المربح 4%
  const filteredProducts = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) return [];
    
    // الفلترة الأساسية حسب الـ categoryId
    let baseFilter = allProducts.filter(item => item && Number(item.parent_id) === Number(activeCategoryId));

    // العزل القطعي لشبكات الاتصال (سيريتل، MTN، زين) إذا كان الـ ID هو 6
    if (Number(activeCategoryId) === 6 && serviceName) {
      const title = serviceName.toLowerCase();
      if (title.includes("إم تي إن") || title.includes("mtn")) {
        baseFilter = baseFilter.filter(item => 
          item?.name && (item.name.includes("إم تي إن") || item.name.toUpperCase().includes("MTN"))
        );
      } else if (title.includes("سيريتل") || title.includes("syriatel")) {
        baseFilter = baseFilter.filter(item => 
          item?.name && (item.name.includes("سيريتل") || item.name.toUpperCase().includes("SYRIATEL"))
        );
      } else if (title.includes("زين") || title.includes("zain")) {
        baseFilter = baseFilter.filter(item => 
          item?.name && (item.name.toUpperCase().includes("ZAIN") || item.name.includes("زين"))
        );
      }
    }
    
    // معالجة البيانات: حساب المربح 4% واستخراج الرصيد الواصل بأمان (Regex)
    return baseFilter.map(item => {
      // حساب المربح المخفي 4%
      const basePrice = Number(item.price || 0);
      const finalCustomerPrice = (basePrice * 1.04).toFixed(2);
      
      // استخراج الرقم من الاسم بأمان (Regex) لمنع الكراش
      const nameMatch = item.name?.match(/[\d.]+/);
      const amountDelivered = item.amount || item.denomination || (nameMatch ? nameMatch[0] : "محدد");

      return {
        ...item,
        displayPrice: finalCustomerPrice,
        displayAmount: amountDelivered
      };
    });
  }, [allProducts, activeCategoryId, serviceName]);

  // 2. جلب المنتجات من السيرفر
  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      const response = await fetch(`/api/products`);
      const data = await response.json();
      const rawItems = Array.isArray(data) ? data : (data.data || data.products || []);
      setAllProducts(Array.isArray(rawItems) ? rawItems : []);
    } catch (error: any) {
      toast({
        title: "فشل المزامنة",
        description: "تعذر استرداد قائمة المنتجات من السيرفر.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [serviceId, toast]);

  const handleOrder = (productName: string, variationId: string) => {
    toast({
      title: "تم استلام الطلب",
      description: `تم إرسال طلب ${productName} للمعالجة بنجاح.`,
    });
  };

  // عرض لوحة التحكم للأدمن
  if (serviceId === 'admin') {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] sm:h-screen sm:max-w-full overflow-y-auto">
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
              الأسعار نهائية وشاملة لكافة الضرائب والرسوم.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري تحديث الأسعار المباشرة...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <PackageX className="h-10 w-10 opacity-40" />
                  <p className="text-sm font-bold text-center">لا توجد منتجات متوفرة حالياً لهذه الفئة.</p>
                </div>
              ) : (
                <div className="grid gap-4" dir="rtl">
                  {filteredProducts.map((product, pIdx) => {
                    const variations = product.params || product.variations || product.amounts || product.items || [];
                    const selectedVarId = selectedVariations[product.id];
                    const currentVariation = variations.find((v: any) => v && String(v.id) === selectedVarId);
                    
                    // حساب السعر النهائي للمنتج أو الخيار المحدد مع مربح 4%
                    const displayPrice = currentVariation 
                      ? (Number(currentVariation.price || 0) * 1.04).toFixed(2)
                      : product.displayPrice;

                    return (
                      <Card key={product.id || `prod-${pIdx}`} className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-right">
                              <h4 className="font-bold text-base text-foreground leading-tight">{product.name}</h4>
                              <p className="text-[11px] text-primary font-bold mt-1">
                                الرصيد الواصل: {product.displayAmount}
                              </p>
                            </div>
                          </div>

                          {variations.length > 0 && (
                            <div className="space-y-3">
                              <Select 
                                value={selectedVarId} 
                                onValueChange={(val) => setSelectedVariations(prev => ({ ...prev, [product.id]: val }))}
                              >
                                <SelectTrigger className="w-full text-right bg-muted/30 border-none h-12 focus:ring-0">
                                  <SelectValue placeholder="اختر القيمة المطلوبة..." />
                                </SelectTrigger>
                                <SelectContent className="font-body" dir="rtl">
                                  {variations.map((v: any, vIdx: number) => {
                                    if (!v) return null;
                                    const markedUp = (Number(v.price || 0) * 1.04).toFixed(2);
                                    const vMatch = v.name?.match(/[\d.]+/);
                                    const vAmount = v.amount || v.value || (vMatch ? vMatch[0] : v.name || "محدد");
                                    return (
                                      <SelectItem key={`${product.id}-v-${v.id || vIdx}`} value={String(v.id)}>
                                        الرصيد الواصل: {vAmount} - السعر: {markedUp} ل.س
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-1">السعر للمستهلك</p>
                              <p className="text-primary font-bold text-xl leading-none">
                                {displayPrice} <span className="text-xs opacity-70">ل.س</span>
                              </p>
                            </div>
                            <Button 
                              disabled={variations.length > 0 && !selectedVarId}
                              onClick={() => handleOrder(product.name, selectedVarId || "")}
                              className="rounded-full px-8 h-12 bg-primary text-white font-bold"
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
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}