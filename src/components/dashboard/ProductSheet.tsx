
"use client";

import { useState } from "react";
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

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

const mockProducts: Product[] = [
  { id: "1", name: "PUBG Mobile 60 UC", price: 15000, category: "Gaming" },
  { id: "2", name: "PUBG Mobile 325 UC", price: 75000, category: "Gaming" },
  { id: "3", name: "Free Fire 100 Diamonds", price: 12000, category: "Gaming" },
  { id: "4", name: "Telegram Premium 1 Month", price: 45000, category: "Chat" },
  { id: "5", name: "Syr 5000 Units", price: 6500, category: "Telecom" },
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
  const [loading, setLoading] = useState(false);
  const { userBalance, addBalance } = useUser();
  const { toast } = useToast();

  const handleOrder = (product: Product) => {
    if (userBalance < product.price) {
      toast({
        title: "Insufficient Balance",
        description: "Please top up your wallet to purchase this item.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate transaction processing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
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
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
        <div className="p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">{serviceName}</SheetTitle>
            <SheetDescription>
              Real-time product sync active. Prices are updated via Al-Ragheb bridge.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {mockProducts.map((product) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-bold text-sm">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight">
                      {product.category}
                    </Badge>
                    <span className="text-sm font-semibold text-secondary">
                      {product.price.toLocaleString()} SYP
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleOrder(product)}
                  disabled={loading}
                >
                  Order
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
