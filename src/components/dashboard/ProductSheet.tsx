
"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, ExternalLink, RefreshCw } from "lucide-react";

type Product = {
  id: string | number;
  name: string;
  price: number;
  category?: string;
};

export function ProductSheet({ 
  children, 
  serviceName, 
  serviceId 
}: { 
  children: React.ReactNode; 
  serviceName: string;
  serviceId: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const [ordering, setOrdering] = useState<string | number | null>(null);
  const { userBalance, addBalance } = useUser();
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      // Fetching from our local API proxy to avoid CORS and secure the token
      const response = await fetch('/api/products');

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server responded with an error");
      }

      const data = await response.json();
      
      // Standardize data extraction (API might return { data: [...] } or root array)
      const allProducts = Array.isArray(data) ? data : (data.data || data.products || []);
      
      // Filter logic: Map serviceId to potential category keywords
      const filtered = allProducts.filter((p: any) => {
        const productCategory = String(p.category || '').toLowerCase();
        const productName = String(p.name || '').toLowerCase();
        const target = serviceId.toLowerCase();
        
        // Match if the category or name contains the service ID key
        // e.g. 'syriatel-units' -> matches 'syriatel'
        const baseKey = target.split('-')[0];
        
        return productCategory.includes(baseKey) || 
               productName.includes(baseKey) ||
               productCategory === target;
      });

      setProducts(filtered);
    } catch (error: any) {
      console.error("Client fetch error:", error);
      toast({
        title: "Sync Error",
        description: error.message || "Could not sync with digital provider.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [serviceId]);

  const handleOrder = (product: Product) => {
    if (userBalance < product.price) {
      toast({
        title: "Insufficient Balance",
        description: "Please top up your wallet to purchase this item.",
        variant: "destructive",
      });
      return;
    }
    
    setOrdering(product.id);
    
    // Simulate order placement
    setTimeout(() => {
      setOrdering(null);
      addBalance(-product.price);
      toast({
        title: "Success",
        description: `Purchased: ${product.name}`,
      });
    }, 1200);
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
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">
              {serviceName}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2">
              Syncing with Al-Ragheb API
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </SheetDescription>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {fetching ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Bypassing CORS & Connecting...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <PackageX className="h-8 w-8" />
              <p className="text-sm font-medium text-center">
                No items found for <br/>
                <span className="text-primary font-bold">"{serviceId}"</span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-sm leading-tight">{product.name}</p>
                    <p className="text-sm font-bold text-secondary">
                      {product.price.toLocaleString()} <span className="text-[10px] font-normal">SYP</span>
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOrder(product)}
                    disabled={ordering !== null}
                    className="h-9 px-4"
                  >
                    {ordering === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Order"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-muted/30 border-t flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Secure Backend Bridge
          </p>
          <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
            <ExternalLink className="h-3 w-3" />
            Verified Provider
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
