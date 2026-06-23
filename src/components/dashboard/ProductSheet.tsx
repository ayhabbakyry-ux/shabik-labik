
"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, RefreshCw } from "lucide-react";

type Product = {
  id: string | number;
  name: string;
  price: number;
};

export function ProductSheet({ 
  children, 
  serviceName, 
  serviceId,
}: { 
  children: React.ReactNode; 
  serviceName: string;
  serviceId?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    // Fetch global product list as the primary source
    const targetUrl = `/api/products`; 
    
    try {
      const response = await fetch(targetUrl);
      const data = await response.json();
      
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      
      // FILTER BY CATEGORY NAME: Matches the service button name to the product's category_name
      // Checks for both standard and localized Arabic keys
      const filteredItems = rawItems.filter((item: any) => {
        const catName = item.category_name || item.اسم_الفئة || "";
        return catName.trim() === serviceName.trim();
      });

      const mappedProducts = filteredItems.map((item: any) => ({
        id: item.id || item.الرقم_التعريفي,
        name: item.الاسم || item.name || "منتج غير معروف",
        price: Number(item.السعر || item.price || 0)
      }));

      setProducts(mappedProducts);
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
      if (open) fetchProducts();
    }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none">
        <div className="p-6 border-b flex items-center justify-between bg-card">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold font-headline text-right">{serviceName}</SheetTitle>
            <SheetDescription className="text-xs text-right">
              المنتجات المتاحة لهذا القسم
            </SheetDescription>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {fetching ? (
            <div className="h-60 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري جلب القائمة...</p>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <div className="p-4 bg-muted rounded-full">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-center">عذراً، لا توجد منتجات متاحة حالياً لهذا القسم</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product, idx) => (
                    <div 
                      key={`${product.id}-${idx}`}
                      className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm hover:border-primary transition-colors cursor-pointer"
                    >
                      <div className="space-y-1 text-right w-full">
                        <p className="font-bold text-sm leading-none">{product.name}</p>
                        <p className="text-sm font-bold text-secondary mt-1">
                          {product.price.toLocaleString()} SYP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
