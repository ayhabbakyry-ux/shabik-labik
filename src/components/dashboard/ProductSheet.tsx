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
import { Loader2, PackageX, RefreshCw, ShoppingCart, AlertCircle, ArrowRight, User, Wallet } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [dynamicAmount, setDynamicAmount] = useState<string>("");

  const { toast } = useToast();
  const { userBalance, deductBalance, currency } = useUser();

  const isShamCash = serviceName === "شام كاش" || filterValue === "Sham Cash";
  
  const isTelecom = useMemo(() => {
    const filter = filterValue.toLowerCase();
    return filter.includes('mtn') || filter.includes('syriatel');
  }, [filterValue]);

  const calculateProductPrice = useCallback((product: ProductItem) => {
    const originalPrice = Number(product.price);
    if (isTelecom) {
      const matches = product.name.match(/\d+/);
      const nominalCredit = matches ? Number(matches[0]) : (originalPrice > 10 ? Math.round(originalPrice / 1.05) : originalPrice);
      const markup = nominalCredit * 0.02;
      return originalPrice + markup;
    }
    return originalPrice + 2;
  }, [isTelecom]);

  const isShamValid = useMemo(() => {
    const hasAccount = globalTargetId && globalTargetId.trim().length > 0;
    const amountNum = Number(dynamicAmount);
    return !!(hasAccount && !isNaN(amountNum) && amountNum >= 100 && amountNum <= 50000);
  }, [globalTargetId, dynamicAmount]);

  const formattedShamPrice = useMemo(() => {
    if (!isShamCash || !dynamicAmount) return `0.00 ${currency}`;
    const amount = Number(dynamicAmount);
    if (isNaN(amount)) return `0.00 ${currency}`;
    const cost = amount * 1.02;
    return cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${currency}`;
  }, [isShamCash, dynamicAmount, currency]);

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/products`, { cache: 'no-store' });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllProducts(data);
      } else if (data && data.error) {
        setErrorMsg(data.error);
      }
    } catch (error: any) {
      setErrorMsg("فشل الاتصال بمسار المنتجات.");
    } finally {
      setFetching(false);
    }
  }, []);

  const handleOrder = async (product: any) => {
    let finalPrice = 0;
    let serviceId = 0;
    let link = globalTargetId;
    let quantity = 1;

    if (isShamCash) {
      if (!isShamValid) return;
      const amt = Number(dynamicAmount);
      finalPrice = amt * 1.02;
      serviceId = 840; 
      quantity = amt;
    } else {
      if (!product) return;
      finalPrice = calculateProductPrice(product);
      serviceId = Number(product.id);
      link = globalTargetId;
    }

    if (userBalance < finalPrice) {
      toast({ title: "رصيد غير كافٍ", description: `تحتاج إلى ${finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ليرة.`, variant: "destructive" });
      return;
    }

    if (!link || link.trim().length === 0) {
      toast({ title: "بيانات ناقصة", description: "يرجى إدخل رقم الحساب أو الـ ID.", variant: "destructive" });
      return;
    }

    setOrdering(String(serviceId));
    try {
      const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service: serviceId, link: link, quantity: quantity })
      });
      const result = await response.json();
      if (result.success) {
          await deductBalance(finalPrice, `${serviceName} - ${!isShamCash ? product.name + ' - ' : ''}الحساب: ${link}`, 'Pending', result.order_id);
          toast({ title: "تم إرسال الطلب", description: "جاري المعالجة من قبل المزود." });
          if (isShamCash) { setGlobalTargetId(""); setDynamicAmount(""); }
      } else {
          toast({ title: "فشل الطلب", description: result.message || "رفض المزود تنفيذ العملية.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "خطأ اتصال", description: "تعذر الاتصال بسيرفر الشحن.", variant: "destructive" });
    } finally {
      setOrdering(null);
    }
  };

  const filteredProductsList = useMemo(() => {
    return allProducts.filter(p => {
        const searchKey = filterValue.toLowerCase().trim();
        const prodName = (p.name || "").toLowerCase();
        const catName = (p.category_name || "").toLowerCase();
        
        if (Number(p.price) < 2) return false;

        // منطق الفلترة الذكي لدعم كافة اللغات والألعاب
        if (searchKey === "clash") {
            return prodName.includes("clash") || prodName.includes("كلاش") || catName.includes("clash") || catName.includes("كلاش");
        }
        if (searchKey === "royale") {
            return prodName.includes("royale") || prodName.includes("رويال") || catName.includes("royale") || catName.includes("رويال");
        }
        if (searchKey === "syriatel") {
            return prodName.includes("سيريتل") || prodName.includes("syriatel") || catName.includes("سيريتل") || catName.includes("syriatel");
        }
        if (searchKey === "mtn") {
            return prodName.includes("mtn") || prodName.includes("ام تي ان") || catName.includes("mtn") || catName.includes("ام تي ان");
        }
        
        return prodName.includes(searchKey) || catName.includes(searchKey);
    });
  }, [allProducts, filterValue]);

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchProducts(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none bg-background shadow-2xl" dir="rtl">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
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
                  <SheetDescription className="text-xs">
                    {isShamCash ? "أدخل رقم الحساب والمبلغ المطلوب شحنه" : "أدخل المعرف (ID) ثم اختر الباقة"}
                  </SheetDescription>
                </div>
              </SheetHeader>

              <div className="space-y-3">
                 <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 space-y-1.5">
                    <label className="text-[10px] font-black text-primary pr-1 block">رقم الحساب أو الموبايل</label>
                    <div className="relative">
                       <User className="absolute right-3 top-3 h-4 w-4 text-primary opacity-50" />
                       <Input 
                         type="text"
                         placeholder="أدخل رقم الحساب أو الـ ID" 
                         className="text-right h-11 bg-white border-none shadow-sm rounded-xl pr-10 focus:ring-primary font-bold" 
                         value={globalTargetId} 
                         onChange={(e) => setGlobalTargetId(e.target.value)} 
                       />
                    </div>
                 </div>

                 {isShamCash && (
                   <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-3 animate-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-emerald-700 pr-1 block">المبلغ المطلوب شحنه</label>
                        <div className="relative">
                          <Wallet className="absolute right-3 top-3 h-4 w-4 text-emerald-600 opacity-50" />
                          <Input 
                            type="number"
                            placeholder="مابين 100 و 50000" 
                            className="text-right h-12 bg-white border-none shadow-sm rounded-xl pr-10 focus:ring-emerald-500 text-lg font-black"
                            value={dynamicAmount} 
                            onChange={(e) => setDynamicAmount(e.target.value)} 
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-emerald-100">
                         <span className="text-xs font-bold text-emerald-800">التكلفة الإجمالية:</span>
                         <span className="text-lg font-black text-emerald-600" dir="ltr">{formattedShamPrice}</span>
                      </div>
                      <Button onClick={() => handleOrder(null)} disabled={!isShamValid || ordering !== null} className="w-full h-14 font-black text-lg rounded-2xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-xl shadow-purple-200">
                        {ordering !== null ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال طلب الشحن"}
                      </Button>
                   </div>
                 )}
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-4">
              {!isShamCash && (
                fetching ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-sm font-bold text-muted-foreground">جاري جلب الفئات الحية...</p>
                  </div>
                ) : errorMsg ? (
                  <div className="p-6 flex flex-col items-center justify-center text-center gap-4">
                     <AlertCircle className="h-10 w-10 text-destructive" />
                     <p className="font-bold text-destructive text-sm">{errorMsg}</p>
                     <Button onClick={fetchProducts} variant="outline" size="sm" className="rounded-xl">إعادة المحاولة</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProductsList.length > 0 ? (
                      filteredProductsList.map((product) => {
                        const finalPrice = calculateProductPrice(product);
                        return (
                          <Card key={product.id} className="border-none shadow-sm bg-white group hover:shadow-md transition-all">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                  <ShoppingCart className="h-4 w-4" />
                                </div>
                                <div className="text-right">
                                  <h4 className="font-bold text-foreground text-[12px] leading-tight">{product.name}</h4>
                                  <p className="text-primary font-black text-sm mt-1">
                                    {finalPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                                    <span className="text-[9px] font-medium mr-1">{currency}</span>
                                  </p>
                                </div>
                              </div>
                              <Button 
                                onClick={() => handleOrder(product)} 
                                disabled={ordering === String(product.id)}
                                className="rounded-xl font-bold px-6 h-10 text-xs bg-primary"
                              >
                                {ordering === String(product.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : "شحن"}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                        <PackageX className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-bold">لا توجد باقات متاحة حالياً.</p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
