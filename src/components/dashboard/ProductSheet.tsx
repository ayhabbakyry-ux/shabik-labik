
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
import { useUser } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, RefreshCw, Key, Terminal, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Product = {
  id: string | number;
  name: string;
  price: number;
};

const AL_RAGHEB_ERRORS: Record<number | string, string> = {
  120: "API Token Required",
  121: "Token Error",
  122: "API Access Denied",
  123: "IP Not Allowed",
  130: "Under Maintenance",
  100: "Insufficient Balance",
  105: "Qty Not Available",
  106: "Qty Not Allowed",
  107: "Player ID Blocked",
  108: "Two-Step Verification Required",
  109: "Product Not Found (ID Mismatch)",
  110: "Product Unavailable",
  111: "Try again in 1 minute",
  500: "System Error",
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
  categoryId?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [rawJson, setRawJson] = useState("");
  const { userBalance } = useUser();
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin' || !categoryId) return;
    
    setFetching(true);
    setRawJson("Fetching category ID: " + categoryId + "...");

    try {
      const endpoint = `/api/products?categoryId=${categoryId}`;
      console.log(`[STRICT ID FETCH] Requesting: ${endpoint}`);
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setRawJson(JSON.stringify(data, null, 2));

      if (data.status === "error" || data.code) {
        throw new Error(AL_RAGHEB_ERRORS[data.code] || `Server Error ${data.code}`);
      }

      // Handle both direct array or wrapped data object
      const rawItems = Array.isArray(data) ? data : (data.data || []);
      
      // If the response contains sub-categories (has id but no price), 
      // the items are treated as products for selection
      const mappedProducts = rawItems.map((item: any) => ({
        id: item.id,
        name: item.الاسم || item.name || "Unknown Item",
        price: Number(item.السعر || item.price || 0)
      }));

      setProducts(mappedProducts);
    } catch (error: any) {
      toast({
        title: "Fetch Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [categoryId, serviceId, toast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawJson);
    toast({ title: "Copied!", description: "Raw JSON copied." });
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
      if (open) fetchProducts();
    }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <div className="p-6 border-b flex items-center justify-between bg-card">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">{serviceName}</SheetTitle>
            <SheetDescription>
              Direct ID: #{categoryId}
            </SheetDescription>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Debug Dump for Mobile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                <Terminal className="h-3 w-3" /> Raw JSON Response
              </Label>
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={copyToClipboard}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>
            <Textarea 
              readOnly 
              value={rawJson} 
              className="font-mono text-[10px] h-32 bg-black text-green-500 border-none leading-tight"
            />
          </div>

          {fetching ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs animate-pulse">Requesting from Al-Ragheb Server...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 p-4 bg-accent/30 rounded-xl border">
                <Label htmlFor="playerId" className="text-xs font-bold uppercase flex items-center gap-2">
                  <Key className="h-3 w-3" /> Player ID / Phone
                </Label>
                <Input 
                  id="playerId" 
                  placeholder="Enter ID" 
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="bg-white h-9"
                />
              </div>

              {products.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <PackageX className="h-10 w-10 opacity-20" />
                  <p className="text-xs font-medium text-center">
                    No items found for Category ID #{categoryId}.<br/>
                    Check if this is a root category containing sub-items.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card shadow-sm hover:border-primary transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs">{product.name}</p>
                        <p className="text-xs font-bold text-secondary">
                          {product.price > 0 ? `${product.price.toLocaleString()} SYP` : "Select Options"}
                        </p>
                      </div>
                      <Button size="sm" className="h-8 px-4 text-xs">
                        {product.price > 0 ? "Order" : "Open"}
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
