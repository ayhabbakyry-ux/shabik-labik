
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from './firebase-config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  enableNetwork,
  orderBy,
  limit
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
 * @fileOverview محرك البيانات المطور - نظام حماية "فولاذي" ضد انهيار أجهزة سامسونج وسرعة استجابة للمدير.
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
  const transactionsRef = useRef<Transaction[]>([]);
  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";
  const NOTIFICATION_SOUND = "/shabik-labik.mp3";

  // دالة محمية تماماً لتشغيل الصوت دون التسبب بانهيار التطبيق
  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(() => {
        // تجاهل الخطأ إذا كان المتصفح يحظر التشغيل التلقائي
      });
    } catch (e) {}
  }, []);

  const triggerNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined") return;
    try {
      playNotificationSound();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { 
          body, 
          icon: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg'
        });
      }
    } catch (e) {}
  }, [playNotificationSound]);

  const unlockAudio = () => {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0;
      audio.play().then(() => setIsAudioUnlocked(true)).catch(() => {});
    } catch (e) {}
  };

  const refreshCloudData = useCallback(async () => {
    if (!isLoggedIn || !userPhone || typeof window === "undefined") return;
    try {
      const phoneClean = userPhone.trim();
      const isAdminUser = phoneClean === ADMIN_PHONE;

      // محاولة تنشيط الشبكة يدوياً لتخطي تعليق سامسونج
      await enableNetwork(db).catch(() => {});

      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean));
      const fetchPromises: Promise<any>[] = [getDocs(userQ)];
      
      if (isAdminUser) {
        // جلب متوازي للبيانات الأساسية فقط لضمان سرعة البرق
        fetchPromises.push(getDocs(collection(db, "users")));
        fetchPromises.push(getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(150))));
        fetchPromises.push(getDocs(collection(db, "password_requests")));
      } else {
        fetchPromises.push(getDocs(query(collection(db, "transactions"), where("userPhone", "==", phoneClean), orderBy("createdAt", "desc"))));
      }

      const results = await Promise.all(fetchPromises);
      
      if (!results[0].empty) {
        const data = results[0].docs[0].data();
        setUserBalance(Number(data.balance || 0));
        setProfileImage(data.profileImage || null);
      }

      if (isAdminUser) {
        setAllUsers(results[1].docs.map(d => ({ ...d.data(), id: d.id })));
        const txs = results[2].docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
        setTransactions(txs);
        transactionsRef.current = txs;
        setPasswordRequests(results[3].docs.map(d => ({ ...d.data(), id: d.id })));
      } else {
        const txs = results[1].docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
        setTransactions(txs);
        transactionsRef.current = txs;
      }
    } catch (e) {
      console.error("Manual refresh failed", e);
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

    // مستمع رصيد المستخدم
    unsubscribes.push(onSnapshot(query(collection(db, "users"), where("phone", "==", phoneClean)), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserBalance(Number(data.balance || 0));
        setProfileImage(data.profileImage || null);
      }
    }, (error) => {
        // معالجة صامتة لخطأ الاتصال في سامسونج
        console.warn("Connection lost, retrying...");
    }));

    // مستمع العمليات المالية اللحظي (نظام الإشعارات)
    const txQuery = isAdminUser 
      ? query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(100))
      : query(collection(db, "transactions"), where("userPhone", "==", phoneClean), orderBy("createdAt", "desc"));

    unsubscribes.push(onSnapshot(txQuery, (snap) => {
      const newTxs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      
      if (!isInitialLoad.current) {
        snap.docChanges().forEach((change) => {
          const tx = change.doc.data() as Transaction;
          const txId = change.doc.id;

          if (change.type === "added") {
            // إشعار للمدير بطلب إيداع جديد
            if (isAdminUser && tx.status === 'Pending' && (tx.type === 'إيداع محفظة' || tx.type === 'طلب إيداع')) {
              triggerNotification("طلب إيداع جديد 💰", `المبلغ: ${tx.amount.toLocaleString()} - العميل: ${tx.userName || tx.userPhone}`);
            }
          }

          if (change.type === "modified") {
            const oldTx = transactionsRef.current.find(t => t.id === txId);
            if (oldTx && oldTx.status === 'Pending' && tx.status !== 'Pending') {
              // إشعار للزبون بتحديث حالة طلبه (قبول أو رفض)
              if (!isAdminUser && tx.userPhone === phoneClean) {
                 if (tx.status === 'Completed') {
                   triggerNotification("تم قبول طلبك بنجاح ✅", `تم تنفيذ ${tx.type} بمبلغ ${tx.amount.toLocaleString()}.`);
                 } else if (tx.status === 'Rejected') {
                   triggerNotification("تم رفض طلبك ❌", `طلب ${tx.type} تم رفضه وعاد الرصيد لمحفظتك.`);
                 }
              }
            }
          }
        });
      }
      setTransactions(newTxs);
      transactionsRef.current = newTxs;
      isInitialLoad.current = false;
    }, (error) => {
        console.warn("Firestore snapshot error ignored for stability.");
    }));

    if (isAdminUser) {
      unsubscribes.push(onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }));
      unsubscribes.push(onSnapshot(collection(db, "password_requests"), (snap) => {
        setPasswordRequests(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }));
    }
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [isLoggedIn, userPhone, triggerNotification, refreshCloudData]);

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

  // الاستجابة اللحظية للمدير (Optimistic UI)
  const adminAction = async (id: string, action: 'approve' | 'reject') => {
    const previousTransactions = [...transactions];
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, status: action === 'approve' ? 'Completed' : 'Rejected' } : t
    ));
    try {
      const res = await processAdminAction(id, action);
      if (!res.success) throw new Error(res.message);
    } catch (error) {
      setTransactions(previousTransactions);
      alert("فشل تحديث الطلب، يرجى التحقق من الإنترنت.");
    }
  };

  const updateBalanceAdmin = async (phone: string, amount: number, operation: 'add' | 'subtract') => {
    const previousUsers = [...allUsers];
    setAllUsers(prev => prev.map(u => {
      if (u.phone === phone) {
        const cur = Number(u.balance || 0);
        return { ...u, balance: operation === 'add' ? cur + amount : Math.max(0, cur - amount) };
      }
      return u;
    }));
    try {
      const res = await updateUserBalanceDirectlyAction(phone, amount, operation);
      if (!res.success) throw new Error("Server error");
    } catch (error) {
      setAllUsers(previousUsers);
      alert("تعذر تعديل الرصيد حالياً.");
    }
  };

  const deductBalance = async (amount: number, details: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const now = new Date().toISOString();
    const newBal = Math.max(0, userBalance - amount);
    setUserBalance(newBal);
    try {
      await recordTransactionAction({
        external_order_id: externalId || "", type: 'طلب شحن', amount, status: initialStatus,
        date: now, createdAt: now, userName, userPhone, details, balanceBefore: before, balanceAfter: newBal
      });
      await syncBalanceAction(userPhone, newBal);
    } catch (e) {}
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    const now = new Date().toISOString();
    try {
      // محاولة الإرسال مع معالجة خطأ "Unexpected response" بشكل صامت
      const result = await recordTransactionAction({
        type: 'إيداع محفظة', amount, status: 'Pending', date: now, createdAt: now,
        userName, userPhone, details: "طلب إيداع رصيد", proofImage
      });
      if (!result.success) {
        if (result.error?.includes("unexpected response")) {
           alert("حدث تعليق بسيط في الاتصال، يرجى المحاولة مرة أخرى أو تحديث الصفحة.");
        } else {
           alert("الخطأ الحقيقي من السيرفر هو: " + result.error);
        }
      }
    } catch (error: any) { 
        console.error("Deposit request error", error);
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
      if (permission === "granted") unlockAudio();
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
