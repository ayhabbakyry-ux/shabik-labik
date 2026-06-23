
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
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, RefreshCw, Key, AlertCircle } from "lucide-react";

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
  109: "Product Not Found (ID Mismatch)",
  110: "Product Unavailable",
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
  categoryId: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    console.log(`[DEBUG] Initializing fetch for: ${serviceName} (Hardcoded ID: ${categoryId})`);

    try {
      // TIER 1: Attempt Category-Specific Fetch
      const primaryUrl = `/api/products?categoryId=${categoryId}`;
      console.log(`[DEBUG] Attempting Tier 1: ${primaryUrl}`);
      
      const response = await fetch(primaryUrl);
      console.log(`[DEBUG] Response Status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.code && data.code !== 200) {
        console.warn(`[AL-RAGHEB] Error Code ${data.code}: ${AL_RAGHEB_ERRORS[data.code] || 'Unknown error'}`);
      }

      let rawItems = Array.isArray(data) ? data : (data.data || []);
      
      // TIER 2: Fallback to Global Fetch if Tier 1 is empty or failed
      if (rawItems.length === 0) {
        console.log(`[DEBUG] Tier 1 returned no items. Attempting Tier 2 (Global Fetch).`);
        const fallbackUrl = `/api/products`;
        const fbResponse = await fetch(fallbackUrl);
        const fbData = await fbResponse.json();
        rawItems = Array.isArray(fbData) ? fbData : (fbData.data || []);
      }

      console.log(`[DEBUG] Total raw items received for processing: ${rawItems.length}`);

      // TIER 3: ROBUST CLIENT-SIDE FILTERING
      const targetCatId = Number(categoryId);
      const filteredItems = rawItems.filter((item: any) => {
        // Handle various ID field names (Arabic and English)
        const rawItemCatId = item.category_id ?? item.الفئة_id ?? item.cat_id;
        const itemCatId = rawItemCatId !== undefined && rawItemCatId !== null ? Number(rawItemCatId) : null;
        
        const itemName = item.الاسم || item.name || "Unknown Product";
        
        console.log(`[FILTER DEBUG] Comparing: "${itemName}" | Item ID: ${itemCatId} (Type: ${typeof rawItemCatId}) vs Target: ${targetCatId}`);

        // Match 1: Numeric ID Comparison (Hardcoded Map)
        if (itemCatId !== null && itemCatId === targetCatId) return true;

        // Match 2: Localized Name Comparison (as fallback for inconsistently tagged items)
        const itemCatName = item.category_name || item.اسم_الفئة || "";
        const nameMatch = itemCatName.trim() === serviceName.trim() || itemCatName.includes(serviceName);
        
        if (nameMatch && itemCatName !== "") {
          console.log(`[FILTER MATCH] Found match via NAME: ${itemCatName} matches ${serviceName}`);
          return true;
        }

        return false;
      });

      console.log(`[DEBUG] Products after strict filtering: ${filteredItems.length}`);

      const mappedProducts = filteredItems.map((item: any) => ({
        id: item.id,
        name: item.الاسم || item.name || "منتج غير معروف",
        price: Number(item.السعر || item.price || 0)
      }));

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error(`[DEBUG] Fetch process failed:`, error);
      toast({
        title: "خطأ في الاتصال بالخادم",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [categoryId, serviceId, serviceName, toast]);

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
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none">
        <div className="p-6 border-b flex items-center justify-between bg-card">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold font-headline">{serviceName}</SheetTitle>
            <SheetDescription className="text-xs">
              خدمة رقمية موثوقة عبر الربط المباشر (ID: {categoryId})
            </SheetDescription>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {fetching ? (
            <div className="h-60 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">جاري فحص الخادم وتصفية النتائج...</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 p-5 bg-accent/30 rounded-2xl border border-accent">
                <Label htmlFor="playerId" className="text-xs font-bold uppercase flex items-center gap-2 text-primary">
                  <Key className="h-3.5 w-3.5" /> رقم اللاعب / الهاتف
                </Label>
                <Input 
                  id="playerId" 
                  placeholder="أدخل المعرف الخاص بك هنا" 
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="bg-white h-11 border-none shadow-sm focus-visible:ring-primary rounded-xl"
                />
              </div>

              {products.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-muted-foreground gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <PackageX className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="text-sm font-medium text-center px-6 leading-relaxed">
                    عذراً، لا توجد منتجات متاحة حالياً لهذا القسم.<br/>
                    <span className="text-[10px] opacity-70">يتم تحديث المخزون تلقائياً من Al-Ragheb</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground px-1">المنتجات المتوفرة</Label>
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm hover:border-primary/50 transition-all active:scale-[0.98]"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm leading-none">{product.name}</p>
                        <p className="text-sm font-bold text-secondary">
                          {product.price > 0 ? `${product.price.toLocaleString()} SYP` : "السعر حسب الكمية"}
                        </p>
                      </div>
                      <Button size="sm" className="h-9 px-5 text-xs font-bold rounded-lg shadow-sm">
                        طلب
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
