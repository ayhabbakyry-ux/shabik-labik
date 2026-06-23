
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
import { Loader2, PackageX, RefreshCw, Key, Globe, Search } from "lucide-react";

type Product = {
  id: string | number;
  name: string;
  price: number;
  categoryId?: any;
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
  const [debugInfo, setDebugInfo] = useState<{ 
    url: string; 
    status: number | null; 
    totalItems: number;
    availableIds: string[];
  }>({ 
    url: "", 
    status: null, 
    totalItems: 0,
    availableIds: [] 
  });
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    // ABORT category-specific call, Fetch ALL products for discovery
    const targetUrl = `/api/products`; 
    setDebugInfo({ url: targetUrl, status: null, totalItems: 0, availableIds: [] });

    console.log(`[DISCOVERY] Fetching global product list from: ${targetUrl}`);

    try {
      const response = await fetch(targetUrl);
      const status = response.status;
      const data = await response.json();
      
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      console.log(`[GLOBAL FETCH] Received ${rawItems.length} total items.`);

      // Log unique IDs found in the global list for debugging
      const uniqueIds = Array.from(new Set(rawItems.map((item: any) => String(item.category_id || item.الفئة_id)))).filter(id => id !== "undefined");
      
      setDebugInfo({ 
        url: targetUrl, 
        status, 
        totalItems: rawItems.length,
        availableIds: uniqueIds as string[]
      });

      // STRICT CLIENT-SIDE FILTERING
      const filteredItems = rawItems.filter((item: any) => {
        const itemCatId = item.category_id || item.الفئة_id;
        const match = Number(itemCatId) === Number(categoryId);
        if (match) {
          console.log(`[MATCH FOUND] Product: ${item.الاسم || item.name}, ID: ${itemCatId}`);
        }
        return match;
      });

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
              Expected Category ID: {categoryId}
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
              <p className="text-sm font-medium">Scanning Global Catalog...</p>
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
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-8">
                    <div className="p-4 bg-muted rounded-full">
                      <PackageX className="h-10 w-10 opacity-40" />
                    </div>
                    <p className="text-sm font-medium text-center px-6 leading-relaxed">
                      عذراً، لا توجد منتجات متاحة لهذا القسم (ID: {categoryId}).
                    </p>
                  </div>

                  {/* DISCOVERY TRACE: HELPING THE USER FIND THE RIGHT ID */}
                  <div className="bg-slate-900 rounded-xl p-5 text-[11px] font-mono text-slate-300 space-y-4 border border-slate-700 shadow-2xl">
                    <div className="flex items-center gap-2 text-amber-500 font-bold border-b border-slate-700 pb-2 uppercase tracking-widest">
                      <Search className="h-4 w-4" /> Discovery Trace
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800 p-2 rounded">
                        <span className="text-slate-500 block">HTTP STATUS</span>
                        <span className={debugInfo.status === 200 ? "text-green-400" : "text-red-400"}>
                          {debugInfo.status || "WAITING"}
                        </span>
                      </div>
                      <div className="bg-slate-800 p-2 rounded">
                        <span className="text-slate-500 block">CATALOG SIZE</span>
                        <span className="text-blue-300">{debugInfo.totalItems} Items</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-slate-500">AVAILABLE CATEGORY IDs IN CATALOG:</span>
                      <div className="flex flex-wrap gap-2">
                        {debugInfo.availableIds.length > 0 ? (
                          debugInfo.availableIds.map(id => (
                            <span key={id} className="px-2 py-1 bg-blue-900/40 text-blue-300 rounded border border-blue-800/50">
                              {id}
                            </span>
                          ))
                        ) : (
                          <span className="italic opacity-50 text-red-400">No IDs found in response data.</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded text-[10px] leading-relaxed text-slate-400 border border-slate-700">
                      <p className="font-bold text-slate-300 mb-1">How to use this Trace:</p>
                      Check the IDs above. If you see products in another category, let me know the correct ID so I can update the mapping for <span className="text-white">"{serviceName}"</span>.
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
