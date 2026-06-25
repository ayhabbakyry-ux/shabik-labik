
"use client";

import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ShieldAlert, Phone, Trash2, KeyRound, Clock, UserPlus, Wallet } from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-xl bg-[#2563eb] text-white rounded-3xl overflow-hidden relative group">
          <CardContent className="p-6 flex items-center gap-5 z-10 relative">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform"><UserPlus className="h-7 w-7" /></div>
            <div className="text-right">
              <p className="text-xs opacity-80 font-bold mb-1 uppercase tracking-widest">إجمالي المستخدمين</p>
              <p className="text-3xl font-black">{allUsers.length}</p>
            </div>
          </CardContent>
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        </Card>

        <Card className="border-none shadow-xl bg-[#f59e0b] text-white rounded-3xl overflow-hidden relative group">
          <CardContent className="p-6 flex items-center gap-5 z-10 relative">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform"><Clock className="h-7 w-7" /></div>
            <div className="text-right">
              <p className="text-xs opacity-80 font-bold mb-1 uppercase tracking-widest">طلبات الإيداع</p>
              <p className="text-3xl font-black">{pendingTxs.length}</p>
            </div>
          </CardContent>
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        </Card>

        <Card className="border-none shadow-xl bg-[#ef4444] text-white rounded-3xl overflow-hidden relative group">
          <CardContent className="p-6 flex items-center gap-5 z-10 relative">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform"><Wallet className="h-7 w-7" /></div>
            <div className="text-right">
              <p className="text-xs opacity-80 font-bold mb-1 uppercase tracking-widest">طلبات الاستعادة</p>
              <p className="text-3xl font-black">{passwordRequests.length}</p>
            </div>
          </CardContent>
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        </Card>
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="flex w-full h-auto p-1.5 bg-white shadow-sm rounded-2xl mb-8 border border-gray-100 overflow-x-auto gap-2 no-scrollbar">
          <TabsTrigger value="deposits" className="flex-1 py-3.5 rounded-xl font-black text-sm transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
            الإيداعات ({pendingTxs.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 py-3.5 rounded-xl font-black text-sm transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
            الحسابات ({allUsers.length})
          </TabsTrigger>
          <TabsTrigger value="passwords" className="flex-1 py-3.5 rounded-xl font-black text-sm transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
            الاستعادة ({passwordRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
          {pendingTxs.length === 0 ? (
            <div className="py-24 text-center bg-white border-2 border-dashed border-gray-100 rounded-[32px] shadow-sm">
              <Clock className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-lg">لا توجد طلبات إيداع بانتظار المراجعة.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingTxs.map((tx) => (
                <Card key={tx.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all bg-white rounded-3xl">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-yellow-500 w-full md:w-3" />
                      <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-right space-y-2 flex-1 w-full">
                          <div className="flex items-center justify-end gap-3 mb-2">
                             <Badge variant="secondary" className="font-mono text-[10px] px-3 py-1 rounded-full">{tx.date}</Badge>
                             <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full tracking-widest">#{tx.id}</span>
                          </div>
                          <div className="flex items-center justify-end gap-4">
                            <div className="text-right">
                               <p className="text-lg font-black text-gray-800 leading-tight">{tx.userName}</p>
                               <p className="text-xs font-mono text-muted-foreground">{tx.userPhone}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                               <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-3xl font-black text-green-600 mt-4">
                            +{tx.amount.toLocaleString()} <span className="text-sm font-medium opacity-70">{currency}</span>
                          </p>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                          <Button 
                            variant="outline"
                            className="flex-1 md:w-32 h-14 rounded-2xl border-2 text-destructive hover:bg-destructive/5 font-black text-sm" 
                            onClick={() => adminAction(tx.id, 'reject')}
                          >
                            <X className="h-5 w-5 ml-1.5" /> رفض
                          </Button>
                          <Button 
                            className="flex-1 md:w-32 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black shadow-lg shadow-green-600/20 text-sm" 
                            onClick={() => adminAction(tx.id, 'approve')}
                          >
                            <Check className="h-5 w-5 ml-1.5" /> قبول
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

        <TabsContent value="users" className="animate-in fade-in duration-400">
          <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[32px]">
            <CardHeader className="bg-gray-50/50 border-b p-6">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{allUsers.length} حساب</Badge>
                <CardTitle className="text-lg font-black text-right flex items-center justify-end gap-2 text-gray-800">
                  قائمة الحسابات النشطة <Phone className="h-5 w-5 text-primary" />
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader className="bg-gray-50/30">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="text-right font-black text-[11px] uppercase text-muted-foreground py-4">الاسم</TableHead>
                      <TableHead className="text-right font-black text-[11px] uppercase text-muted-foreground">الهاتف</TableHead>
                      <TableHead className="text-right font-black text-[11px] uppercase text-muted-foreground">الرصيد</TableHead>
                      <TableHead className="text-center font-black text-[11px] uppercase text-muted-foreground">حذف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.phone} className="hover:bg-primary/5 transition-colors border-b border-gray-50">
                        <TableCell className="text-right py-5">
                           <p className="font-black text-sm text-gray-800">{user.name}</p>
                           <p className="text-[10px] text-muted-foreground">عضو منذ وقت قليل</p>
                        </TableCell>
                        <TableCell className="text-right font-mono text-[11px] font-bold text-primary">{user.phone}</TableCell>
                        <TableCell className="text-right">
                           <span className="font-black text-green-600 text-sm">
                             {user.balance.toLocaleString()}
                           </span>
                           <span className="text-[9px] text-muted-foreground mr-1">{currency}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 rounded-2xl h-10 w-10 transition-transform active:scale-90"
                            onClick={() => handleDelete(user.phone)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-24 text-muted-foreground font-bold">لا يوجد مستخدمون مسجلون حالياً.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="animate-in fade-in duration-400">
          <div className="grid gap-4">
            {passwordRequests.length === 0 ? (
              <div className="py-24 text-center bg-white border-2 border-dashed border-gray-100 rounded-[32px] shadow-sm">
                <KeyRound className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold text-lg">لا توجد طلبات استعادة نشطة حالياً.</p>
              </div>
            ) : (
              passwordRequests.map((req) => (
                <Card key={req.phone} className="border-none shadow-sm overflow-hidden bg-white rounded-3xl hover:shadow-xl transition-all group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => clearPasswordRequest(req.phone)}
                      className="text-gray-300 hover:text-destructive hover:bg-destructive/5 rounded-2xl h-12 w-12 transition-all"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                    <div className="text-right space-y-1.5 flex-1 pr-6 border-r border-gray-50 mr-4">
                      <div className="flex items-center justify-end gap-3 text-primary font-black">
                        <span className="font-mono text-xl tracking-wider">{req.phone}</span>
                        <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                           <KeyRound className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-muted-foreground">
                        <span>{req.date}</span>
                        <Clock className="h-3.5 w-3.5" />
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
