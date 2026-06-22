
"use client";

import { useState, useEffect } from "react";
import { Smartphone, Gamepad2, CreditCard, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProductSheet } from "./ProductSheet";
import { useToast } from "@/hooks/use-toast";

type ApiCategory = {
  id: number;
  name: string;
};

export function ServiceGrid({ isAdmin }: { isAdmin?: boolean }) {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/products?categoryId=0');
        const data = await res.json();
        
        // Ensure we get an array from the data property or the root
        const items = Array.isArray(data) ? data : (data.data || []);
        
        // Log the response exactly as requested by the user to identify correct names
        console.log("Al-Ragheb Root Categories:", items);
        
        setCategories(items);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast({
          title: "Connection Error",
          description: "Could not load categories from Al-Ragheb.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [toast]);

  // Helper to assign icons based on server-provided names
  const getIconForCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('سيريتل') || n.includes('mtn') || n.includes('وحدات')) return Smartphone;
    if (n.includes('العاب') || n.includes('game') || n.includes('ببجي')) return Gamepad2;
    if (n.includes('كاش') || n.includes('رصيد')) return CreditCard;
    return Smartphone;
  };

  const getColorsForCategory = (name: string) => {
    if (name.includes('سيريتل')) return { color: "text-red-600", bg: "bg-red-50" };
    if (name.includes('mtn')) return { color: "text-yellow-600", bg: "bg-yellow-50" };
    if (name.includes('العاب')) return { color: "text-blue-500", bg: "bg-blue-50" };
    return { color: "text-primary", bg: "bg-primary/5" };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Syncing with Al-Ragheb Server...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* Dynamic API Categories */}
      {categories.map((cat) => {
        const Icon = getIconForCategory(cat.name);
        const { color, bg } = getColorsForCategory(cat.name);
        
        return (
          <ProductSheet key={cat.id} serviceName={cat.name} apiCategoryId={cat.id}>
            <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className={`p-3 rounded-2xl ${bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <p className="text-xs font-bold leading-tight uppercase tracking-wide text-muted-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </p>
              </CardContent>
            </Card>
          </ProductSheet>
        );
      })}

      {/* Admin Panel (Maalam Console) */}
      {isAdmin && (
        <ProductSheet serviceName="لوحة التحكم (المعلم)" serviceId="admin">
          <Card className="hover:shadow-md transition-all cursor-pointer group active:scale-95 border-none bg-white">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs font-bold leading-tight uppercase tracking-wide text-muted-foreground group-hover:text-primary transition-colors">
                لوحة التحكم
              </p>
            </CardContent>
          </Card>
        </ProductSheet>
      )}

      {categories.length === 0 && !loading && (
        <div className="col-span-full p-8 text-center bg-muted/20 rounded-2xl border border-dashed">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm font-medium text-muted-foreground">No categories returned from server.</p>
        </div>
      )}
    </div>
  );
}
