
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Loader2, PackageX, RefreshCw, Key, AlertCircle, Copy, Terminal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Product = {
  id: string | number;
  name: string;
  price: number;
};

type ServerCategory = {
  id: number;
  الاسم?: string;
  name?: string;
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
  categoryId, 
}: { 
  children: React.ReactNode; 
  serviceName: string;
  serviceId?: string;
  categoryId?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [serverCategories, setServerCategories] = useState<ServerCategory[]>([]);
  const [rawJson, setRawJson] = useState<string>("");
  const [fetching, setFetching] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const { userBalance } = useUser();
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    if (serviceId === 'admin') return;
    
    setFetching(true);
    setRawJson("Fetching...");

    try {
      // Fetch root categories
      const rootRes = await fetch('/api/products?categoryId=0');
      const rootData = await rootRes.json();
      
      // SAVE RAW JSON FOR USER
      setRawJson(JSON.stringify(rootData, null, 2));

      const rawCategories = Array.isArray(rootData) ? rootData : (rootData.data || []);
      setServerCategories(rawCategories);

      if (!categoryId) {
        setProducts([]);
        setFetching(false);
        return;
      }

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
      setRawJson(prev => prev + "\n\nERROR: " + error.message);
      toast({
        title: "Fetch Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [serviceName, serviceId, categoryId, toast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawJson);
    toast({ title: "Copied!", description: "Raw JSON copied to clipboard." });
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
      if (open) fetchProducts();
    }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <div className="p-6 border-b flex items-center justify-between bg-card">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">{serviceName}</SheetTitle>
            <SheetDescription>
              {categoryId ? `ID: #${categoryId}` : "Select ID Mapping"}
            </SheetDescription>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* RAW DATA DUMP FOR MOBILE USER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                <Terminal className="h-3 w-3" /> Raw Server Response (Part 2)
              </Label>
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={copyToClipboard}>
                <Copy className="h-3 w-3 mr-1" /> Copy JSON
              </Button>
            </div>
            <Textarea 
              readOnly 
              value={rawJson} 
              className="font-mono text-[10px] h-40 bg-black text-green-500 border-none leading-tight"
              placeholder="Awaiting data..."
            />
          </div>

          {!categoryId && !fetching && serverCategories.length > 0 && (
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-bold">Category</TableHead>
                    <TableHead className="text-right text-xs font-bold">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serverCategories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="text-xs font-medium">{cat.الاسم || cat.name}</TableCell>
                      <TableCell className="text-right font-mono text-primary font-bold text-xs">
                        {cat.id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {fetching && (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs animate-pulse">Requesting from Server...</p>
            </div>
          )}

          {!fetching && categoryId && (
            <>
              <div className="space-y-2 p-4 bg-accent/30 rounded-xl border">
                <Label htmlFor="playerId" className="text-xs font-bold uppercase flex items-center gap-2">
                  <Key className="h-3 w-3" /> Player ID / Phone
                </Label>
                <Input 
                  id="playerId" 
                  placeholder="Enter ID" 
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="bg-white h-9"
                />
              </div>

              {products.length === 0 ? (
                <div className="h-20 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <PackageX className="h-6 w-6 opacity-20" />
                  <p className="text-xs font-medium">No items found for ID #{categoryId}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs">{product.name}</p>
                        <p className="text-xs font-bold text-secondary">{product.price.toLocaleString()} SYP</p>
                      </div>
                      <Button size="sm" className="h-8 px-4 text-xs">Order</Button>
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
