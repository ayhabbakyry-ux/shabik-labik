
"use client";

import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, ShieldAlert, Phone, User, Hash, Trash2, KeyRound, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export function AdminPanel() {
  const { 
    transactions, adminAction, currency, allUsers, deleteUser, 
    passwordRequests, clearPasswordRequest
  } = useUser();
  const { toast } = useToast();

  const pendingTxs = transactions.filter(t => t.status === 'Pending');

  const handleDelete = (phone: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الحساب (${phone}) نهائياً؟`)) {
      deleteUser(phone);
      toast({
        title: "تم الحذف بنجاح",
        description: `تم إزالة المستخدم ذو الرقم ${phone} من النظام.`,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8 px-4" dir="rtl">
      <div className="flex items-center gap-3 text-destructive justify-end">
        <div className="text-right">
          <h1 className="text-2xl font-bold font-headline">لوحة تحكم المعلم</h1>
          <p className="text-sm text-muted-foreground">الإدارة الكاملة للنظام والمستخدمين</p>
        </div>
        <ShieldAlert className="h-8 w-8" />
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="deposits">طلبات الإيداع ({pendingTxs.length})</TabsTrigger>
          <TabsTrigger value="users">إدارة الحسابات ({allUsers.length})</TabsTrigger>
          <TabsTrigger value="passwords">استعادة الحساب ({passwordRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4">
          {pendingTxs.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                لا توجد طلبات إيداع معلقة.
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
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 text-destructive" onClick={() => adminAction(tx.id, 'reject')}><X className="h-4 w-4 ml-1" /> رفض</Button>
                    <Button className="flex-1 bg-green-600" onClick={() => adminAction(tx.id, 'approve')}><Check className="h-4 w-4 ml-1" /> موافقة</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">قائمة كافة المستخدمين</CardTitle>
              <CardDescription className="text-right">عرض وحذف الحسابات المسجلة في التطبيق.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">رقم الهاتف</TableHead>
                    <TableHead className="text-right">كلمة السر</TableHead>
                    <TableHead className="text-right">الرصيد</TableHead>
                    <TableHead className="text-right">إجراء الحذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.phone}>
                      <TableCell className="text-right font-bold">{user.name}</TableCell>
                      <TableCell className="text-right font-mono">{user.phone}</TableCell>
                      <TableCell className="text-right"><Badge variant="outline">{user.password || "••••"}</Badge></TableCell>
                      <TableCell className="text-right font-bold text-primary">{user.balance.toLocaleString()} {currency}</TableCell>
                      <TableCell className="text-right">
                        <button 
                          onClick={() => handleDelete(user.phone)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-all active:scale-90"
                          title="حذف الحساب"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">لا يوجد مستخدمون حالياً.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords">
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center justify-end gap-2">
                طلبات استعادة الحساب <KeyRound className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordRequests.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">لا توجد طلبات جديدة.</p>
              ) : (
                passwordRequests.map((req) => (
                  <div key={req.phone} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                    <Button variant="ghost" size="sm" onClick={() => clearPasswordRequest(req.phone)}><X className="h-4 w-4" /></Button>
                    <div className="text-right">
                      <p className="font-bold flex items-center justify-end gap-2">{req.phone} <Phone className="h-4 w-4 text-primary" /></p>
                      <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">{req.date} <Clock className="h-3 w-3" /></p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
