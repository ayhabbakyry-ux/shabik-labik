"use client";

import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ShieldAlert, Phone, Trash2, KeyRound, Clock, UserPlus, Wallet, ImageIcon, Eye, BellRing, BellOff, Volume2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AdminPanel() {
  const { 
    transactions, adminAction, currency, allUsers = [], deleteUser, 
    passwordRequests = [], adminResetPassword, notificationsEnabled, requestNotificationPermission
  } = useUser();
  const { toast } = useToast();

  const pendingTxs = transactions?.filter(t => t.status === 'Pending' && t.type === 'إيداع محفظة') || [];

  const toggleNotifications = () => {
    requestNotificationPermission();
    if (notificationsEnabled) {
      toast({ title: "تم إيقاف التنبيهات" });
    } else {
      toast({ title: "تم تفعيل التنبيهات الصوتية ✅" });
    }
  };

  const handleDelete = async (phone: string) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من حذف الحساب (${phone}) نهائياً؟`);
    if (confirmDelete) {
      await deleteUser(phone);
      toast({ title: "تم الحذف بنجاح" });
    }
  };

  const handleAdminAction = async (id: string, action: 'approve' | 'reject') => {
    await adminAction(id, action);
    toast({ 
      title: action === 'approve' ? "تم قبول الإيداع" : "تم رفض الطلب",
      variant: action === 'approve' ? "default" : "destructive"
    });
  };

  const handleResetPassword = async (phone: string, requestId: string) => {
    const confirmReset = window.confirm(`هل تريد تهيئة كلمة مرور الحساب (${phone}) إلى 123456؟`);
    if (confirmReset) {
      await adminResetPassword(phone, requestId);
      toast({ title: "تمت تهيئة كلمة المرور بنجاح ✅" });
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto" dir="rtl">
      {/* Notifications Control */}
      <div className="flex justify-end">
        <Button 
          onClick={toggleNotifications}
          variant={notificationsEnabled ? "default" : "outline"}
          className={`rounded-2xl gap-2 font-bold shadow-sm transition-all ${notificationsEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {notificationsEnabled ? <BellRing className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {notificationsEnabled ? "تنبيهات الصوت نشطة" : "تفعيل تنبيهات الصوت"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary text-white border-none rounded-3xl overflow-hidden shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-xs opacity-70 font-bold mb-1">المستخدمين</p>
              <p className="text-3xl font-black">{allUsers?.length || 0}</p>
            </div>
            <UserPlus className="h-10 w-10 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-orange-500 text-white border-none rounded-3xl overflow-hidden shadow-lg relative">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-xs opacity-70 font-bold mb-1">طلبات معلقة</p>
              <p className="text-3xl font-black">{pendingTxs.length}</p>
            </div>
            <Clock className={`h-10 w-10 opacity-20 ${pendingTxs.length > 0 ? 'animate-spin' : ''}`} />
          </CardContent>
          {pendingTxs.length > 0 && (
            <div className="absolute top-2 left-2 bg-white text-orange-500 rounded-full h-6 w-6 flex items-center justify-center font-black text-xs animate-bounce">!</div>
          )}
        </Card>
        <Card className="bg-green-600 text-white border-none rounded-3xl overflow-hidden shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="text-right">
              <p className="text-xs opacity-70 font-bold mb-1">طلبات استعادة</p>
              <p className="text-3xl font-black">{passwordRequests?.length || 0}</p>
            </div>
            <KeyRound className="h-10 w-10 opacity-20" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="flex w-full bg-white p-1 rounded-2xl border mb-6 h-auto gap-1">
          <TabsTrigger value="deposits" className="flex-1 py-3 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">الطلبات ({pendingTxs.length})</TabsTrigger>
          <TabsTrigger value="users" className="flex-1 py-3 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">الحسابات</TabsTrigger>
          <TabsTrigger value="passwords" className="flex-1 py-3 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">الاستعادة ({passwordRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4 animate-in fade-in">
          {pendingTxs.length === 0 ? (
            <div className="py-20 text-center bg-white border-2 border-dashed rounded-[32px]">
              <p className="text-muted-foreground font-bold">لا يوجد طلبات إيداع حالياً.</p>
            </div>
          ) : (
            pendingTxs.map((tx) => (
              <Card key={tx.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-right w-full md:w-auto">
                    <p className="text-lg font-black">{tx.userName || "مستخدم مجهول"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{tx.userPhone}</p>
                    <p className="text-2xl font-black text-green-600 mt-2">{tx.amount.toLocaleString()} {currency}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full md:w-auto min-w-[150px]">
                    {tx.proofImage && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="w-full font-bold gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl">
                            <Eye className="h-4 w-4" /> عرض الإشعار
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95%] max-w-md bg-white p-2 rounded-[32px] overflow-hidden">
                          <DialogHeader className="p-4">
                            <DialogTitle className="text-right">إشعار التحويل - {tx.userName}</DialogTitle>
                          </DialogHeader>
                          <div className="p-2 bg-slate-50 rounded-2xl overflow-hidden">
                            <img src={tx.proofImage} alt="Deposit Proof" className="w-full h-auto object-contain max-h-[70vh] rounded-xl" />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 border-red-100 text-red-600 font-bold rounded-xl" onClick={() => handleAdminAction(tx.id, 'reject')}>رفض</Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 font-bold rounded-xl" onClick={() => handleAdminAction(tx.id, 'approve')}>قبول</Button>
                    </div>
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
                  {allUsers?.map((user) => (
                    <TableRow key={user.phone}>
                      <TableCell className="text-right font-bold py-4">
                        <p>{user.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{user.phone}</p>
                      </TableCell>
                      <TableCell className="text-right font-black text-green-600">{(user.balance || 0).toLocaleString()}</TableCell>
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

        <TabsContent value="passwords" className="space-y-4 animate-in fade-in">
          {passwordRequests?.length === 0 ? (
             <div className="py-20 text-center bg-white border-2 border-dashed rounded-[32px]">
               <p className="text-muted-foreground font-bold">لا توجد طلبات استعادة حالياً.</p>
             </div>
          ) : (
            passwordRequests?.map((req) => (
              <Card key={req.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                   <div className="text-right space-y-1 w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-xl text-primary">{req.userName}</p>
                        <Badge variant="outline" className="text-[10px] font-bold">طلب استعادة</Badge>
                      </div>
                      <p className="font-mono text-sm text-muted-foreground">{req.phone}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Wallet className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold text-gray-500">الرصيد المحفوظ:</span>
                        <span className="text-lg font-black text-green-600">{(req.balance || 0).toLocaleString()} {currency}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {req.date}</p>
                   </div>
                   
                   <div className="flex gap-2 w-full md:w-auto">
                      <Button 
                        onClick={() => handleResetPassword(req.phone, req.id)}
                        className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-primary/10 flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" /> تهيئة لكلمة 123456
                      </Button>
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
