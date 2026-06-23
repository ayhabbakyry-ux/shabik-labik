
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
import { Loader2, PackageX, RefreshCw, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProductSheet({ 
  children, 
  serviceName, 
  serviceId,
  categoryId
}: { 
  children: React.ReactNode; 
  serviceName: string; 
  serviceId?: string;
  categoryId?: number;
}) {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  /**
   * REFACTORED DOUBLE-FILTERING STRATEGY
   * 1. Filter by parent_id (Global grouping)
   * 2. Filter by keyword for shared parent IDs (e.g. Category 6 contains multiple companies)
   */
  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    const activeCategoryId = Number(categoryId);
    
    // Stage 1: Base Filter by Parent ID
    let baseFilter = allProducts.filter(item => Number(item.parent_id) === activeCategoryId);

    // Stage 2: Broad Keyword Grouping for shared categories (primarily Parent 6)
    if (activeCategoryId === 6 && serviceName) {
      const title = serviceName.toLowerCase();
      console.log(`[FILTER DEBUG] Refining Category 6 for keyword: ${serviceName}`);

      if (title.includes("إم تي إن") || title.includes("mtn")) {
        return baseFilter.filter(p => 
          p.name.includes("إم تي إن") || 
          p.name.toLowerCase().includes("mtn")
        );
      } 
      if (title.includes("سيريتل") || title.includes("syr") || title.includes("syriatel")) {
        return baseFilter.filter(p => 
          p.name.includes("سيريتل") || 
          p.name.toLowerCase().includes("syr") ||
          p.name.includes("سيرياتيل")
        );
      }
      if (title.includes("asiacell")) {
        return baseFilter.filter(p => p.name.toLowerCase().includes("asiacell"));
      }
      if (title.includes("elux")) {
        return baseFilter.filter(p => p.name.toLowerCase().includes("elux"));
      }
    }

    // Secondary: Handle games sub-filtering (Parent 2)
    if (activeCategoryId === 2 && serviceName) {
      const title = serviceName.toLowerCase();
      if (title.includes("ببجي") || title.includes("pubg")) {
        return baseFilter.filter(p => p.name.includes("ببجي") || p.name.toLowerCase().includes("pubg"));
      }
      if (title.includes("فري فاير") || title.includes("free fire")) {
        return baseFilter.filter(p => p.name.includes("فري فاير") || p.name.toLowerCase().includes("free fire"));
      }
    }

    return baseFilter;
  }, [allProducts, categoryId, serviceName]);

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      console.log(`[NETWORK] Fetching global catalog for: ${serviceName}...`);
      const response = await fetch(`/api/products`);
      const data = await response.json();
      
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      setAllProducts(rawItems);
    } catch (error: any) {
      console.error(`[FETCH ERROR]`, error);
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر جلب البيانات من الخادم.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [serviceId, serviceName, toast]);

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
      }
    }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col border-none">
        <div className="p-4 border-b bg-card">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-right">{serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-right text-xs">
              قائمة العروض المتاحة لخدمة {serviceName}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري جلب العروض وتطبيق الهامش الربحي...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <div className="p-4 bg-muted rounded-full">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-center">عذراً، لا توجد عروض متاحة حالياً لـ {serviceName}</p>
                </div>
              ) : (
                <div className="grid gap-3" dir="rtl">
                  {filteredProducts.map((item, idx) => {
                    // APPLY 4% MARGIN CALCULATION
                    const basePrice = Number(item.price || 0);
                    const finalPrice = Math.ceil(basePrice * 1.04);
                    
                    return (
                      <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                {item.name || 'منتج غير مسمى'}
                              </p>
                            </div>
                            <p className="text-[9px] text-muted-foreground uppercase font-mono">
                              REF: {item.id}
                            </p>
                          </div>
                          <div className="text-left min-w-[100px]">
                            <p className="text-secondary font-bold text-lg leading-none">
                              {finalPrice.toLocaleString()} <span className="text-[10px] opacity-70">SYP</span>
                            </p>
                            <Button size="sm" className="h-7 text-[10px] px-6 mt-2 rounded-full font-bold shadow-sm">
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
