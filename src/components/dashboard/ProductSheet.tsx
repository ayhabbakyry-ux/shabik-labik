
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
import { Loader2, PackageX, RefreshCw, Key, Search, Database } from "lucide-react";

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
  const [debugInfo, setDebugInfo] = useState<{ 
    url: string; 
    status: number | null; 
    totalItems: number;
    sampleObject: any;
    availableKeys: string[];
  }>({ 
    url: "", 
    status: null, 
    totalItems: 0,
    sampleObject: null,
    availableKeys: []
  });
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    const targetUrl = `/api/products`; 
    
    try {
      const response = await fetch(targetUrl);
      const status = response.status;
      const data = await response.json();
      
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      
      // DISCOVERY: Get the first object and its keys
      const sample = rawItems.length > 0 ? rawItems[0] : null;
      const keys = sample ? Object.keys(sample) : [];

      console.log("[SERVER DATA SAMPLE]", sample);

      setDebugInfo({ 
        url: targetUrl, 
        status, 
        totalItems: rawItems.length,
        sampleObject: sample,
        availableKeys: keys
      });

      // ABORT FILTERING: Show the first 10 products globally to see what we're working with
      const mappedProducts = rawItems.slice(0, 10).map((item: any) => ({
        id: item.id || item.الرقم_التعريفي,
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
  }, [serviceId, toast]);

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
              Direct ID Mapping Discovery
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
              <p className="text-sm font-medium">Inspecting Raw Catalog...</p>
            </div>
          ) : (
            <>
              {/* RAW DATA DISCOVERY TRACE */}
              <div className="bg-slate-900 rounded-xl p-5 text-[11px] font-mono text-slate-300 space-y-4 border border-slate-700 shadow-2xl">
                <div className="flex items-center gap-2 text-pink-500 font-bold border-b border-slate-700 pb-2 uppercase tracking-widest">
                  <Database className="h-4 w-4" /> Raw Sample Discovery
                </div>
                
                <div className="space-y-2">
                  <span className="text-slate-500">AVAILABLE KEYS IN PRODUCT OBJECT:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {debugInfo.availableKeys.length > 0 ? (
                      debugInfo.availableKeys.map(key => (
                        <span key={key} className="px-1.5 py-0.5 bg-pink-900/30 text-pink-400 rounded border border-pink-800/50">
                          {key}
                        </span>
                      ))
                    ) : (
                      <span className="italic text-red-400">No keys found.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-500">SAMPLE OBJECT JSON:</span>
                  <pre className="bg-black/50 p-3 rounded text-[10px] overflow-x-auto text-blue-300 border border-slate-800">
                    {debugInfo.sampleObject 
                      ? JSON.stringify(debugInfo.sampleObject, null, 2) 
                      : "No object found to sample."}
                  </pre>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-8">
                  <div className="p-4 bg-muted rounded-full">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-medium text-center">Catalog is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Global Samples (No Filter)</Label>
                  {products.map((product, idx) => (
                    <div 
                      key={`${product.id}-${idx}`}
                      className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm leading-none">{product.name}</p>
                        <p className="text-sm font-bold text-secondary">
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
