
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
import { Loader2, PackageX, RefreshCw, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProductSheet({ 
  children, 
  serviceName, 
  serviceId,
}: { 
  children: React.ReactNode; 
  serviceName: string;
  serviceId?: string;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ url: "", status: 0 });
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    const targetUrl = `/api/products`; 
    setDebugInfo({ url: targetUrl, status: 0 });
    
    try {
      console.log(`[DEBUG] Fetching from: ${targetUrl}`);
      const response = await fetch(targetUrl);
      const data = await response.json();
      
      setDebugInfo(prev => ({ ...prev, status: response.status }));

      // Extract raw items from response
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      
      console.log(`[DEBUG] Total items received: ${rawItems.length}`);
      
      // NO FILTERING - Render EVERYTHING as requested for debugging
      setProducts(rawItems);
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
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col border-none">
        <div className="p-4 border-b bg-card">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-right">Debug View: {serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-[10px] font-mono break-all mt-2 text-left bg-muted p-2 rounded">
              URL: {debugInfo.url} | Status: {debugInfo.status} | Total: {products.length}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching global list...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 py-12">
                  <div className="p-4 bg-muted rounded-full">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-center">No items returned from server.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-100 border-yellow-300 border p-3 rounded text-[11px] mb-4">
                    <p className="font-bold flex items-center gap-1"><Info className="h-3 w-3" /> Showing ALL products (No Filter)</p>
                    <p>Find your item and check its metadata keys below.</p>
                  </div>
                  
                  {products.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl border bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-sm text-primary">{item.name || item.الاسم || 'No Name'}</p>
                        <p className="text-xs font-bold text-secondary">
                          {Number(item.price || item.السعر || 0).toLocaleString()} SYP
                        </p>
                      </div>
                      
                      <div className="bg-slate-900 text-[10px] text-green-400 font-mono p-2 rounded overflow-x-auto">
                        <p className="text-slate-500 mb-1 font-bold border-b border-slate-700 pb-1">RAW METADATA:</p>
                        {Object.entries(item).map(([key, value]) => (
                          <div key={key} className="flex gap-2 border-b border-slate-800/50 py-0.5 last:border-0">
                            <span className="text-slate-400 shrink-0">{key}:</span>
                            <span className="text-green-300 break-all">{JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
