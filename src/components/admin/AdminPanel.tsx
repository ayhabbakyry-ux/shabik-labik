
"use client";

import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ShieldAlert, Phone, Trash2, KeyRound, Clock, UserPlus, Wallet, ImageIcon, Eye, BellRing, BellOff, Volume2, RefreshCw, Search, Plus, Minus, VolumeX, Sparkles, AlertCircle, Loader2, Circle, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatWhatsAppNumber } from "@/lib/utils";
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
    passwordRequests = [], adminResetPassword, notificationsEnabled, requestNotificationPermission,
    updateBalanceAdmin, refreshCloudData, isAudioUnlocked, unlockAudio
  } = useUser();
  const { toast } = useToast();

  const [userSearch, setUserSearch] = useState("");
  const [balanceAdjustments, setBalanceAdjustments] = useState<Record<string, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // تحديث البيانات فور فتح الصفحة وبشكل دوري سريع
  useEffect(() => {
    const initFetch = async () => {
      setIsLoadingData(true);
      await refreshCloudData();
      setIsLoadingData(false);
      setIsFirstLoad(false);
    };
    
    initFetch();

    const pollInterval = setInterval(() => {
      refreshCloudData();
    }, 15000); // تحديث كل 15 ثانية لضمان دقة البيانات
    
    return () => clearInterval(pollInterval);
  }, [refreshCloudData]);

  const handleManualRefresh = async () => {
    setIsLoadingData(true);
    await refreshCloudData();
    setIsLoadingData(false);
    toast({ title: "تم تحديث البيانات بلمحة بصر ✅" });
  };

  const pendingTxs = transactions?.filter(t => t.status === 'Pending' && (t.type === 'إيداع محفظة' || t.type === 'طلب إيداع')) || [];

  const filteredUsers = (allUsers || []).filter(u => 
    (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) || 
    (u.phone || "").includes(userSearch)
  );

  const toggleNotifications = () => {
    requestNotificationPermission();
    if (notificationsEnabled) {
      toast({ title: "تم إيقاف التنبيهات" });
    } else {
      toast({ title: "تم تفعيل التنبيهات الصوتية ✅" });
    }
  };

  const handleUnlockAudio = () => {
    unlockAudio();
    toast({ title: "تم تفعيل الصوت", description: "ستسمع تنبيهاً عند وصول أي إيداع جديد." });
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

  const handleUpdateBalance = async (phone: string, operation: 'add' | 'subtract') => {
    const amount = Number(balanceAdjustments[phone] || 0);
    if (!amount || amount <= 0) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال مبلغ صحيح." });
      return;
    }
    await updateBalanceAdmin(phone, amount, operation);
    toast({ title: operation === 'add' ? "تمت إضافة الرصيد" : "تم سحب الرصيد" });
    setBalanceAdjustments(prev => ({ ...prev, [phone]: "" }));
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleManualRefresh}
            variant="outline"
            disabled={isLoadingData}
            className="rounded-2xl gap-2 font-bold shadow-sm h-12 px-6 border-primary/20 hover:bg-primary/5 transition-all"
          >
            <RefreshCw className={`h-5 w-5 text-primary ${isLoadingData ? 'animate-spin' : ''}`} /> 
            <span className="hidden sm:inline">تحديث فوري</span>
          </Button>
          
          <Button 
            onClick={handleUnlockAudio}
            variant={isAudioUnlocked ? "default" : "destructive"}
            className={`rounded-2xl gap-2 font-bold shadow-lg transition-all h-12 px-6 ${
              !isAudioUnlocked ? 'animate-bounce border-2 border-white' : 'bg-green-600'
            }`}
          >
            {isAudioUnlocked ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            {isAudioUnlocked ? "الصوت مفعل" : "تفعيل التنبيهات!"}
          </Button>
        </div>
        
        <Button 
          onClick={toggleNotifications}
          variant={notificationsEnabled ? "default" : "outline"}
          className={`rounded-2xl h-12 px-6 gap-2 font-bold shadow-sm transition-all ${notificationsEnabled ? 'bg-primary text-white' : ''}`}
        >
          {notificationsEnabled ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          {notificationsEnabled ? "التنبيهات نشطة" : "تنبيهات المتصفح"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary text-white border-none rounded-[32px] overflow-hidden shadow-xl relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <UserPlus className="h-24 w-24" />
          </div>
          <CardContent className="p-8 flex flex-col items-start justify-center relative z-10">
            <p className="text-xs opacity-80 font-black mb-1 tracking-widest">إجمالي المستخدمين</p>
            {isFirstLoad ? <Loader2 className="h-8 w-8 animate-spin" /> : <p className="text-5xl font-black">{allUsers?.length || 0}</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#ff6d00] text-white border-none rounded-[32px] overflow-hidden shadow-xl relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Clock className={`h-24 w-24 ${pendingTxs.length > 0 ? 'animate-spin-slow' : ''}`} />
          </div>
          <CardContent className="p-8 flex flex-col items-start justify-center relative z-10">
            <p className="text-xs opacity-80 font-black mb-1 tracking-widest">إيداعات معلقة</p>
            {isFirstLoad ? <Loader2 className="h-8 w-8 animate-spin" /> : <p className="text-5xl font-black">{pendingTxs.length}</p>}
          </CardContent>
        </Card>

        <Card className="bg-emerald-600 text-white border-none rounded-[32px] overflow-hidden shadow-xl relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <KeyRound className="h-24 w-24" />
          </div>
          <CardContent className="p-8 flex flex-col items-start justify-center relative z-10">
            <p className="text-xs opacity-80 font-black mb-1 tracking-widest">طلبات استعادة</p>
            {isFirstLoad ? <Loader2 className="h-8 w-8 animate-spin" /> : <p className="text-5xl font-black">{passwordRequests?.length || 0}</p>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="flex w-full bg-white p-1 rounded-2xl border mb-6 h-auto gap-1 shadow-sm">
          <TabsTrigger value="deposits" className="flex-1 py-4 font-black text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">
            الطلبات المعلقة ({pendingTxs.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 py-4 font-black text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">
            إدارة الحسابات
          </TabsTrigger>
          <TabsTrigger value="passwords" className="flex-1 py-4 font-black text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl transition-all">
            الاستعادة ({passwordRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {pendingTxs.length === 0 ? (
            <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center gap-4">
               <div className="bg-slate-50 p-6 rounded-full">
                  <Check className="h-12 w-12 text-slate-200" />
               </div>
               <p className="text-slate-400 font-bold text-lg">لا يوجد طلبات إيداع بانتظارك حالياً.</p>
            </div>
          ) : (
            pendingTxs.map((tx) => (
              <Card key={tx.id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-xl transition-all border-r-8 border-r-orange-500">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-right w-full md:w-auto space-y-1">
                    <p className="text-2xl font-black text-slate-800">{tx.userName || "مستخدم مجهول"}</p>
                    <p className="text-sm text-muted-foreground font-mono bg-slate-50 inline-block px-3 py-1 rounded-lg">{tx.userPhone}</p>
                    <p className="text-3xl font-black text-emerald-600 mt-4">{tx.amount.toLocaleString()} {currency}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleString('ar-SY')}</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                    {tx.proofImage && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="w-full h-12 font-black gap-2 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
                            <Eye className="h-5 w-5" /> عرض إشعار الدفع
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95%] max-w-md bg-white p-2 rounded-[40px] border-none shadow-2xl">
                          <DialogHeader className="p-6 pb-2"><DialogTitle className="text-right font-black text-xl">إشعار التحويل الرسمي</DialogTitle></DialogHeader>
                          <div className="p-4 bg-slate-50 rounded-[32px] overflow-hidden">
                            <img src={tx.proofImage} alt="Deposit Proof" className="w-full h-auto object-contain max-h-[70vh] rounded-2xl shadow-inner" />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 h-14 border-2 border-red-100 text-red-600 hover:bg-red-50 font-black rounded-2xl transition-all" onClick={() => handleAdminAction(tx.id, 'reject')}>رفض</Button>
                      <Button className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 font-black rounded-2xl text-white shadow-lg shadow-emerald-200 transition-all" onClick={() => handleAdminAction(tx.id, 'approve')}>قبول الإيداع</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input placeholder="ابحث عن مستخدم بالاسم أو الرقم..." className="pr-12 h-14 bg-white rounded-2xl border-none shadow-sm text-right font-bold focus:ring-primary" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          </div>
          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none">
                    <TableHead className="text-right py-5 font-black text-slate-500">المستخدم</TableHead>
                    <TableHead className="text-right font-black text-slate-500">الرصيد الحالي</TableHead>
                    <TableHead className="text-center font-black text-slate-500">تعديل الرصيد</TableHead>
                    <TableHead className="text-center font-black text-slate-500">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                      <TableCell className="text-right font-bold py-5">
                        <div className="flex items-center gap-3">
                           <div className="relative">
                              <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs ${user.isOnline ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                                 {user.name?.charAt(0) || 'U'}
                              </div>
                              {user.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>}
                           </div>
                           <div>
                              <p className="font-black text-slate-800">{user.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{user.phone}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-emerald-600 text-lg">{(user.balance || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">{currency}</span></TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 min-w-[200px] bg-slate-50 p-1.5 rounded-2xl inline-flex">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm text-red-600 hover:bg-red-50" onClick={() => handleUpdateBalance(user.phone, 'subtract')}><Minus className="h-4 w-4" /></Button>
                          <Input type="number" placeholder="المبلغ" className="w-24 h-9 text-center text-xs font-black rounded-xl border-none shadow-inner" value={balanceAdjustments[user.phone] || ""} onChange={(e) => setBalanceAdjustments(prev => ({ ...prev, [user.phone]: e.target.value }))} />
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white shadow-sm text-emerald-600 hover:bg-emerald-50" onClick={() => handleUpdateBalance(user.phone, 'add')}><Plus className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                         <div className="flex items-center justify-center gap-1">
                            <a 
                              href={`https://wa.me/${formatWhatsAppNumber(user.phone)}`} 
                              target="_blank" 
                              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                            >
                               <MessageCircle className="h-4 w-4" />
                            </a>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={() => handleDelete(user.phone)}><Trash2 className="h-4 w-4" /></Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {passwordRequests?.length === 0 ? (
            <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center gap-4">
               <div className="bg-slate-50 p-6 rounded-full">
                  <ShieldAlert className="h-12 w-12 text-slate-200" />
               </div>
               <p className="text-slate-400 font-bold text-lg">لا يوجد طلبات استعادة كلمة مرور حالياً.</p>
            </div>
          ) : (
            passwordRequests?.map((req) => (
              <Card key={req.id} className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden border-r-8 border-r-emerald-500">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-right space-y-1">
                      <p className="font-black text-2xl text-slate-800">{req.userName}</p>
                      <p className="font-mono text-sm text-muted-foreground bg-slate-50 inline-block px-3 py-1 rounded-lg">{req.phone}</p>
                      <p className="text-xl font-black text-emerald-600 mt-2">الرصيد المحفوظ: {(req.balance || 0).toLocaleString()} {currency}</p>
                  </div>
                  <Button onClick={() => handleResetPassword(req.phone, req.id)} className="bg-primary hover:bg-primary/90 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">
                    تهيئة الحساب (123456)
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
