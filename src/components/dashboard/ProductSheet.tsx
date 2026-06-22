
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

  // Mapping slugs to the Arabic names found in the API for Discovery & Post-Filter
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

      // 1. DYNAMIC ID DISCOVERY: Fetch root (0) to find the correct numeric category ID
      const discoveryRes = await fetch(`/api/products?categoryId=0`);
      if (!discoveryRes.ok) throw new Error("Failed to reach discovery endpoint");
      
      const discoveryData = await discoveryRes.json();
      const allDiscoveryItems = Array.isArray(discoveryData) ? discoveryData : (discoveryData.data || []);

      // Search for the numeric ID by Arabic name matching
      const matchedCategory = allDiscoveryItems.find((item: any) => 
        String(item.name).includes(targetName) || 
        String(item.category_name).includes(targetName)
      );

      // 2. FETCH DATA: Use discovered ID or fallback to global list
      const fetchId = matchedCategory ? (matchedCategory.id || matchedCategory.category_id) : 0;
      const response = await fetch(`/api/products?categoryId=${fetchId}`);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server responded with an error");
      }

      const rawData = await response.json();
      const allFetchedProducts = Array.isArray(rawData) ? rawData : (rawData.data || []);

      // 3. STRICT FILTERING LOGIC: Ensure the list is cleaned before display
      // This prevents "dumping the full list" and respects the category logic
      const strictlyFiltered = allFetchedProducts.filter((product: Product) => {
        const pName = String(product.name).toLowerCase();
        const pCatName = String(product.category_name || "").toLowerCase();
        const searchKey = targetName.toLowerCase();

        // Special logic for "Line Recharge" section which should show all units
        if (serviceId === 'line-recharge') {
          return pName.includes('وحدات') || pCatName.includes('شحن');
        }

        // Standard strict filter for specific categories
        return pName.includes(searchKey) || pCatName.includes(searchKey);
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
              Strict Server Filtering (Live)
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
              <p className="text-sm font-medium">Applying strict filters...</p>
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
        
        <div className="p-6 bg-muted/30 border-t flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Filter: {serviceId}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
            <ExternalLink className="h-3 w-3" />
            Verified Dynamic Sync
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
