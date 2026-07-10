
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { signInAction, signUpAction, requestPasswordResetAction } from '@/app/actions/auth';
import { syncBalanceAction, recordTransactionAction, getUserTransactionsAction } from '@/app/actions/wallet';
import { 
  getAllUsersAction, 
  deleteUserAction, 
  processAdminAction, 
  updateTransactionStatusServer, 
  getUserDataAction,
  getPasswordRequestsAction,
  completePasswordResetAction,
  getAllTransactionsAction
} from '@/app/actions/admin';
import { changePasswordAction, updateProfileImageAction } from '@/app/actions/profile';

export type Transaction = {
  id: string;
  external_order_id?: string;
  type: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Rejected';
  date: string;
  userName?: string;
  userPhone?: string;
  details?: string;
  proofImage?: string;
  balanceBefore?: number;
  balanceAfter?: number;
};

type UserContextType = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userPhone: string;
  userName: string;
  userBalance: number;
  profileImage: string | null;
  transactions: Transaction[];
  allUsers: any[];
  passwordRequests: any[];
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (phone: string, name: string, pass: string, refCode?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  deductBalance: (amount: number, productDetails: string, initialStatus?: 'Pending' | 'Completed', externalId?: string) => Promise<void>;
  requestDeposit: (amount: number, proofImage: string) => Promise<void>;
  adminAction: (txId: string, action: 'approve' | 'reject') => Promise<void>;
  deleteUser: (phone: string) => Promise<void>;
  requestReset: (phone: string) => Promise<{ success: boolean; message: string }>;
  adminResetPassword: (phone: string, requestId: string) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateProfileImage: (imageData: string) => Promise<{ success: boolean; message?: string }>;
  currency: string;
  checkPendingOrders: () => Promise<void>;
  notificationsEnabled: boolean;
  requestNotificationPermission: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);
  const [isCheckingOrders, setIsCheckingOrders] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const prevTransactionsRef = useRef<Transaction[]>([]);
  const prevPassRequestsRef = useRef<any[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";
  const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(() => console.log("تم حظر الصوت بواسطة سياسة المتصفح."));
    } catch (e) {
      console.error("خطأ في تشغيل الصوت", e);
    }
  }, []);

  const triggerNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "https://picsum.photos/seed/genie/200/200" });
      playNotificationSound();
    }
  }, [playNotificationSound]);

  const requestNotificationPermission = useCallback(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(permission => {
      setNotificationsEnabled(permission === "granted");
      if (permission === "granted") {
        triggerNotification("تم تفعيل التنبيهات بنجاح ✅", "سوف تتلقى إشعارات فورية حول حالة طلباتك ورصيدك.");
      }
    });
  }, [triggerNotification]);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const fetchCloudData = useCallback(async (phone: string) => {
    const isAdminUser = phone === ADMIN_PHONE;
    
    let cloudTxs: Transaction[] = [];
    if (isAdminUser) {
      // جلب كافة العمليات المالية من السيرفر للمدير
      cloudTxs = await getAllTransactionsAction() as Transaction[];
      
      // جلب كافة طلبات استعادة كلمة المرور
      const currentPassReqs = await getPasswordRequestsAction();
      if (currentPassReqs.length > prevPassRequestsRef.current.length) {
        triggerNotification("طلب استعادة حساب جديد 🔑", "هناك مستخدم ينتظر تهيئة بيانات الدخول.");
      }
      setPasswordRequests(currentPassReqs);
      prevPassRequestsRef.current = currentPassReqs;

      // جلب كافة المستخدمين المسجلين في النظام
      const users = await getAllUsersAction();
      setAllUsers(users || []);
    } else {
      cloudTxs = await getUserTransactionsAction(phone);
    }
    
    const prev = prevTransactionsRef.current;
    
    // تنبيهات العمليات الجديدة للمدير
    if (isAdminUser) {
      const newDeposits = cloudTxs.filter(tx => tx.type === 'إيداع محفظة' && tx.status === 'Pending' && !prev.find(p => p.id === tx.id));
      if (newDeposits.length > 0) {
        triggerNotification("طلب إيداع جديد 💰", `تم استلام طلب إيداع جديد بقيمة ${newDeposits[0].amount.toLocaleString()} ليرة.`);
      }
    } else {
      // تنبيهات تغيير الحالة للمستخدم العادي
      cloudTxs.forEach(tx => {
        const oldTx = prev.find(p => p.id === tx.id);
        if (oldTx && oldTx.status !== tx.status) {
          const statusAr = tx.status === 'Completed' ? 'تم القبول ✅' : 'تم الرفض ❌';
          triggerNotification("تحديث حالة الطلب", `طلبكم (${tx.type}) أصبح حالته: ${statusAr}`);
        }
      });
    }

    const sortedTxs = [...cloudTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(sortedTxs);
    prevTransactionsRef.current = sortedTxs;
    
    const res = await getUserDataAction(phone);
    if (res.success && res.data) {
      setUserBalance(res.data.balance || 0);
      setProfileImage(res.data.profileImage || null);
      if (res.data.name) setUserName(res.data.name);
    }
  }, [ADMIN_PHONE, triggerNotification]);

  const checkPendingOrders = useCallback(async () => {
    if (!isLoggedIn || isCheckingOrders) return;
    const pendingOrders = transactions.filter(tx => tx.status === 'Pending' && tx.external_order_id);
    if (pendingOrders.length === 0) return;

    setIsCheckingOrders(true);
    for (const order of pendingOrders) {
      try {
        const res = await fetch(`/api/check-order?order_id=${order.external_order_id}`);
        const data = await res.json();
        if (data.success && data.status) {
          const remoteStatus = String(data.status).toLowerCase().trim();
          let finalStatus: 'Completed' | 'Rejected' | null = null;
          if (remoteStatus === 'accept' || remoteStatus === 'موافق' || remoteStatus === 'مقبول' || remoteStatus === 'نجاح') finalStatus = 'Completed';
          else if (remoteStatus === 'reject' || remoteStatus === 'رفض') finalStatus = 'Rejected';
          
          if (finalStatus) {
            const updateRes = await updateTransactionStatusServer(order.id, finalStatus, order.amount, order.userPhone || userPhone);
            if (updateRes.success) await fetchCloudData(userPhone);
          }
        }
      } catch (err) {}
    }
    setIsCheckingOrders(false);
  }, [isLoggedIn, isCheckingOrders, transactions, userPhone, fetchCloudData]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('shabik_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsLoggedIn(true);
      setUserPhone(authData.phone);
      setUserName(authData.name);
      fetchCloudData(authData.phone);
    }
  }, [fetchCloudData]);

  useEffect(() => {
    if (isLoggedIn) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(() => {
        fetchCloudData(userPhone);
        checkPendingOrders();
      }, 15000);
    }
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  }, [isLoggedIn, userPhone, fetchCloudData, checkPendingOrders]);

  const login = async (phone: string, password: string) => {
    if (phone === ADMIN_PHONE && password === ADMIN_PASS) {
      const adminData = { phone, name: "المدير العام", balance: 0 };
      setIsLoggedIn(true);
      setUserPhone(phone);
      setUserName(adminData.name);
      localStorage.setItem('shabik_auth', JSON.stringify(adminData));
      await fetchCloudData(phone); // جلب البيانات السحابية فور الدخول
      return { success: true, message: "تم تسجيل الدخول بصلاحيات الإدارة." };
    }
    const result = await signInAction(phone, password);
    if (result.success && result.user) {
      setIsLoggedIn(true);
      setUserPhone(result.user.phone);
      setUserName(result.user.name);
      localStorage.setItem('shabik_auth', JSON.stringify(result.user));
      await fetchCloudData(result.user.phone);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const register = async (phone: string, name: string, pass: string, refCode?: string) => {
    return await signUpAction(phone, name, pass, refCode);
  };

  const requestReset = async (phone: string) => {
    return await requestPasswordResetAction(phone);
  };

  const adminResetPassword = async (phone: string, requestId: string) => {
    const res = await completePasswordResetAction(phone, requestId);
    if (res.success) await fetchCloudData(userPhone);
  };

  const changePassword = async (currentPass: string, name: string) => {
    return await changePasswordAction(userPhone, currentPass, name);
  };

  const updateProfileImage = async (imageData: string) => {
    const res = await updateProfileImageAction(userPhone, imageData, userName);
    if (res.success) {
      setProfileImage(imageData);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const deductBalance = async (amount: number, productDetails: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const newBalance = Math.max(0, userBalance - amount);
    setUserBalance(newBalance);
    await syncBalanceAction(userPhone, newBalance);
    const txData: Omit<Transaction, 'id'> = {
      external_order_id: externalId || "",
      type: 'شراء منتج',
      amount,
      status: initialStatus,
      date: new Date().toLocaleString('ar-SY'),
      userName,
      userPhone,
      details: productDetails,
      balanceBefore: before,
      balanceAfter: newBalance
    };
    const result = await recordTransactionAction(txData);
    setTransactions(prev => [{ id: result.id || `${Date.now()}`, ...txData }, ...prev]);
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    const txData: Omit<Transaction, 'id'> = {
      type: 'إيداع محفظة',
      amount,
      status: 'Pending',
      date: new Date().toLocaleString('ar-SY'),
      userName,
      userPhone,
      details: "طلب إيداع رصيد للمحفظة",
      proofImage
    };
    const result = await recordTransactionAction(txData);
    setTransactions(prev => [{ id: result.id || `${Date.now()}`, ...txData }, ...prev]);
  };

  const adminAction = async (txId: string, action: 'approve' | 'reject') => {
    const res = await processAdminAction(txId, action);
    if (res.success) await fetchCloudData(userPhone);
  };

  const deleteUser = async (phone: string) => {
    const res = await deleteUserAction(phone);
    if (res.success) await fetchCloudData(userPhone);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPhone("");
    setUserName("");
    setUserBalance(0);
    setProfileImage(null);
    setTransactions([]);
    setAllUsers([]);
    setPasswordRequests([]);
    localStorage.removeItem('shabik_auth');
  };

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin: userPhone === ADMIN_PHONE, userPhone, userName, userBalance, profileImage, transactions, allUsers, passwordRequests,
      login, register, logout, deductBalance, requestDeposit, adminAction, deleteUser, requestReset, adminResetPassword,
      changePassword, updateProfileImage, currency, checkPendingOrders, notificationsEnabled, requestNotificationPermission
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
}
