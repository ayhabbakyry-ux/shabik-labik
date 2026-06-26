
"use client";

import React, { useMemo, useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PackageX, RefreshCw, ShoppingCart, User as UserIcon, AlertCircle, Clock } from "lucide-react";
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
  const [targetIds, setTargetIds] = useState<Record<string, string>>({});
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
        setErrorMsg(data.error || "فشل جلب المنتجات");
      }
    } catch (error: any) {
      setErrorMsg("خطأ في الاتصال بالسيرفر");
    } finally {
      setFetching(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];
    const searchKey = filterValue.toLowerCase();
    return allProducts.filter(p => {
      const prodName = (p.name || "").toLowerCase();
      const catName = (p.category_name || "").toLowerCase();
      return prodName.includes(searchKey) || catName.includes(searchKey);
    }).map(p => ({
      ...p,
      customerPrice: (Number(p.price) * 1.04).toFixed(0)
    }));
  }, [allProducts, filterValue]);

  const handleOrder = async (product: any) => {
    const targetId = targetIds[product.id];
    const price = Number(product.customerPrice);

    if (!targetId || !targetId.trim()) {
      toast({ title: "حقل مطلوب", description: "يرجى إدخال المعرف المطلوب.", variant: "destructive" });
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
              playerId: targetId,
              order_uuid: crypto.randomUUID()
          })
      });

      const result = await response.json();

      if (result.success) {
          const isPending = result.status_type === 'pending';
          
          // خصم الرصيد مع تحديد الحالة (مكتمل أو معلق) وحفظ رقم الطلب
          deductBalance(
            price, 
            `${product.name} - معرف اللاعب: ${targetId}`, 
            isPending ? 'Pending' : 'Completed',
            result.order_id
          );

          toast({ 
            title: isPending ? "الطلب قيد المعالجة" : "تمت العملية بنجاح", 
            description: result.message,
            className: isPending ? "bg-orange-500 text-white border-none" : "bg-green-600 text-white border-none"
          });
          
          setTargetIds(prev => ({ ...prev, [product.id]: "" }));
      } else {
          toast({ 
            title: "فشل تنفيذ الطلب", 
            description: result.message || "المزود رفض الطلب، لم يتم خصم أي رصيد.",
            variant: "destructive" 
          });
      }
    } catch (error) {
      toast({ title: "خطأ تقني", description: "تعذر الاتصال بسيرفر الشحن حالياً.", variant: "destructive" });
    } finally {
      setOrdering(null);
    }
  };

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchProducts(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none bg-background shadow-2xl" dir="rtl">
        <div className="p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-primary text-right w-full">{serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching} className="rounded-full">
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-right text-xs">عرض المنتجات الحية وأسعار الشحن التلقائي</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/30">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground">جاري تحديث الأسعار...</p>
            </div>
          ) : errorMsg ? (
            <div className="h-full p-6 flex flex-col items-center justify-center text-center gap-4">
               <div className="bg-destructive/10 p-4 rounded-full"><AlertCircle className="h-10 w-10 text-destructive" /></div>
               <p className="font-bold text-destructive">{errorMsg}</p>
               <Button onClick={fetchProducts} variant="outline" size="sm">إعادة المحاولة</Button>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length > 0 ? (
                <div className="grid gap-4 pb-10">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="border-none shadow-sm bg-white overflow-hidden group">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 text-right">
                            <h4 className="font-bold text-foreground text-sm line-clamp-2">{product.name}</h4>
                            <p className="text-[10px] text-green-600 font-bold mt-1">متوفر للشحن التلقائي</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-muted-foreground pr-1 flex items-center gap-1 justify-end">المعرف المطلوب (ID) <UserIcon className="h-3 w-3" /></label>
                          <Input 
                            placeholder="أدخل المعرف المطلوب..." 
                            className="text-right h-11 bg-muted/50 border-none" 
                            value={targetIds[product.id] || ""} 
                            onChange={(e) => setTargetIds(prev => ({ ...prev, [product.id]: e.target.value }))} 
                            disabled={ordering === String(product.id)}
                          />
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-dashed">
                          <p className="text-primary font-black text-xl">{Number(product.customerPrice).toLocaleString()} <span className="text-[10px] font-medium">{currency}</span></p>
                          <Button 
                            onClick={() => handleOrder(product)} 
                            disabled={ordering === String(product.id)}
                            className="rounded-full bg-primary font-bold px-8 shadow-lg active:scale-95 transition-all"
                          >
                            {ordering === String(product.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : "طلب الآن"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 bg-white/50 rounded-3xl mx-2 mt-4 border border-dashed">
                  <PackageX className="h-10 w-10 opacity-30" />
                  <p className="text-sm font-bold text-foreground">عذراً، لا توجد منتجات متاحة حالياً.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
