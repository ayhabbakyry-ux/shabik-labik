"use client";

import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
  const [amountError, setAmountError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { currency, userBalance, deductBalance } = useUser();

  const isShamCash = serviceName === "شام كاش" || filterValue === "Sham Cash";

  // حساب التكلفة الكلية لشام كاش (المبلغ * 1.02) بدقة عشرية كاملة وبدون أي تقريب
  const calculatedCost = useMemo(() => {
    if (!isShamCash || !dynamicAmount) return 0;
    const amount = Number(dynamicAmount);
    if (isNaN(amount)) return 0;
    return amount * 1.02;
  }, [isShamCash, dynamicAmount]);

  // تنسيق السعر بالأرقام الإنجليزية القياسية وعملة "ل.س" حصراً وبدون تقريب
  const formattedShamPrice = useMemo(() => {
    return `${calculatedCost.toFixed(1).replace('.0', '')} ل.س`;
  }, [calculatedCost]);

  // التحقق من صحة المبلغ لشام كاش
  useEffect(() => {
    if (isShamCash && dynamicAmount) {
      const val = Number(dynamicAmount);
      if (val < 100) setAmountError("يجب أن تكون الكمية 100 أو أكثر");
      else if (val > 50000) setAmountError("يجب أن تكون الكمية 50,000 أو أقل");
      else setAmountError(null);
    } else {
      setAmountError(null);
    }
  }, [dynamicAmount, isShamCash]);

  // منطق التحقق الصارم لتفعيل زر الإرسال بنسق اللون البنفسجي
  const isShamValid = useMemo(() => {
    return globalTargetId.trim() !== "" && 
           Number(dynamicAmount) >= 100 && 
           Number(dynamicAmount) <= 50000 && 
           !amountError;
  }, [globalTargetId, dynamicAmount, amountError]);

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
      } else {
        setErrorMsg("تعذر جلب البيانات من السيرفر.");
      }
    } catch (error: any) {
      setErrorMsg("خطأ في الاتصال بالسيرفر.");
    } finally {
      setFetching(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];
    const searchKey = filterValue.toLowerCase().trim();
    
    const isMobileCredit = searchKey.includes("mtn") || 
                           searchKey.includes("syriatel") || 
                           searchKey.includes("elux") ||
                           searchKey.includes("sham");

    return allProducts.filter(p => {
      const prodName = (p.name || "").toLowerCase();
      const catName = (p.category_name || "").toLowerCase();
      
      // استبعاد باقات "شامنا" فوراً وبشكل صارم
      if (prodName.includes("shamna") || prodName.includes("شامنا")) return false;

      const isSyriatelMatch = searchKey === "syriatel" && (prodName.includes("سيريتل") || catName.includes("سيريتل") || prodName.includes("syriatel"));
      const isMTNMatch = (searchKey === "mtn") && (prodName.includes("mtn") || prodName.includes("ام تي ان") || catName.includes("mtn"));
      const isShamMatch = (searchKey === "sham cash") && (prodName.includes("شام") || catName.includes("شام") || prodName.includes("sham"));
      
      if (isSyriatelMatch || isMTNMatch || isShamMatch) return true;

      if (searchKey === "tiktok") return prodName.includes("tiktok") || prodName.includes("تيك") || catName.includes("تيك");
      if (searchKey === "bigo") return prodName.includes("bigo") || prodName.includes("بيجو");
      if (searchKey === "jawaker") return prodName.includes("jawaker") || prodName.includes("جواكر");
      
      return prodName.includes(searchKey) || catName.includes(searchKey);
      
    }).map(p => {
      const price = Number(p.price);
      const prodName = (p.name || "").toLowerCase();
      
      let finalPrice = price;
      
      if (isMobileCredit && !isShamCash) {
        const unitsMatch = prodName.match(/\d+/);
        const units = unitsMatch ? parseInt(unitsMatch[0]) : 0;
        const markup = (units / 10) * 0.20;
        finalPrice = price + markup;
      } else if (!isShamCash) {
        finalPrice = price + 2;
      }

      return {
        ...p,
        customerPrice: finalPrice.toFixed(2)
      };
    });
  }, [allProducts, filterValue, isShamCash]);

  const shamCashBaseProduct = useMemo(() => {
    return filteredProducts.find(p => p.name.includes("شام") || p.name.toLowerCase().includes("sham"));
  }, [filteredProducts]);

  const handleOrder = async (product: any) => {
    if (!globalTargetId || !globalTargetId.trim()) {
      toast({ title: "حقل مطلوب", description: "يرجى إدخال رقم الحساب المستهدف أولاً.", variant: "destructive" });
      return;
    }

    let finalQty = 1;
    let finalPrice = Number(product.customerPrice);

    if (isShamCash) {
      if (!dynamicAmount || amountError) {
        toast({ title: "خطأ في المبلغ", description: amountError || "يرجى إدخال مبلغ صحيح لشام كاش.", variant: "destructive" });
        return;
      }
      finalQty = Number(dynamicAmount);
      finalPrice = calculatedCost; 
    }

    if (userBalance < finalPrice) {
      toast({ title: "رصيد غير كافٍ", description: "يرجى شحن محفظتك أولاً لإتمام العملية.", variant: "destructive" });
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
              qty: finalQty,
              order_uuid: crypto.randomUUID()
          })
      });

      const result = await response.json();

      if (result.success) {
          const isPending = result.status_type === 'pending';
          deductBalance(finalPrice, `${product.name} - الحساب: ${globalTargetId} (مبلغ: ${finalQty})`, isPending ? 'Pending' : 'Completed', result.order_id);
          toast({ title: isPending ? "الطلب قيد المعالجة" : "تمت العملية", description: result.message });
      } else {
          toast({ title: "فشل الطلب", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ", description: "تعذر الاتصال بسيرفر الشحن حالياً.", variant: "destructive" });
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
              <SheetDescription className="text-xs">
                {isShamCash ? "أدخل رقم الحساب والمبلغ المطلوب شحنه" : "أدخل المعرف (ID) ثم اختر الباقة"}
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className="space-y-3">
             <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 space-y-1.5">
                <label className="text-[10px] font-black text-primary pr-1 block">
                  رقم الحساب أو الموبايل
                </label>
                <div className="relative">
                   <User className="absolute right-3 top-3 h-4 w-4 text-primary opacity-50" />
                   <Input 
                     type="text"
                     placeholder="رقم الحساب المطلوب" 
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
                        placeholder="أدخل مابين 100 و 50000" 
                        className={cn(
                          "text-right h-12 bg-white border-none shadow-sm rounded-xl pr-10 focus:ring-emerald-500 text-lg font-black",
                          amountError && "ring-2 ring-red-500"
                        )} 
                        value={dynamicAmount} 
                        onChange={(e) => setDynamicAmount(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-emerald-100">
                     <span className="text-xs font-bold text-emerald-800">التكلفة الإجمالية:</span>
                     <span className="text-lg font-black text-emerald-600" dir="ltr">{formattedShamPrice}</span>
                  </div>

                  {amountError && (
                    <p className="text-[10px] text-red-600 font-bold pr-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {amountError}
                    </p>
                  )}

                  <div className="pt-2">
                    <Button 
                      onClick={() => handleOrder(shamCashBaseProduct)} 
                      disabled={!isShamValid || ordering === String(shamCashBaseProduct?.id) || !shamCashBaseProduct}
                      className={cn(
                        "w-full h-14 font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
                        isShamValid 
                          ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20" 
                          : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      )}
                    >
                      {ordering === String(shamCashBaseProduct?.id) ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال طلب الشحن"}
                    </Button>
                    <p className="text-center text-[10px] text-red-600 font-black mt-3 animate-pulse">
                      ⚠️ تنبيه: هذا المنتج يعمل بشكل يدوي.
                    </p>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/30">
          {!isShamCash && (
            fetching ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm font-bold text-muted-foreground">جاري سحب البيانات...</p>
              </div>
            ) : errorMsg ? (
              <div className="h-full p-6 flex flex-col items-center justify-center text-center gap-4">
                 <AlertCircle className="h-10 w-10 text-destructive" />
                 <p className="font-bold text-destructive text-sm leading-relaxed">{errorMsg}</p>
                 <Button onClick={fetchProducts} variant="outline" size="sm" className="rounded-xl font-bold">إعادة المحاولة</Button>
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
                            className="rounded-xl font-bold px-6 h-10 text-xs shadow-lg bg-primary shadow-primary/10"
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
                    <p className="text-sm font-bold">لا توجد باقات متاحة لهذا القسم حالياً.</p>
                  </div>
                )}
              </ScrollArea>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}