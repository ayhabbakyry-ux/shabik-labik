
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
  categoryId
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

  /**
   * STRICT FILTERING & ISOLATION LOGIC
   * 1. Filters by parent_id (provided as categoryId)
   * 2. For category 6 (Telecom), applies strict keyword matching for brand isolation
   */
  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    const activeParentId = Number(categoryId);
    let baseFilter = allProducts.filter(item => Number(item.parent_id) === activeParentId);

    // Deep isolation for shared Parent ID 6 (MTN/Syriatel)
    if (activeParentId === 6 && serviceName) {
      const title = serviceName.toLowerCase();
      const mtnKeywords = ["إم تي إن", "mtn"];
      const syrKeywords = ["سيريتل", "syr", "syriatel", "سيرياتيل", "ليرة"];

      if (mtnKeywords.some(k => title.includes(k))) {
        return baseFilter.filter(p => mtnKeywords.some(k => p.name.toLowerCase().includes(k)));
      } 
      if (syrKeywords.some(k => title.includes(k))) {
        return baseFilter.filter(p => syrKeywords.some(k => p.name.toLowerCase().includes(k)));
      }
    }

    return baseFilter;
  }, [allProducts, categoryId, serviceName]);

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      // Global fetch to ensure deep data sync
      const response = await fetch(`/api/products`);
      const data = await response.json();
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      setAllProducts(rawItems);
    } catch (error: any) {
      toast({
        title: "Error Syncing Data",
        description: "Could not retrieve the latest products from the server.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [serviceId, toast]);

  const handleOrder = (productName: string, variationId: string) => {
    toast({
      title: "Order Submitted",
      description: `Request for ${productName} sent for automatic processing.`,
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
              Select the required denomination/quantity from the list below.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Syncing official pricing & amounts...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <div className="p-4 bg-muted rounded-full">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-center">No available offers for {serviceName} at this time.</p>
                </div>
              ) : (
                <div className="grid gap-4" dir="rtl">
                  {filteredProducts.map((product, idx) => {
                    // DEEP SCAN for nested denominations/variations
                    const variations = product.params || product.variations || product.amounts || product.items || [];
                    const selectedVarId = selectedVariations[product.id];
                    
                    // Business Logic: 4% markup applied to the selected item
                    const currentVariation = variations.find((v: any) => String(v.id) === selectedVarId);
                    const finalDisplayPrice = currentVariation 
                      ? Math.ceil(Number(currentVariation.price) * 1.04) 
                      : null;

                    return (
                      <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-bold text-base text-foreground">
                              {product.name}
                            </h4>
                          </div>

                          {variations.length > 0 ? (
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block text-right">
                                الرصيد الواصل / الكمية
                              </label>
                              <Select 
                                value={selectedVarId} 
                                onValueChange={(val) => setSelectedVariations(prev => ({ ...prev, [product.id]: val }))}
                              >
                                <SelectTrigger className="w-full text-right bg-muted/30 border-none h-12">
                                  <SelectValue placeholder="اختر الفئة المطلوبة..." />
                                </SelectTrigger>
                                <SelectContent className="font-body" dir="rtl">
                                  {variations.map((v: any) => {
                                    // 4% Profit Margin applied to each list item
                                    const vPrice = Math.ceil(Number(v.price || 0) * 1.04);
                                    return (
                                      <SelectItem key={v.id} value={String(v.id)}>
                                        الرصيد الواصل: {v.name || v.value} - السعر: {vPrice.toLocaleString()} ل.س
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium text-center">
                              Price is determined upon ordering for this service.
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-dashed">
                            <div className="text-right">
                              {finalDisplayPrice && (
                                <p className="text-primary font-bold text-xl">
                                  {finalDisplayPrice.toLocaleString()} <span className="text-xs opacity-70">SYP</span>
                                </p>
                              )}
                            </div>
                            <Button 
                              disabled={variations.length > 0 && !selectedVarId}
                              onClick={() => handleOrder(product.name, selectedVarId)}
                              className="rounded-full px-8 shadow-lg hover:scale-105 transition-transform bg-primary text-white"
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
