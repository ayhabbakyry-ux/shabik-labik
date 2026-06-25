
"use client";

import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ShieldAlert, Phone, User, Hash, Trash2, KeyRound, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AdminPanel() {
  const { 
    transactions, adminAction, currency, allUsers, deleteUser, 
    passwordRequests, clearPasswordRequest 
  } = useUser();
  const { toast } = useToast();

  const pendingTxs = transactions.filter(t => t.status === 'Pending');

  const handleDelete = (phone: string) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من حذف الحساب (${phone}) نهائياً؟`);
    if (confirmDelete) {
      deleteUser(phone);
      toast({
        title: "تم الحذف بنجاح",
        description: "تمت إزالة الحساب وتحديث القائمة فوراً.",
      });
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-10" dir="rtl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 text-destructive">
          <ShieldAlert className="h-10 w-10" />
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black font-headline">لوحة تحكم الإدارة</h1>
            <p className="text-sm text-muted-foreground font-medium">إدارة الطلبات، الحسابات، وكلمات المرور</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl mb-8">
          <TabsTrigger value="deposits" className="py-3 rounded-lg data-[state=active]:shadow-md">
            طلبات الإيداع ({pendingTxs.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="py-3 rounded-lg data-[state=active]:shadow-md">
            الحسابات ({allUsers.length})
          </TabsTrigger>
          <TabsTrigger value="passwords" className="py-3 rounded-lg data-[state=active]:shadow-md">
            كلمات المرور ({passwordRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4 animate-in fade-in duration-300">
          {pendingTxs.length === 0 ? (
            <div className="py-20 text-center bg-muted/20 border-2 border-dashed rounded-3xl">
              <p className="text-muted-foreground font-bold">لا توجد طلبات إيداع معلقة حالياً.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingTxs.map((tx) => (
                <Card key={tx.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-yellow-500 w-full md:w-2" />
                      <div className="flex-1 p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                          <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="font-mono">{tx.date}</Badge>
                             <span className="text-xs font-bold text-primary">#{tx.id}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-xl">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">الاسم</p>
                              <p className="font-bold">{tx.userName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">الهاتف</p>
                              <p className="font-mono font-bold">{tx.userPhone}</p>
                            </div>
                          </div>
                          <p className="text-2xl font-black text-green-600">
                            +{tx.amount.toLocaleString()} <span className="text-xs">{currency}</span>
                          </p>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 md:w-28 text-destructive border-destructive/20 hover:bg-destructive/10" 
                            onClick={() => adminAction(tx.id, 'reject')}
                          >
                            <X className="h-4 w-4 ml-2" /> رفض
                          </Button>
                          <Button 
                            className="flex-1 md:w-28 bg-green-600 hover:bg-green-700 text-white" 
                            onClick={() => adminAction(tx.id, 'approve')}
                          >
                            <Check className="h-4 w-4 ml-2" /> قبول
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in duration-300">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg font-bold text-right">قائمة المستخدمين المسجلين</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-right font-bold">الاسم</TableHead>
                      <TableHead className="text-right font-bold">الهاتف</TableHead>
                      <TableHead className="text-right font-bold">الرصيد</TableHead>
                      <TableHead className="text-center font-bold">إدارة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.phone} className="hover:bg-muted/10">
                        <TableCell className="text-right font-bold">{user.name}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{user.phone}</TableCell>
                        <TableCell className="text-right font-black text-primary">
                          {user.balance.toLocaleString()} {currency}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => handleDelete(user.phone)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">لا يوجد مستخدمون حالياً.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="animate-in fade-in duration-300">
          <div className="grid gap-4">
            {passwordRequests.length === 0 ? (
              <div className="py-20 text-center bg-muted/20 border-2 border-dashed rounded-3xl">
                <p className="text-muted-foreground font-bold">لا توجد طلبات استعادة معلقة.</p>
              </div>
            ) : (
              passwordRequests.map((req) => (
                <Card key={req.phone} className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-5 flex items-center justify-between bg-white">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => clearPasswordRequest(req.phone)}
                      className="text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end gap-2 text-primary font-black">
                        <span className="font-mono text-lg">{req.phone}</span>
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
                        <span>{req.date}</span>
                        <Clock className="h-3 w-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
