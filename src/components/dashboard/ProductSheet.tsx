
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
import { Loader2, PackageX, RefreshCw } from "lucide-react";
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
   * DOUBLE FILTERING STRATEGY
   * Stage 1: Filter by parent_id (Discovered category ID)
   * Stage 2: Keyword match for shared categories (e.g. Category 6 contains both MTN and Syriatel)
   */
  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    const targetId = Number(categoryId);
    
    // Step 1: Filter by the primary Parent ID
    let items = allProducts.filter((item: any) => {
      const itemParentId = Number(item.parent_id);
      return itemParentId === targetId;
    });

    // Step 2: Sub-filtering for shared categories (like Category 6: Line Shipping)
    if (targetId === 6) {
      const nameForCheck = serviceName.toLowerCase();
      console.log(`[SUB-FILTER] Refining Category 6 for keyword: ${serviceName}`);

      if (nameForCheck.includes("إم تي إن") || nameForCheck.includes("mtn")) {
        items = items.filter(p => 
          p.name.includes("إم تي إن") || 
          p.name.toLowerCase().includes("mtn")
        );
      } else if (nameForCheck.includes("سيريتل") || nameForCheck.includes("syr")) {
        items = items.filter(p => 
          p.name.includes("سيريتل") || 
          p.name.toLowerCase().includes("syr") ||
          p.name.includes("سيرياتيل")
        );
      } else if (nameForCheck.includes("asiacell")) {
        items = items.filter(p => p.name.toLowerCase().includes("asiacell"));
      } else if (nameForCheck.includes("elux")) {
        items = items.filter(p => p.name.toLowerCase().includes("elux"));
      }
    }

    // Step 3: Handle games sub-filtering if necessary
    if (targetId === 2) {
      const nameForCheck = serviceName.toLowerCase();
      if (nameForCheck.includes("ببجي") || nameForCheck.includes("pubg")) {
        items = items.filter(p => p.name.includes("ببجي") || p.name.toLowerCase().includes("pubg"));
      } else if (nameForCheck.includes("فري فاير") || nameForCheck.includes("free fire")) {
        items = items.filter(p => p.name.includes("فري فاير") || p.name.toLowerCase().includes("free fire"));
      }
    }

    console.log(`[FILTER RESULT] Displaying ${items.length} products for ${serviceName}`);
    return items;
  }, [allProducts, categoryId, serviceName]);

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      console.log(`[NETWORK] Fetching global product catalog for: ${serviceName}...`);
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
              المنتجات المتاحة حالياً لقسم: {serviceName}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري جلب وتحليل البيانات...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <div className="p-4 bg-muted rounded-full">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-center">عذراً، لا توجد منتجات متاحة حالياً لـ {serviceName}</p>
                  <p className="text-[10px] opacity-60">ID: {categoryId}</p>
                </div>
              ) : (
                <div className="grid gap-3" dir="rtl">
                  {filteredProducts.map((item, idx) => (
                    <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {item.name || 'منتج غير مسمى'}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">
                            {item.id} | {item.parent_id}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-secondary font-bold">
                            {Number(item.price || 0).toLocaleString()} SYP
                          </p>
                          <Button size="sm" className="h-7 text-[10px] px-4 mt-1 rounded-full">
                            طلب الآن
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
