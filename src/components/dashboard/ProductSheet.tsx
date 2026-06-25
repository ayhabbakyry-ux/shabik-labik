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
import { Loader2, PackageX, RefreshCw, ShoppingCart, User as UserIcon, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/lib/store";
import { Input } from "@/components/ui/input";

interface ProductItem {
  id: string | number;
  name: string;
  price: string | number;
  category_name?: string;
  category_img?: string;
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
  const [targetIds, setTargetIds] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { currency, userBalance } = useUser();

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/products`, { cache: 'no-store' });
      const text = await response.text();
      
      if (!response.ok) {
        const errorData = text ? JSON.parse(text) : { error: `خطأ ${response.status}` };
        throw new Error(errorData.error || `خطأ ${response.status}`);
      }
      
      const data = JSON.parse(text);
      
      if (data && data.error) {
        throw new Error(data.error);
      }

      const products = Array.isArray(data) ? data : (data.data || data.products || []);
      setAllProducts(products);
    } catch (error: any) {
      setErrorMsg(error.message);
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

  const handleOrder = (product: any) => {
    const targetId = targetIds[product.id];
    const price = Number(product.customerPrice);

    if (!targetId || !targetId.trim()) {
      toast({ title: "حقل مطلوب", description: "يرجى إدخال الآي دي أو الرقم المطلوب.", variant: "destructive" });
      return;
    }

    if (userBalance < price) {
      toast({ title: "رصيد غير كافٍ", description: "رصيدك الحالي أقل من سعر المنتج، يرجى الشحن.", variant: "destructive" });
      return;
    }

    // محاكاة استجابة الطلب برموز أخطاء الراغب
    toast({ title: "تم إرسال الطلب", description: `طلب ${product.name} قيد المعالجة الآن.` });
    setTargetIds(prev => ({ ...prev, [product.id]: "" }));
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
            <SheetDescription className="text-right text-xs">مزامنة مباشرة مع سيرفر الراغب</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/30">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground">جاري تحديث القائمة...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-8 h-full flex flex-col items-center justify-center text-center gap-4">
               <div className="bg-destructive/10 p-4 rounded-full"><AlertCircle className="h-12 w-12 text-destructive" /></div>
               <div className="space-y-2">
                  <h3 className="font-bold text-lg text-destructive">تنبيه من النظام</h3>
                  <div className="text-sm font-medium bg-white p-4 rounded-xl border border-destructive/20 text-center shadow-sm">
                    {errorMsg}
                  </div>
               </div>
               <Button onClick={fetchProducts} variant="outline" className="mt-2">إعادة محاولة الاتصال</Button>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length > 0 ? (
                <div className="grid gap-4 pb-10">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          {product.category_img ? (
                            <img src={product.category_img} alt={product.name} className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 text-right">
                            <h4 className="font-bold text-foreground text-sm line-clamp-2">{product.name}</h4>
                            <p className="text-[10px] text-green-600 font-bold mt-1">متوفر</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-muted-foreground pr-1 flex items-center gap-1 justify-end">الآي دي أو رقم الهاتف <UserIcon className="h-3 w-3" /></label>
                          <Input placeholder="أدخل البيانات..." className="text-right h-11 bg-muted/50 border-none" value={targetIds[product.id] || ""} onChange={(e) => setTargetIds(prev => ({ ...prev, [product.id]: e.target.value }))} />
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-dashed border-muted">
                          <p className="text-primary font-black text-xl">{Number(product.customerPrice).toLocaleString()} <span className="text-[10px] font-medium">{currency}</span></p>
                          <Button onClick={() => handleOrder(product)} className="rounded-full bg-primary font-bold px-8 shadow-lg active:scale-95 transition-all">طلب الآن</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 bg-white/50 rounded-3xl mx-2 mt-4 border border-dashed border-muted-foreground/20">
                  <div className="bg-muted p-4 rounded-full"><PackageX className="h-10 w-10 opacity-30" /></div>
                  <p className="text-sm font-bold text-foreground">لا توجد منتجات في هذا القسم</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
