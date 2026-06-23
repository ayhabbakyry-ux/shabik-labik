
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, RefreshCw, Key, Globe } from "lucide-react";

type Product = {
  id: string | number;
  name: string;
  price: number;
};

export function ProductSheet({ 
  children, 
  serviceName, 
  serviceId,
  categoryId, 
}: { 
  children: React.ReactNode; 
  serviceName: string;
  serviceId?: string;
  categoryId: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [debugInfo, setDebugInfo] = useState<{ url: string; status: number | null }>({ url: "", status: null });
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    // Direct category request
    const targetUrl = `/api/products?categoryId=${categoryId}`;
    setDebugInfo({ url: targetUrl, status: null });

    console.log(`[NETWORK REQUEST] Fetching for category: ${categoryId} at ${targetUrl}`);

    try {
      const response = await fetch(targetUrl);
      const status = response.status;
      setDebugInfo({ url: targetUrl, status });
      
      const data = await response.json();
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      
      console.log(`[NETWORK RESPONSE] Status: ${status}, Raw Items Received: ${rawItems.length}`);

      // STRICT CLIENT-SIDE FILTERING
      // We filter based on the raw category_id field from the Al-Ragheb API response
      const filteredItems = rawItems.filter((item: any) => {
        const itemCatId = item.category_id || item.الفئة_id;
        const match = Number(itemCatId) === Number(categoryId);
        if (match) {
          console.log(`[FILTER MATCH] Product: ${item.الاسم || item.name}, ID: ${itemCatId} matches Target: ${categoryId}`);
        }
        return match;
      });

      console.log(`[FILTER RESULT] Displaying ${filteredItems.length} items for Category ${categoryId}`);

      const mappedProducts = filteredItems.map((item: any) => ({
        id: item.id,
        name: item.الاسم || item.name || "منتج غير معروف",
        price: Number(item.السعر || item.price || 0)
      }));

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error(`[NETWORK ERROR]`, error);
      setDebugInfo(prev => ({ ...prev, status: 500 }));
      toast({
        title: "Network Failure",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [categoryId, serviceId, toast]);

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
            <SheetTitle className="text-xl font-bold font-headline">{serviceName}</SheetTitle>
            <SheetDescription className="text-xs">
              Category ID: {categoryId}
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
              <p className="text-sm font-medium">Connecting to Al-Ragheb Server...</p>
            </div>
          ) : (
            <>
              {products.length > 0 && (
                <div className="space-y-3 p-5 bg-accent/30 rounded-2xl border border-accent">
                  <Label htmlFor="playerId" className="text-xs font-bold uppercase flex items-center gap-2 text-primary">
                    <Key className="h-3.5 w-3.5" /> رقم اللاعب / الهاتف
                  </Label>
                  <Input 
                    id="playerId" 
                    placeholder="أدخل المعرف الخاص بك هنا" 
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="bg-white h-11 border-none shadow-sm focus-visible:ring-primary rounded-xl"
                  />
                </div>
              )}

              {products.length === 0 ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                    <div className="p-4 bg-muted rounded-full">
                      <PackageX className="h-10 w-10 opacity-40" />
                    </div>
                    <p className="text-sm font-medium text-center px-6 leading-relaxed">
                      عذراً، لا توجد منتجات متاحة حالياً لهذا القسم.
                    </p>
                  </div>

                  {/* TRANSPARENT NETWORK TRACE */}
                  <div className="bg-slate-900 rounded-xl p-4 text-[10px] font-mono text-slate-300 space-y-2 border border-slate-700 mx-2">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold border-b border-slate-700 pb-2 mb-2 uppercase tracking-widest">
                      <Globe className="h-3 w-3" /> Network Trace
                    </div>
                    <div className="flex justify-between">
                      <span>HTTP STATUS:</span>
                      <span className={debugInfo.status === 200 ? "text-green-400" : "text-red-400"}>
                        {debugInfo.status || "WAITING"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span>REQUEST URL:</span>
                      <div className="bg-slate-800 p-2 rounded break-all text-blue-300">
                        {debugInfo.url}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">المنتجات المتوفرة</Label>
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm hover:border-primary/50 transition-all active:scale-[0.98]"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm leading-none">{product.name}</p>
                        <p className="text-sm font-bold text-secondary">
                          {product.price > 0 ? `${product.price.toLocaleString()} SYP` : "السعر حسب الكمية"}
                        </p>
                      </div>
                      <Button size="sm" className="h-9 px-5 text-xs font-bold rounded-lg shadow-sm">
                        طلب
                      </Button>
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
