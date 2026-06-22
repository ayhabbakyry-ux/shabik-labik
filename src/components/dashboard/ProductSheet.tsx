
"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Loader2, PackageX, RefreshCw, Key, AlertCircle, Terminal } from "lucide-react";

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
  categoryId, // New: Direct ID support
}: { 
  children: React.ReactNode; 
  serviceName: string;
  serviceId?: string;
  categoryId?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const [ordering, setOrdering] = useState<string | number | null>(null);
  const [playerId, setPlayerId] = useState("");
  const { userBalance, addBalance } = useUser();
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    console.log(`%c [DEBUG] Fetch triggered for: ${serviceName}`, 'background: #222; color: #bada55; font-size: 14px');

    try {
      // DEBUG: ALWAYS LOG ALL CATEGORIES TO CONSOLE
      const rootRes = await fetch('/api/products?categoryId=0');
      const rootData = await rootRes.json();
      console.log("%c [SERVER CATEGORY LIST] 👇", 'color: #ff00ff; font-weight: bold; font-size: 16px');
      console.table(Array.isArray(rootData) ? rootData : rootData.data || []);

      if (!categoryId) {
        console.warn(`[DEBUG] No categoryId provided for "${serviceName}". Please check the table above and provide the ID in ServiceGrid.tsx.`);
        setProducts([]);
        setFetching(false);
        return;
      }

      console.log(`[DEBUG] Fetching products for confirmed ID: ${categoryId}`);
      const contentRes = await fetch(`/api/products?categoryId=${categoryId}`);
      const contentData = await contentRes.json();

      if (contentData.status === "error" || contentData.code) {
        throw new Error(AL_RAGHEB_ERRORS[contentData.code] || "Server Error");
      }

      const rawItems = Array.isArray(contentData) ? contentData : (contentData.data || []);
      const mappedProducts = rawItems.map((item: any) => ({
        id: item.id,
        name: item.الاسم || item.name,
        price: Number(item.السعر || item.price || 0)
      }));

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error("[DEBUG] Fetch failed:", error);
      toast({
        title: "Fetch Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [serviceName, serviceId, categoryId, toast]);

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
            <SheetDescription className="flex items-center gap-2">
              {categoryId ? `Using Fixed ID: #${categoryId}` : "Awaiting ID Mapping..."}
              <span className={`inline-flex h-2 w-2 rounded-full ${categoryId ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
            </SheetDescription>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!categoryId && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3 text-yellow-800 text-sm">
              <Terminal className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Developer Note:</p>
                <p>Check the browser console to see the list of IDs from the server. Once you have the ID for this service, map it in ServiceGrid.tsx.</p>
              </div>
            </div>
          )}

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
              <p className="text-sm font-medium animate-pulse">Syncing with Al-Ragheb...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <PackageX className="h-8 w-8 opacity-20" />
              <p className="text-sm font-medium text-center">
                {categoryId ? "No products found for this ID." : "Waiting for ID assignment."}
              </p>
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
                    <p className="text-sm font-bold text-secondary">{product.price.toLocaleString()} SYP</p>
                  </div>
                  <Button size="sm" className="h-9 px-6">Order</Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-muted/30 border-t flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
            DIRECT_ID_MAPPING_ENABLED
          </p>
          <div className="flex items-center gap-2 text-[9px] text-primary font-bold">
            <AlertCircle className="h-3 w-3" />
            V5 Protocol
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
