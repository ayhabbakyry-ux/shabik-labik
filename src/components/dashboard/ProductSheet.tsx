
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

/**
 * PRODUCTION-GRADE PRODUCT SHEET (STABLE VERSION)
 * 1. Robust Filtering: parent_id + Brand Keyword Isolation.
 * 2. Hidden 4% Margin: Automated markup, original price purged.
 * 3. Dynamic Amount Extraction: Regex-based extraction for (الرصيد الواصل).
 * 4. Crash Prevention: Safety checks for regex and mapping.
 */
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
  
  const sectionTitle = serviceName;

  /**
   * ROBUST FILTERING & MAPPING LOGIC
   */
  const filteredProducts = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) return [];
    
    // 1. Get base products matching the current category
    let baseFilter = allProducts.filter(item => item && Number(item.parent_id) === Number(activeCategoryId));

    // 2. Strict Grouping & Isolation for Telecom (Parent ID 6)
    if (Number(activeCategoryId) === 6 && sectionTitle) {
      const title = sectionTitle.toLowerCase();
      if (title.includes("إم تي إن") || title.includes("mtn")) {
        baseFilter = baseFilter.filter(item => item.name && (item.name.includes("إم تي إن") || item.name.toUpperCase().includes("MTN")));
      } else if (title.includes("سيريتل") || title.includes("syriatel")) {
        baseFilter = baseFilter.filter(item => item.name && (item.name.includes("سيريتل") || item.name.toUpperCase().includes("SYRIATEL")));
      } else if (title.includes("زين") || title.includes("zain")) {
        baseFilter = baseFilter.filter(item => item.name && (item.name.toUpperCase().includes("ZAIN") || item.name.includes("زين")));
      }
    }
    
    // 3. Map over filtered results to inject 4% profit margin and extract exact dynamic amount
    return baseFilter.map(item => {
      // Hidden 4% Margin math
      const basePrice = Number(item.price || 0);
      const finalCustomerPrice = (basePrice * 1.04).toFixed(2);
      
      // Dynamic Regex to strip and extract only numbers/dots from item name for (الرصيد الواصل)
      const nameMatch = item.name ? item.name.match(/[\d.]+/) : null;
      const amountDelivered = item.amount || item.denomination || (nameMatch ? nameMatch[0] : "محدد");

      return {
        ...item,
        displayPrice: finalCustomerPrice, // Replaces original price completely
        displayAmount: amountDelivered     // Replaces dynamic amount text
      };
    });
  }, [allProducts, activeCategoryId, sectionTitle]);

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      const response = await fetch(`/api/products`);
      const data = await response.json();
      
      // Deep data pull logic: Check multiple possible response paths
      const rawItems = Array.isArray(data) 
        ? data 
        : (data.data || data.products || data.items || []);
        
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
      description: `تم إرسال طلب ${productName} للمعالجة.`,
    });
  };

  if (serviceId === 'admin') {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] sm:h-screen sm:max-w-full">
          <AdminPanel />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet onOpenChange={(open) => {
      if (open) {
        fetchProducts();
      } else {
        setAllProducts([]);
        setSelectedVariations({});
      }
    }}>
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
              جميع الأسعار تشمل رسوم الخدمة والضرائب.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري سحب كافة الفئات والأسعار...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <div className="p-4 bg-white rounded-full shadow-sm">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-center">لا توجد منتجات متاحة حالياً.</p>
                </div>
              ) : (
                <div className="grid gap-4" dir="rtl">
                  {filteredProducts.map((product) => {
                    // Safety check for nested variations
                    const variations = product.params || product.variations || product.amounts || product.items || [];
                    const selectedVarId = selectedVariations[product.id];
                    
                    const currentVariation = variations.find((v: any) => v && String(v.id) === selectedVarId);
                    const varPrice = Number(currentVariation?.price || 0);
                    const finalVarPrice = varPrice > 0 
                      ? (varPrice * 1.04).toFixed(2)
                      : null;

                    return (
                      <Card key={product.id} className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-right">
                              <h4 className="font-bold text-base text-foreground leading-tight">
                                {product.name}
                              </h4>
                              <p className="text-[11px] text-primary font-bold mt-1">
                                الرصيد الواصل: {product.displayAmount}
                              </p>
                            </div>
                          </div>

                          {variations.length > 0 && (
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block text-right">
                                اختر الفئة المطلوبة
                              </label>
                              <Select 
                                value={selectedVarId} 
                                onValueChange={(val) => setSelectedVariations(prev => ({ ...prev, [product.id]: val }))}
                              >
                                <SelectTrigger className="w-full text-right bg-muted/30 border-none h-12 focus:ring-0">
                                  <SelectValue placeholder="اختر القيمة..." />
                                </SelectTrigger>
                                <SelectContent className="font-body" dir="rtl">
                                  {variations.map((v: any) => {
                                    if (!v) return null;
                                    const markedUpPrice = (Number(v.price || 0) * 1.04).toFixed(2);
                                    return (
                                      <SelectItem key={v.id} value={String(v.id)}>
                                        الرصيد: {v.name || v.value} - السعر: {markedUpPrice} ل.س
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-dashed">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-1">السعر النهائي</p>
                              <p className="text-primary font-bold text-xl leading-none">
                                {finalVarPrice || product.displayPrice} <span className="text-xs opacity-70">ل.س</span>
                              </p>
                            </div>
                            <Button 
                              disabled={variations.length > 0 && !selectedVarId}
                              onClick={() => handleOrder(product.name, selectedVarId || "")}
                              className="rounded-full px-8 h-12 shadow-lg hover:scale-105 transition-transform bg-primary text-white font-bold"
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
