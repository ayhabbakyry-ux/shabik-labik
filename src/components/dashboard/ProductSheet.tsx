
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, RefreshCw, Key, AlertCircle } from "lucide-react";

type Product = {
  id: string | number;
  name: string;
  price: number;
};

const AL_RAGHEB_ERRORS: Record<number | string, string> = {
  120: "API Token Required (رمز API مطلوب)",
  121: "Token Error (خطأ في الرمز المميز)",
  122: "API Access Denied (غير مسموح باستخدام API)",
  123: "IP Not Allowed (عنوان IP غير مسموح)",
  130: "Under Maintenance (الموقع قيد الصيانة)",
  100: "Insufficient Balance (رصيد غير كاف)",
  105: "Qty Not Available (الكمية غير متوفرة)",
  106: "Qty Not Allowed (الكمية غير مسموح بها)",
  107: "Player ID Blocked (تم حظر معرف اللاعب)",
  108: "Two-Step Verification Required (مطلوب التحقق بخطوتين)",
  109: "Product Not Found (المنتج غير موجود)",
  110: "Product Unavailable (المنتج غير متوفر حالياً)",
  111: "Try again in 1 minute (حاول بعد دقيقة)",
  112: "Qty too small (الكمية صغيرة جداً)",
  113: "Qty too large (الكمية كبيرة جداً)",
  114: "Unknown Error (خطأ غير معروف)",
  500: "System Error (خطأ في النظام)",
};

export function ProductSheet({ 
  children, 
  serviceName, 
  serviceId,
  apiCategoryId
}: { 
  children: React.ReactNode; 
  serviceName: string;
  serviceId?: string;
  apiCategoryId?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const [ordering, setOrdering] = useState<string | number | null>(null);
  const [playerId, setPlayerId] = useState("");
  const { userBalance, addBalance } = useUser();
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (serviceId === 'admin' || !apiCategoryId) return;
    
    setFetching(true);
    try {
      // Direct ID-based fetch, no more name-string discovery
      const response = await fetch(`/api/products?categoryId=${apiCategoryId}`);
      const rawData = await response.json();

      if (rawData.status === "error" || rawData.code) {
        const msg = AL_RAGHEB_ERRORS[rawData.code] || "Server Communication Error";
        throw new Error(msg);
      }

      const allFetchedProducts = Array.isArray(rawData) ? rawData : (rawData.data || []);
      setProducts(allFetchedProducts);
    } catch (error: any) {
      console.error("Product fetch error:", error);
      toast({
        title: "Category Error",
        description: error.message,
        variant: "destructive",
      });
      setProducts([]); 
    } finally {
      setFetching(false);
    }
  };

  const handleOrder = async (product: Product) => {
    if (userBalance < product.price) {
      toast({
        title: "Balance Error",
        description: AL_RAGHEB_ERRORS[100],
        variant: "destructive",
      });
      return;
    }

    if (!playerId) {
      toast({
        title: "Input Required",
        description: "Please enter the target ID or Phone Number.",
        variant: "destructive",
      });
      return;
    }
    
    setOrdering(product.id);
    
    try {
      const orderUuid = crypto.randomUUID();
      const res = await fetch(
        `/api/products?type=order&productId=${product.id}&playerId=${encodeURIComponent(playerId)}&orderUuid=${orderUuid}`
      );
      
      const result = await res.json();

      if (result.الحالة === "موافق" || result.status === "success") {
        addBalance(-product.price);
        toast({
          title: "Order Success",
          description: `Order ID: ${result.بيانات?.order_id || result.order_id}`,
        });
        setPlayerId("");
      } else {
        const errorCode = result.code || result.الحالة;
        const mappedError = AL_RAGHEB_ERRORS[errorCode] || result.error || "Transaction Declined";
        throw new Error(mappedError);
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
    <Sheet onOpenChange={(open) => {
      if (open && apiCategoryId && products.length === 0) {
        fetchProducts();
      }
    }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <div className="p-6 border-b flex items-center justify-between bg-card">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">
              {serviceName}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2">
              Sync: ID #{apiCategoryId}
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </SheetDescription>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2 p-4 bg-accent/50 rounded-xl border border-accent">
            <Label htmlFor="playerId" className="text-xs font-bold uppercase flex items-center gap-2">
              <Key className="h-3 w-3" /> Account ID / Phone
            </Label>
            <Input 
              id="playerId" 
              placeholder="e.g. 09xxxxxxxx" 
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="bg-white"
            />
          </div>

          {fetching ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">Fetching from Al-Ragheb API...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <PackageX className="h-8 w-8 opacity-20" />
              <p className="text-sm font-medium text-center">No products found for this category.</p>
              <Button variant="link" size="sm" onClick={fetchProducts}>Retry Fetch</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/10 transition-colors shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-sm leading-tight">{product.name}</p>
                    <p className="text-sm font-bold text-secondary">
                      {product.price.toLocaleString()} SYP
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOrder(product)}
                    disabled={ordering !== null}
                    className="h-9 px-6"
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
            Idempotency: order_uuid v4
          </p>
          <div className="flex items-center gap-2 text-[9px] text-primary font-bold">
            <AlertCircle className="h-3 w-3" />
            Code 109 Resolved (Dynamic)
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
