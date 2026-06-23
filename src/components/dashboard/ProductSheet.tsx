
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
  const [products, setProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      // Fetch global list to filter by parent_id locally
      // This is the most reliable way since the server-side filter is inconsistent
      const response = await fetch(`/api/products`);
      const data = await response.json();
      
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      
      // STRICT FILTERING: Use parent_id as the primary identifier
      // We convert both to Number to avoid type-mismatch errors
      const filtered = rawItems.filter((item: any) => {
        const itemParentId = Number(item.parent_id);
        const targetCategoryId = Number(categoryId);
        return itemParentId === targetCategoryId;
      });
      
      console.log(`[FILTER] Section: ${serviceName}, Target parent_id: ${categoryId}, Found: ${filtered.length}`);
      setProducts(filtered);
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
  }, [categoryId, serviceId, serviceName, toast]);

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
              المنتجات المتاحة حالياً لهذا القسم
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">جاري جلب المنتجات...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <div className="p-4 bg-muted rounded-full">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-center">عذراً، لا توجد منتجات متاحة حالياً لهذا القسم</p>
                </div>
              ) : (
                <div className="grid gap-3" dir="rtl">
                  {products.map((item, idx) => (
                    <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {item.name || 'منتج غير مسمى'}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">
                            ID: {item.id}
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
