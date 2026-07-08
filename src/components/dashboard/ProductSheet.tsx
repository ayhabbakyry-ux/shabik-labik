
"use client";

import React, { useMemo, useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PackageX, RefreshCw, ShoppingCart, AlertCircle, ArrowRight, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/lib/store";
import { Input } from "@/components/ui/input";

interface ProductItem {
  id: string | number;
  name: string;
  price: string | number;
  category_name?: string;
  category_id?: string | number;
  image?: string;
}

export function ProductSheet({ 
  children, 
  serviceName, 
  filterValue 
}: { 
  children: React.ReactNode; 
  serviceName: string; 
  filterValue: string; 
}) {
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<string | null>(null);
  const [globalTargetId, setGlobalTargetId] = useState("");
  const { toast } = useToast();
  const { currency, userBalance, deductBalance } = useUser();

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/products`, { cache: 'no-store' });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllProducts(data);
      } else {
        setErrorMsg("تعذر جلب البيانات.");
      }
    } catch (error: any) {
      setErrorMsg("خطأ في الاتصال.");
    } finally {
      setFetching(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];
    const searchKey = filterValue.toLowerCase().trim();
    
    const isMobileCredit = searchKey.includes("mtn") || 
                           searchKey.includes("syriatel") || 
                           searchKey.includes("elux");

    return allProducts.filter(p => {
      const prodName = (p.name || "").toLowerCase();
      const catName = (p.category_name || "").toLowerCase();
      
      if (searchKey === "tiktok") {
        return prodName.includes("tiktok") || prodName.includes("تيك") || catName.includes("تيك");
      }
      if (searchKey === "bigo") {
        return prodName.includes("bigo") || prodName.includes("بيجو");
      }
      if (searchKey === "jawaker") {
        return prodName.includes("jawaker") || prodName.includes("جواكر");
      }
      
      return prodName.includes(searchKey) || catName.includes(searchKey);
      
    }).map(p => {
      const price = Number(p.price);
      const prodName = (p.name || "").toLowerCase();
      
      let finalPrice = price;
      
      if (isMobileCredit) {
        // حسبة ذكية: لكل 10 وحدات 0.20 ليرة زيادة تلقائية
        const unitsMatch = prodName.match(/\d+/);
        const units = unitsMatch ? parseInt(unitsMatch[0]) : 0;
        const markup = (units / 10) * 0.20;
        finalPrice = price + markup;
      } else {
        // الألعاب والتطبيقات: زيادة 2 ليرة ثابتة
        finalPrice = price + 2;
      }

      return {
        ...p,
        customerPrice: finalPrice.toFixed(2)
      };
    });
  }, [allProducts, filterValue]);

  const handleOrder = async (product: any) => {
    const price = Number(product.customerPrice);

    if (!globalTargetId || !globalTargetId.trim()) {
      toast({ title: "حقل مطلوب", description: "يرجى إدخال المعرف (ID) في الأعلى أولاً.", variant: "destructive" });
      return;
    }

    if (userBalance < price) {
      toast({ title: "رصيد غير كافٍ", description: "يرجى شحن محفظتك أولاً.", variant: "destructive" });
      return;
    }

    setOrdering(String(product.id));
    
    try {
      const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              product_id: product.id,
              playerId: globalTargetId,
              order_uuid: crypto.randomUUID()
          })
      });

      const result = await response.json();

      if (result.success) {
          const isPending = result.status_type === 'pending';
          // يتم خصم المبلغ المسجل في customerPrice تماماً
          deductBalance(price, `${product.name} - ID: ${globalTargetId}`, isPending ? 'Pending' : 'Completed', result.order_id);
          toast({ title: isPending ? "الطلب قيد المعالجة" : "تمت العملية", description: result.message });
      } else {
          toast({ title: "فشل الطلب", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ", description: "تعذر الاتصال بالسيرفر.", variant: "destructive" });
    } finally {
      setOrdering(null);
    }
  };

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchProducts(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none bg-background shadow-2xl" dir="rtl">
        <div className="p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 space-y-4">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary font-bold">
                  <ArrowRight className="h-4 w-4" /> <span>رجوع</span>
                </Button>
              </SheetClose>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching} className="rounded-full">
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="text-right">
              <SheetTitle className="text-xl font-bold font-headline text-primary">{serviceName}</SheetTitle>
              <SheetDescription className="text-xs">أدخل المعرف (ID) ثم اختر الباقة المطلوبة</SheetDescription>
            </div>
          </SheetHeader>

          <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 space-y-1.5">
             <label className="text-[10px] font-black text-primary pr-1 block">المعرف المطلوب (Player ID / Number)</label>
             <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-primary opacity-50" />
                <Input 
                  placeholder="أدخل الـ ID هنا لمرة واحدة" 
                  className="text-right h-11 bg-white border-none shadow-sm rounded-xl pr-10 focus:ring-primary" 
                  value={globalTargetId} 
                  onChange={(e) => setGlobalTargetId(e.target.value)} 
                />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/30">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground">جاري سحب الباقات...</p>
            </div>
          ) : errorMsg ? (
            <div className="h-full p-6 flex flex-col items-center justify-center text-center gap-4">
               <AlertCircle className="h-10 w-10 text-destructive" />
               <p className="font-bold text-destructive">{errorMsg}</p>
               <Button onClick={fetchProducts} variant="outline" size="sm">إعادة المحاولة</Button>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length > 0 ? (
                <div className="grid gap-3 pb-24">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-bold text-foreground text-[13px] leading-tight">{product.name}</h4>
                            <p className="text-primary font-black text-sm mt-1">{Number(product.customerPrice).toLocaleString()} <span className="text-[9px] font-medium">{currency}</span></p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleOrder(product)} 
                          disabled={ordering === String(product.id)}
                          className="rounded-xl bg-primary font-bold px-6 h-10 text-xs shadow-lg shadow-primary/10"
                        >
                          {ordering === String(product.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : "شحن"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                  <PackageX className="h-10 w-10 opacity-30" />
                  <p className="text-sm font-bold">لا توجد باقات حالياً.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
