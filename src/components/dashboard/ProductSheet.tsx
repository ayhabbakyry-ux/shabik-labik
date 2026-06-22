
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
import { Badge } from "@/components/ui/badge";
import { Loader2, PackageX } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

/**
 * Simulated Al-Ragheb Central Database
 * In a real scenario, this would be an API endpoint that accepts a categoryId.
 */
const AL_RAGHEB_CENTRAL_DB: Product[] = [
  // Syriatel Units
  { id: "s1", name: "Syriatel 1000 Units", price: 2500, category: "syriatel-units" },
  { id: "s2", name: "Syriatel 5000 Units", price: 12000, category: "syriatel-units" },
  { id: "s3", name: "Syriatel 10000 Units", price: 23500, category: "syriatel-units" },
  // Syriatel Cash
  { id: "sc1", name: "SyrCash Transfer 10,000", price: 10500, category: "syriatel-cash" },
  { id: "sc2", name: "SyrCash Transfer 50,000", price: 52000, category: "syriatel-cash" },
  { id: "sc3", name: "SyrCash Transfer 100,000", price: 103000, category: "syriatel-cash" },
  // MTN Cash
  { id: "m1", name: "MTN Cash 10,000", price: 10500, category: "mtn-cash" },
  { id: "m2", name: "MTN Cash 50,000", price: 52000, category: "mtn-cash" },
  { id: "m3", name: "MTN Cash 100,000", price: 103000, category: "mtn-cash" },
  // Gaming
  { id: "g1", name: "PUBG Mobile 60 UC", price: 15000, category: "gaming" },
  { id: "g2", name: "PUBG Mobile 325 UC", price: 75000, category: "gaming" },
  { id: "g3", name: "Free Fire 100 Diamonds", price: 12000, category: "gaming" },
  { id: "g4", name: "PlayStation $10 Card", price: 185000, category: "gaming" },
  { id: "g5", name: "Roblox 800 Robux", price: 145000, category: "gaming" },
  // Al-Ragheb General / Others
  { id: "a1", name: "Telegram Premium (1 Month)", price: 45000, category: "alragheb" },
  { id: "a2", name: "TikTok 1000 Coins", price: 92000, category: "alragheb" },
  { id: "a3", name: "Google Play $5 Card", price: 115000, category: "alragheb" },
];

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
  const [ordering, setOrdering] = useState<string | null>(null);
  const { userBalance, addBalance } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (serviceId === 'admin') return;
    
    // Simulate Al-Ragheb API category-filtered fetch
    setFetching(true);
    const fetchProducts = async () => {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter the central database using serviceId as the Category Identifier
      const filtered = AL_RAGHEB_CENTRAL_DB.filter(p => p.category === serviceId);
      setProducts(filtered);
      setFetching(false);
    };

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
    // Simulate transaction delay
    setTimeout(() => {
      setOrdering(null);
      addBalance(-product.price);
      toast({
        title: "Order Placed Successfully",
        description: `Purchased: ${product.name} for ${product.price.toLocaleString()} SYP`,
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
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {serviceName}
            </SheetTitle>
            <SheetDescription>
              Real-time sync active. Filtering by Category ID: <span className="font-mono text-primary font-bold">{serviceId}</span>
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {fetching ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching available products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <PackageX className="h-8 w-8" />
              <p className="text-sm font-medium">No products found for this category.</p>
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
        
        <div className="p-6 bg-muted/30 border-t text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Al-Ragheb API Bridge Status: <span className="text-green-600">Connected</span>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
