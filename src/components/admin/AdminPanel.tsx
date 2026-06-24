
"use client";

import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, ShieldAlert, Phone, User, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminPanel() {
  const { transactions, adminAction, currency } = useUser();
  const pendingTxs = transactions.filter(t => t.status === 'Pending');

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4" dir="rtl">
      <div className="flex items-center gap-3 text-destructive justify-end">
        <div className="text-right">
          <h1 className="text-2xl font-bold font-headline">لوحة تحكم المعلم</h1>
          <p className="text-sm text-muted-foreground">مراجعة وتأكيد طلبات الإيداع اليدوية</p>
        </div>
        <ShieldAlert className="h-8 w-8" />
      </div>

      <div className="grid gap-4">
        {pendingTxs.length === 0 ? (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-12 text-center text-muted-foreground">
              لا توجد طلبات معلقة حالياً.
            </CardContent>
          </Card>
        ) : (
          pendingTxs.map((tx) => (
            <Card key={tx.id} className="border-r-4 border-r-yellow-500">
              <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-2 text-right w-full">
                  <div className="flex items-center justify-end gap-2">
                    <Badge variant="outline">{tx.date}</Badge>
                    <span className="font-bold font-mono text-primary flex items-center gap-1">
                      <Hash className="h-3 w-3" /> {tx.id}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> اسم المستخدم</span>
                      <span className="font-bold">{tx.userName}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> الرقم</span>
                      <span className="font-bold font-mono">{tx.userPhone}</span>
                    </div>
                  </div>

                  <p className="text-2xl font-black text-green-600">
                    +{tx.amount.toLocaleString()} {currency}
                  </p>
                  <p className="text-xs text-muted-foreground">نوع العملية: {tx.type}</p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-destructive hover:bg-destructive/10 border-destructive"
                    onClick={() => adminAction(tx.id, 'reject')}
                  >
                    <X className="h-4 w-4 ml-1" /> رفض
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => adminAction(tx.id, 'approve')}
                  >
                    <Check className="h-4 w-4 ml-1" /> موافقة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="text-right">
        <CardHeader>
          <CardTitle>متغيرات النظام</CardTitle>
          <CardDescription>ضبط العمولات ونسبة المزامنة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <Badge className="bg-green-500">نشط</Badge>
            <span>حالة مزامنة الراغب:</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t pt-2">
            <span className="font-mono">4% ثابت</span>
            <span>نسبة الربح المضافة:</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
