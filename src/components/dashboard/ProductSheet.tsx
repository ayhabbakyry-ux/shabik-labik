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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, ExternalLink, RefreshCw, Key } from "lucide-react";

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
  const [playerId, setPlayerId] = useState("");
  const { userBalance, addBalance } = useUser();
  const { toast } = useToast();

  /**
   * Exact API Mapping
   */
  const targetMap: Record<string, string> = useMemo(() => ({
    'syriatel-units': 'وحدات سيريتل',
    'mtn-units': 'وحدات الام تي ان',
    'line-recharge': 'قسم شحن الخطوط',
    'syriatel-cash': 'سيريتل كاش',
    'gaming': 'العاب'
  }), []);

  const fetchProducts = async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    try {
      const targetName = targetMap[serviceId];
      if (!targetName) throw new Error("Invalid service mapping");

      // 1. DYNAMIC DISCOVERY: Fetch root categories (0)
      const discoveryRes = await fetch(`/api/products?categoryId=0`);
      if (!discoveryRes.ok) throw new Error("Failed to reach discovery endpoint");
      
      const discoveryData = await discoveryRes.json();
      const allDiscoveryItems = Array.isArray(discoveryData) ? discoveryData : (discoveryData.data || []);

      // 2. RESOLVE ID: Match exact Arabic string from Part 4 docs
      const matchedCategory = allDiscoveryItems.find((item: any) => {
        const itemName = String(item.name || "").trim();
        return itemName === targetName;
      });

      if (!matchedCategory) throw new Error(`Category "${targetName}" not found on server`);

      const resolvedId = matchedCategory.id;
      
      // 3. TARGETED FETCH: GET /client/api/content/[resolvedId]
      const response = await fetch(`/api/products?categoryId=${resolvedId}`);
      if (!response.ok) throw new Error("Server responded with an error");

      const rawData = await response.json();
      // Documentation Part 2 says it returns products directly or in a 'data' key
      const allFetchedProducts = Array.isArray(rawData) ? rawData : (rawData.data || []);

      setProducts(allFetchedProducts);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to sync with Al-Ragheb.",
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

  const handleOrder = async (product: Product) => {
    if (userBalance < product.price) {
      toast({
        title: "Insufficient Balance",
        description: "Please top up your wallet to purchase this item.",
        variant: "destructive",
      });
      return;
    }

    if (!playerId && (serviceId === 'gaming' || serviceId.includes('units'))) {
      toast({
        title: "Player ID Required",
        description: "Please enter the account ID for this service.",
        variant: "destructive",
      });
      return;
    }
    
    setOrdering(product.id);
    
    try {
      // Part 2 & 3: Mandatory order_uuid (UUIDv4)
      const orderUuid = crypto.randomUUID();
      
      const res = await fetch(
        `/api/products?type=order&productId=${product.id}&playerId=${encodeURIComponent(playerId)}&orderUuid=${orderUuid}`
      );
      
      const result = await res.json();

      if (result.الحالة === "موافق") {
        addBalance(-product.price);
        toast({
          title: "Order Successful",
          description: `Order ID: ${result.بيانات?.order_id || 'Success'}`,
        });
        setPlayerId("");
      } else {
        throw new Error(result.error || result.الحالة || "Order failed");
      }
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOrdering(null);
    }
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
              Documentation-Verified Sync
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </SheetDescription>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {(serviceId === 'gaming' || serviceId.includes('units')) && (
            <div className="space-y-2 p-4 bg-accent rounded-xl">
              <Label htmlFor="playerId" className="text-xs font-bold uppercase">Account / Player ID</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="playerId" 
                  placeholder="Enter ID here..." 
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>
          )}

          {fetching ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching Category Content...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <PackageX className="h-8 w-8" />
              <p className="text-sm font-medium text-center">No active products in this category.</p>
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
            Idempotency Key Active
          </p>
          <div className="flex items-center gap-1 text-[9px] text-primary font-bold">
            <ExternalLink className="h-3 w-3" />
            V4 UUID Enforcement
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
