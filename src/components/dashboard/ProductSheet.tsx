
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
import { Loader2, PackageX, ExternalLink } from "lucide-react";

/**
 * PRODUCTION CONFIGURATION: Al-Ragheb API
 */
const AL_RAGHEB_API_URL = "https://api.alragheb-store.com/api/products"; 
const AL_RAGHEB_AUTH_TOKEN = "64659dc283eb8ee87192b012aaec33b07d56a00ddf18bdc0";

type Product = {
  id: string | number;
  name: string;
  price: number;
  category: string;
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

  useEffect(() => {
    // Skip fetching if this is the admin console toggle
    if (serviceId === 'admin') return;
    
    const fetchProducts = async () => {
      setFetching(true);
      try {
        const response = await fetch(AL_RAGHEB_API_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${AL_RAGHEB_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Al-Ragheb API typically returns products in a 'data' array or root array
        const allProducts = Array.isArray(data) ? data : (data.data || data.products || []);
        
        // Filter products that match the current category (serviceId)
        // We normalize both strings to ensure reliable matching
        const filtered = allProducts.filter((p: any) => {
          const productCategory = String(p.category || '').toLowerCase();
          const targetCategory = serviceId.toLowerCase();
          
          // Match by exact ID or if the category string contains our service name key
          return productCategory === targetCategory || 
                 productCategory.includes(targetCategory.split('-')[0]);
        });

        setProducts(filtered);
      } catch (error: any) {
        console.error("Failed to fetch from Al-Ragheb API:", error);
        toast({
          title: "Connection Error",
          description: "Could not reach Al-Ragheb server. Check your API configuration.",
          variant: "destructive",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchProducts();
  }, [serviceId, toast]);

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
    
    // Simulate order processing for the MVP
    setTimeout(() => {
      setOrdering(null);
      addBalance(-product.price);
      toast({
        title: "Order Placed Successfully",
        description: `Purchased: ${product.name} for ${product.price.toLocaleString()} SYP`,
      });
    }, 1500);
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
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {serviceName}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2">
              Syncing with Al-Ragheb Server 
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {fetching ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Connecting to provider...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <PackageX className="h-8 w-8" />
              <p className="text-sm font-medium text-center">
                No active items found for <br/>
                <span className="text-primary font-bold">"{serviceId}"</span>
              </p>
              <p className="text-[10px] text-muted-foreground">Verify category mapping in API</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-secondary">
                        {product.price.toLocaleString()} <span className="text-[10px] font-normal">SYP</span>
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOrder(product)}
                    disabled={ordering !== null}
                    className="h-9 px-4"
                  >
                    {ordering === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Order Now"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-muted/30 border-t flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Live API Bridge
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
