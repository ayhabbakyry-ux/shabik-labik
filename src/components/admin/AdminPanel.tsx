
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
      toast({ title: "تم الحذف بنجاح" });
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto" dir="rtl">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary text-white border-none rounded-3xl overflow-hidden shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-xs opacity-70 font-bold mb-1">المستخدمين</p>
              <p className="text-3xl font-black">{allUsers.length}</p>
            </div>
            <UserPlus className="h-10 w-10 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-orange-500 text-white border-none rounded-3xl overflow-hidden shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-xs opacity-70 font-bold mb-1">طلبات معلقة</p>
              <p className="text-3xl font-black">{pendingTxs.length}</p>
            </div>
            <Clock className="h-10 w-10 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-green-600 text-white border-none rounded-3xl overflow-hidden shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-xs opacity-70 font-bold mb-1">طلبات استعادة</p>
              <p className="text-3xl font-black">{passwordRequests.length}</p>
            </div>
            <KeyRound className="h-10 w-10 opacity-20" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="flex w-full bg-white p-1 rounded-2xl border mb-6 h-auto gap-1">
          <TabsTrigger value="deposits" className="flex-1 py-3 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">الطلبات</TabsTrigger>
          <TabsTrigger value="users" className="flex-1 py-3 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">الحسابات</TabsTrigger>
          <TabsTrigger value="passwords" className="flex-1 py-3 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">الاستعادة</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4 animate-in fade-in">
          {pendingTxs.length === 0 ? (
            <div className="py-20 text-center bg-white border-2 border-dashed rounded-[32px]">
              <p className="text-muted-foreground font-bold">لا يوجد طلبات حالياً.</p>
            </div>
          ) : (
            pendingTxs.map((tx) => (
              <Card key={tx.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-right w-full md:w-auto">
                    <p className="text-lg font-black">{tx.userName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{tx.userPhone}</p>
                    <p className="text-2xl font-black text-green-600 mt-2">{tx.amount.toLocaleString()} {currency}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 border-red-200 text-red-600 font-bold" onClick={() => adminAction(tx.id, 'reject')}>رفض</Button>
                    <Button className="flex-1 bg-green-600 font-bold" onClick={() => adminAction(tx.id, 'approve')}>قبول</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-right py-4 font-bold">الاسم</TableHead>
                    <TableHead className="text-right font-bold">الرصيد</TableHead>
                    <TableHead className="text-center font-bold">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.phone}>
                      <TableCell className="text-right font-bold py-4">
                        <p>{user.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{user.phone}</p>
                      </TableCell>
                      <TableCell className="text-right font-black text-green-600">{user.balance.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(user.phone)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="space-y-4">
          {passwordRequests.length === 0 ? (
             <div className="py-20 text-center bg-white border-2 border-dashed rounded-[32px]">
               <p className="text-muted-foreground font-bold">لا توجد طلبات استعادة.</p>
             </div>
          ) : (
            passwordRequests.map((req) => (
              <Card key={req.phone} className="border-none shadow-sm rounded-2xl bg-white">
                <CardContent className="p-4 flex justify-between items-center">
                   <Button variant="ghost" size="icon" onClick={() => clearPasswordRequest(req.phone)}><X className="h-4 w-4 text-red-400" /></Button>
                   <div className="text-right">
                      <p className="font-black text-primary">{req.phone}</p>
                      <p className="text-[10px] text-muted-foreground">{req.date}</p>
                   </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
