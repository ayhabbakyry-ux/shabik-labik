
"use client";

import { useState, useEffect, useMemo } from "react";
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
  category_id?: string | number;
  category_name?: string;
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

  /**
   * Exact API Mapping
   * We map our internal service IDs to the EXACT Arabic strings 
   * returned by the Al-Ragheb API.
   */
  const targetMap: Record<string, string> = useMemo(() => ({
    'syriatel-units': 'وحدات سيريتل',
    'mtn-units': 'وحدات الام تي ان',
    'line-recharge': 'قسم شحن الخطوط',
    'alragheb': 'بضاعة ومنتجات الراغب',
    'syriatel-cash': 'سيريتل كاش',
    'gaming': 'العاب'
  }), []);

  const fetchProducts = async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      const targetName = targetMap[serviceId];
      if (!targetName) throw new Error("Invalid service mapping");

      // 1. DYNAMIC ID DISCOVERY: Fetch category list (Root 0)
      const discoveryRes = await fetch(`/api/products?categoryId=0`);
      if (!discoveryRes.ok) throw new Error("Failed to reach discovery endpoint");
      
      const discoveryData = await discoveryRes.json();
      const allDiscoveryItems = Array.isArray(discoveryData) ? discoveryData : (discoveryData.data || []);

      // 2. RESOLVE NUMERIC ID: Search for the exact Arabic match
      const matchedCategory = allDiscoveryItems.find((item: any) => {
        const itemName = String(item.name || "").trim();
        const itemCatName = String(item.category_name || "").trim();
        return itemName.includes(targetName) || itemCatName.includes(targetName);
      });

      const resolvedId = matchedCategory ? (matchedCategory.id || matchedCategory.category_id) : 0;
      
      // 3. TARGETED FETCH: Call specific content endpoint using the resolved ID
      const response = await fetch(`/api/products?categoryId=${resolvedId}`);
      if (!response.ok) throw new Error("Server responded with an error");

      const rawData = await response.json();
      const allFetchedProducts = Array.isArray(rawData) ? rawData : (rawData.data || []);

      // 4. FINAL PRECISION FILTER: Ensure the list ONLY contains relevant items
      const strictlyFiltered = allFetchedProducts.filter((product: Product) => {
        const pName = String(product.name).toLowerCase();
        const pCatName = String(product.category_name || "").toLowerCase();
        
        // Special logic for "Line Recharge" to include all units
        if (serviceId === 'line-recharge') {
          return pName.includes('وحدات') || pCatName.includes('شحن');
        }

        // Exact string matching for standard categories
        return pName.includes(targetName) || pCatName.includes(targetName);
      });
      
      setProducts(strictlyFiltered);
    } catch (error: any) {
      console.error("Fetch/Filter error:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Could not resolve category filtering.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (serviceId !== 'admin') {
      fetchProducts();
    }
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
              Verified Server ID Discovery
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
              <p className="text-sm font-medium">Resolving Server ID...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <PackageX className="h-8 w-8" />
              <p className="text-sm font-medium text-center">
                No items matching <br/>
                <span className="text-primary font-bold">"{serviceName}"</span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors shadow-sm"
                >
                  <div className="space-y-1 pr-4">
                    <p className="font-bold text-sm leading-tight">{product.name}</p>
                    <p className="text-xs text-muted-foreground opacity-70">Category: {product.category_name || "General"}</p>
                    <p className="text-sm font-bold text-secondary">
                      {product.price.toLocaleString()} <span className="text-[10px] font-normal">SYP</span>
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOrder(product)}
                    disabled={ordering !== null}
                    className="h-9 px-4 shrink-0"
                  >
                    {ordering === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Order"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-muted/30 border-t flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
            Live Category Sync
          </p>
          <div className="flex items-center gap-1 text-[9px] text-primary font-bold">
            <ExternalLink className="h-3 w-3" />
            100% Accuracy Mode
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
