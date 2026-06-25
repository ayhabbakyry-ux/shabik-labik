
"use client";

import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ShieldAlert, Phone, Trash2, KeyRound, Clock, ArrowRight, UserPlus, Wallet } from "lucide-react";
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
      {/* Header Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg"><UserPlus className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-xs opacity-80">إجمالي المستخدمين</p>
              <p className="text-2xl font-black">{allUsers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-yellow-500 text-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg"><Clock className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-xs opacity-80">طلبات إيداع معلقة</p>
              <p className="text-2xl font-black">{pendingTxs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-600 text-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg"><Wallet className="h-6 w-6" /></div>
            <div className="text-right">
              <p className="text-xs opacity-80">طلبات الاستعادة</p>
              <p className="text-2xl font-black">{passwordRequests.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl mb-8 border border-muted-foreground/10">
          <TabsTrigger value="deposits" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            الإيداعات ({pendingTxs.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            الحسابات ({allUsers.length})
          </TabsTrigger>
          <TabsTrigger value="passwords" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            الاستعادة ({passwordRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {pendingTxs.length === 0 ? (
            <div className="py-20 text-center bg-white border border-dashed rounded-3xl shadow-sm">
              <p className="text-muted-foreground font-bold">لا توجد طلبات إيداع بانتظار المراجعة.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingTxs.map((tx) => (
                <Card key={tx.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-yellow-500 w-full md:w-2" />
                      <div className="flex-1 p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-right space-y-2 flex-1">
                          <div className="flex items-center justify-end gap-2">
                             <Badge variant="outline" className="font-mono text-[10px]">{tx.date}</Badge>
                             <span className="text-[10px] font-bold text-primary">#{tx.id}</span>
                          </div>
                          <div className="flex items-center justify-end gap-4 text-sm font-bold">
                            <span className="text-foreground">{tx.userName}</span>
                            <span className="font-mono text-muted-foreground">{tx.userPhone}</span>
                          </div>
                          <p className="text-2xl font-black text-green-600">
                            +{tx.amount.toLocaleString()} <span className="text-xs font-medium">{currency}</span>
                          </p>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button 
                            variant="ghost" 
                            className="flex-1 md:w-28 text-destructive hover:bg-destructive/10 font-bold" 
                            onClick={() => adminAction(tx.id, 'reject')}
                          >
                            <X className="h-4 w-4 ml-1" /> رفض
                          </Button>
                          <Button 
                            className="flex-1 md:w-28 bg-green-600 hover:bg-green-700 text-white font-bold" 
                            onClick={() => adminAction(tx.id, 'approve')}
                          >
                            <Check className="h-4 w-4 ml-1" /> قبول
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
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-muted/10 border-b p-4">
              <CardTitle className="text-base font-bold text-right flex items-center justify-end gap-2">
                قائمة الحسابات النشطة <Phone className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader className="bg-muted/5">
                    <TableRow>
                      <TableHead className="text-right font-bold text-xs">الاسم</TableHead>
                      <TableHead className="text-right font-bold text-xs">الهاتف</TableHead>
                      <TableHead className="text-right font-bold text-xs">الرصيد</TableHead>
                      <TableHead className="text-center font-bold text-xs">حذف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.phone} className="hover:bg-muted/10">
                        <TableCell className="text-right font-bold text-sm">{user.name}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{user.phone}</TableCell>
                        <TableCell className="text-right font-black text-primary text-sm">
                          {user.balance.toLocaleString()} {currency}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                            onClick={() => handleDelete(user.phone)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">لا يوجد مستخدمون مسجلون.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="animate-in fade-in duration-300">
          <div className="grid gap-3">
            {passwordRequests.length === 0 ? (
              <div className="py-20 text-center bg-white border border-dashed rounded-3xl shadow-sm">
                <p className="text-muted-foreground font-bold">لا توجد طلبات استعادة نشطة.</p>
              </div>
            ) : (
              passwordRequests.map((req) => (
                <Card key={req.phone} className="border-none shadow-sm overflow-hidden bg-white hover:bg-muted/5 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => clearPasswordRequest(req.phone)}
                      className="text-muted-foreground hover:bg-muted h-9 w-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="text-right space-y-1 flex-1 pr-4">
                      <div className="flex items-center justify-end gap-2 text-blue-600 font-black">
                        <span className="font-mono text-lg">{req.phone}</span>
                        <KeyRound className="h-4 w-4" />
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
