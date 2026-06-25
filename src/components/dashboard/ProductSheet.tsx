
"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { Loader2, PackageX, RefreshCw, ShoppingCart, Zap, User as UserIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/lib/store";
import { Input } from "@/components/ui/input";

interface ProductItem {
  id: string | number;
  name: string;
  price: string | number;
  category_name?: string;
  parent_id?: string | number;
  category_img?: string;
}

export function ProductSheet({ 
  children, 
  serviceName, 
  filterValue 
}: { 
  children: React.ReactNode; 
  serviceName: string; 
  filterValue: string; // اسم القسم للفلترة
}) {
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [targetIds, setTargetIds] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { currency, userBalance } = useUser();

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    try {
      const response = await fetch(`/api/products`);
      const data = await response.json();
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "خطأ في الاتصال",
        description: "فشل جلب المنتجات من متجر الراغب.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [toast]);

  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];
    
    // الفلترة بناءً على اسم القسم القادم من الراغب
    return allProducts.filter(p => 
      p.category_name?.toLowerCase().includes(filterValue.toLowerCase()) ||
      p.name?.toLowerCase().includes(filterValue.toLowerCase())
    ).map(p => ({
      ...p,
      customerPrice: (Number(p.price) * 1.04).toFixed(0) // إضافة عمولة 4%
    }));
  }, [allProducts, filterValue]);

  const handleOrder = (product: any) => {
    const targetId = targetIds[product.id];
    const price = Number(product.customerPrice);

    if (!targetId || !targetId.trim()) {
      toast({
        title: "حقل مطلوب",
        description: "يرجى إدخال الآي دي أو رقم الهاتف.",
        variant: "destructive",
      });
      return;
    }

    if (userBalance < price) {
      toast({
        title: "رصيد غير كافٍ",
        description: "يرجى شحن محفظتك للمتابعة.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم استلام طلبك",
      description: `طلب ${product.name} قيد المعالجة الآن.`,
    });
    setTargetIds(prev => ({ ...prev, [product.id]: "" }));
  };

  return (
    <Sheet onOpenChange={(open) => { if (open) fetchProducts(); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-none bg-background" dir="rtl">
        <div className="p-4 border-b bg-white">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold font-headline text-primary text-right w-full">{serviceName}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription className="text-right text-xs">عرض المنتجات المباشرة من الراغب (سعر +4%).</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-hidden bg-muted/20">
          {fetching ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground">جاري جلب البيانات من الراغب...</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {filteredProducts.length > 0 ? (
                <div className="grid gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="border-none shadow-sm bg-white overflow-hidden">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          {product.category_img && (
                            <img src={product.category_img} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div className="flex-1 text-right">
                            <h4 className="font-bold text-foreground">{product.name}</h4>
                            <p className="text-[10px] text-muted-foreground">متوفر الآن للشحن الفوري</p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-muted-foreground pr-1 flex items-center gap-1 justify-end">
                            الآي دي أو الرقم المطلوب <UserIcon className="h-3 w-3" />
                          </label>
                          <Input 
                            placeholder="أدخل البيانات هنا..." 
                            className="text-right h-11 bg-muted/30 border-none"
                            value={targetIds[product.id] || ""}
                            onChange={(e) => setTargetIds(prev => ({ ...prev, [product.id]: e.target.value }))}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-dashed">
                          <p className="text-primary font-bold text-xl">
                            {Number(product.customerPrice).toLocaleString()} <span className="text-xs">{currency}</span>
                          </p>
                          <Button 
                            onClick={() => handleOrder(product)}
                            className="rounded-full bg-primary font-bold px-6 shadow-lg active:scale-95"
                          >
                            <ShoppingCart className="ml-2 h-4 w-4" /> اطلب
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <PackageX className="h-10 w-10 opacity-30" />
                  <p className="text-sm font-bold">عذراً، لا توجد منتجات حالياً لهذا القسم.</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
