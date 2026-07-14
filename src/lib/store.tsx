
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from './firebase-config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  limit,
  enableNetwork,
  orderBy
} from 'firebase/firestore';
import { signInAction, signUpAction, requestPasswordResetAction } from '@/app/actions/auth';
import { syncBalanceAction, recordTransactionAction } from '@/app/actions/wallet';
import { 
  deleteUserAction, 
  processAdminAction, 
  updateTransactionStatusServer, 
  completePasswordResetAction,
  updateUserBalanceDirectlyAction
} from '@/app/actions/admin';
import { changePasswordAction, updateProfileImageAction } from '@/app/actions/profile';
import { Transaction } from './types';

/**
 * @fileOverview محرك البيانات البرقي - يضمن ظهور الرصيد والطلبات بلمح البصر عبر الجلب المتوازي.
 * تم تحديثه بنظام Optimistic UI للمدير ونظام إشعارات مضاد للانهيار.
 */

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
  updateBalanceAdmin: (phone: string, amount: number, operation: 'add' | 'subtract') => Promise<void>;
  deleteUser: (phone: string) => Promise<void>;
  requestReset: (phone: string) => Promise<{ success: boolean; message: string }>;
  adminResetPassword: (phone: string, requestId: string) => Promise<void>;
  changePassword: (currentPass: string, namePass: string) => Promise<{ success: boolean; message: string }>;
  updateProfileImage: (imageData: string) => Promise<{ success: boolean; message?: string }>;
  currency: string;
  checkPendingOrders: () => Promise<void>;
  notificationsEnabled: boolean;
  isNotificationSupported: boolean;
  requestNotificationPermission: () => void;
  refreshCloudData: () => Promise<void>;
  isAudioUnlocked: boolean;
  unlockAudio: () => void;
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
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  
  const isInitialLoad = useRef(true);
  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";
  const NOTIFICATION_SOUND = "/shabik-labik.mp3";

  // دالة الإشعار الصوتي الفوري - محمية 100% ضد انهيار أجهزة السامسونج والإنفينيكس
  const triggerNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined") return;
    
    // محرك الإشعارات الآمن - حماية قصوى ضد أخطاء الـ WebView
    try {
      // تشغيل الصوت مع معالجة صامتة للحظر (Silent Audio Fallback)
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(err => {
        console.log("Audio play safely blocked by browser policy:", err);
      });

      // إظهار إشعار النظام مع التحقق من الدعم (Environment Protection)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { 
          body, 
          icon: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg' 
        });
      }
    } catch (crashGuard) {
      // منع انهيار التطبيق في حال تعطل واجهات برمجة المتصفح (No UI Blocking)
      console.error("Notification system error suppressed for stability:", crashGuard);
    }
  }, []);

  const unlockAudio = () => {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0;
      audio.play().then(() => {
        setIsAudioUnlocked(true);
      }).catch(() => {});
    } catch (e) {}
  };

  const refreshCloudData = useCallback(async () => {
    if (!isLoggedIn || !userPhone || typeof window === "undefined") return;
    try {
      await enableNetwork(db).catch(() => {});
      const phoneClean = userPhone.trim();
      const isAdminUser = phoneClean === ADMIN_PHONE;

      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean), limit(1));
      
      const fetchPromises: Promise<any>[] = [getDocs(userQ)];
      
      if (isAdminUser) {
        fetchPromises.push(getDocs(collection(db, "users")));
        fetchPromises.push(getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(100))));
        fetchPromises.push(getDocs(collection(db, "password_requests")));
      } else {
        fetchPromises.push(getDocs(query(collection(db, "transactions"), where("userPhone", "==", phoneClean), orderBy("createdAt", "desc"), limit(50))));
      }

      const results = await Promise.all(fetchPromises);
      
      if (!results[0].empty) {
        const data = results[0].docs[0].data();
        setUserBalance(Number(data.balance || 0));
        setProfileImage(data.profileImage || null);
      }

      if (isAdminUser) {
        setAllUsers(results[1].docs.map(d => ({ ...d.data(), id: d.id })));
        setTransactions(results[2].docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[]);
        setPasswordRequests(results[3].docs.map(d => ({ ...d.data(), id: d.id })));
      } else {
        setTransactions(results[1].docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[]);
      }

    } catch (e) {
      console.error("Rapid Sync Failure:", e);
    }
  }, [isLoggedIn, userPhone]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shabik_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        setIsLoggedIn(true);
        setUserPhone(parsed.phone);
        setUserName(parsed.name);
      }
      if ('Notification' in window) {
        setIsNotificationSupported(true);
        setNotificationsEnabled(Notification.permission === "granted");
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !userPhone || typeof window === "undefined") return;
    
    refreshCloudData();

    const unsubscribes: (() => void)[] = [];
    const phoneClean = userPhone.trim();
    const isAdminUser = phoneClean === ADMIN_PHONE;

    const unsubUser = onSnapshot(query(collection(db, "users"), where("phone", "==", phoneClean)), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserBalance(Number(data.balance || 0));
        setProfileImage(data.profileImage || null);
      }
    });
    unsubscribes.push(unsubUser);

    const txQuery = isAdminUser 
      ? query(collection(db, "transactions"), limit(50))
      : query(collection(db, "transactions"), where("userPhone", "==", phoneClean), limit(20));

    const unsubTxs = onSnapshot(txQuery, (snap) => {
      const newTxs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      newTxs.sort((a, b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || ""));

      if (!isInitialLoad.current) {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            const tx = change.doc.data() as Transaction;
            if (isAdminUser && tx.status === 'Pending' && (tx.type === 'إيداع محفظة' || tx.type === 'طلب إيداع')) {
              triggerNotification("طلب إيداع جديد 💰", `المبلغ: ${tx.amount.toLocaleString()} - العميل: ${tx.userName}`);
            }
          }
          if (change.type === "modified") {
            const tx = change.doc.data() as Transaction;
            if (!isAdminUser && tx.status !== 'Pending') {
              triggerNotification(
                tx.status === 'Completed' ? "تم قبول طلبك ✅" : "تم رفض الطلب ❌",
                `الخدمة: ${tx.type} - رصيدك الآن: ${userBalance} ل.س.ج`
              );
            }
          }
        });
      }
      setTransactions(newTxs);
      isInitialLoad.current = false;
    });
    unsubscribes.push(unsubTxs);

    if (isAdminUser) {
      const unsubAllUsers = onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      });
      unsubscribes.push(unsubAllUsers);

      const unsubPassReq = onSnapshot(collection(db, "password_requests"), (snap) => {
        setPasswordRequests(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      });
      unsubscribes.push(unsubPassReq);
    }
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [isLoggedIn, userPhone, triggerNotification, refreshCloudData, userBalance]);

  const login = async (phone: string, password: string) => {
    const phoneClean = phone.trim();
    if (phoneClean === ADMIN_PHONE && password === ADMIN_PASS) {
      const data = { phone: phoneClean, name: "المدير العام" };
      setIsLoggedIn(true); setUserPhone(phoneClean); setUserName(data.name);
      if (typeof window !== "undefined") localStorage.setItem('shabik_auth', JSON.stringify(data));
      return { success: true, message: "مرحباً بك يا مدير." };
    }
    const result = await signInAction(phoneClean, password);
    if (result.success && result.user) {
      setIsLoggedIn(true); setUserPhone(result.user.phone); setUserName(result.user.name);
      if (typeof window !== "undefined") localStorage.setItem('shabik_auth', JSON.stringify(result.user));
    }
    return result;
  };

  const logout = () => {
    setIsLoggedIn(false); setUserPhone("");
    if (typeof window !== "undefined") localStorage.removeItem('shabik_auth');
  };

  const deductBalance = async (amount: number, details: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const now = new Date().toISOString();
    const newBal = Math.max(0, userBalance - amount);
    setUserBalance(newBal);
    try {
      const res = await recordTransactionAction({
        external_order_id: externalId || "", type: 'طلب شحن', amount, status: initialStatus,
        date: now, createdAt: now, userName, userPhone, details, balanceBefore: before, balanceAfter: newBal
      });
      await syncBalanceAction(userPhone, newBal);
    } catch (e: any) { console.error("Deduct Error:", e); }
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    const now = new Date().toISOString();
    try {
      await recordTransactionAction({
        type: 'إيداع محفظة', amount, status: 'Pending', date: now, createdAt: now,
        userName, userPhone, details: "طلب إيداع رصيد", proofImage
      });
    } catch (error: any) { alert("عطل في الفايربيز: " + error.message); }
  };

  /**
   * TASK 1: Instant Manager Data Update (Optimistic UI)
   * يضمن استجابة فورية للمدير العام بغض النظر عن قوة الإنترنت.
   */
  const adminAction = async (id: string, action: 'approve' | 'reject') => {
    // حفظ الحالة الحالية للرجوع إليها في حال الفشل
    const previousTransactions = [...transactions];
    
    // التحديث المحلي الفوري (Millisecond Update)
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, status: action === 'approve' ? 'Completed' : 'Rejected' } : t
    ));

    try {
      const res = await processAdminAction(id, action);
      if (!res.success) throw new Error(res.message);
    } catch (error: any) {
      // التراجع التلقائي (Graceful Rollback)
      setTransactions(previousTransactions);
      console.error("Optimistic Action Failed:", error);
      alert("فشل تحديث البيانات في السيرفر بسبب اتصال الشبكة. تم التراجع عن التغيير المحلي.");
    }
  };

  /**
   * Optimistic UI لتعديل الرصيد
   */
  const updateBalanceAdmin = async (phone: string, amount: number, operation: 'add' | 'subtract') => {
    const previousUsers = [...allUsers];
    
    // تحديث محلي فوري
    setAllUsers(prev => prev.map(u => {
      if (u.phone === phone) {
        const currentBal = Number(u.balance || 0);
        const newBal = operation === 'add' ? currentBal + amount : Math.max(0, currentBal - amount);
        return { ...u, balance: newBal };
      }
      return u;
    }));

    try {
      const res = await updateUserBalanceDirectlyAction(phone, amount, operation);
      if (!res.success) throw new Error("Update failed on server");
    } catch (error) {
      // استعادة الحالة السابقة
      setAllUsers(previousUsers);
      alert("تعذر تحديث رصيد العميل في السيرفر حالياً. يرجى مراجعة الاتصال.");
    }
  };

  const deleteUser = async (p: string) => { await deleteUserAction(p); };
  const requestReset = async (p: string) => await requestPasswordResetAction(p);
  const adminResetPassword = async (p: string, r: string) => { await completePasswordResetAction(p, r); };
  const changePassword = async (c: string, n: string) => await changePasswordAction(userPhone, c, n);
  const updateProfileImage = async (i: string) => await updateProfileImageAction(userPhone, i, userName);
  
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
      if (permission === "granted") {
        unlockAudio();
      }
    }
  };

  const checkPendingOrders = async () => {
    if (!isLoggedIn || isCheckingOrders) return;
    const pending = transactions.filter(tx => tx.status === 'Pending' && tx.external_order_id);
    if (pending.length === 0) return;
    setIsCheckingOrders(true);
    for (const order of pending) {
      try {
        const res = await fetch(`/api/check-order?order_id=${order.external_order_id}`);
        const data = await res.json();
        if (data.success && data.status) {
          const remote = String(data.status).toLowerCase().trim();
          let final: 'Completed' | 'Rejected' | null = null;
          if (['accept', 'موافق', 'success', 'completed'].includes(remote)) final = 'Completed';
          else if (['reject', 'failed'].includes(remote)) final = 'Rejected';
          if (final) await updateTransactionStatusServer(order.id, final, order.amount, order.userPhone || userPhone);
        }
      } catch (err) {}
    }
    setIsCheckingOrders(false);
  };

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin: userPhone.trim() === ADMIN_PHONE, userPhone, userName, userBalance, profileImage, transactions, allUsers, passwordRequests,
      login, register: signUpAction, logout, deductBalance, requestDeposit, adminAction, updateBalanceAdmin, deleteUser, requestReset, adminResetPassword,
      changePassword, updateProfileImage, currency, checkPendingOrders, notificationsEnabled, isNotificationSupported, requestNotificationPermission, refreshCloudData,
      isAudioUnlocked, unlockAudio
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser missing');
  return context;
}
