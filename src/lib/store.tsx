
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
  orderBy,
  getDocFromCache,
  getDocsFromCache
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
 * @fileOverview محرك البيانات والاشعارات المطور - نظام ربط لحظي كامل للمدير والزبائن.
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

  const triggerNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined") return;
    try {
      // تشغيل نغمة شبيك لبيك المعتمدة
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(err => console.log("Audio play blocked, needs interaction", err));

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { 
          body, 
          icon: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg',
          badge: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg'
        });
      }
    } catch (e) {
      console.error("Notification trigger error", e);
    }
  }, []);

  const unlockAudio = () => {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0;
      audio.play().then(() => {
        setIsAudioUnlocked(true);
        console.log("Audio unlocked successfully");
      }).catch(() => {});
    } catch (e) {}
  };

  const refreshCloudData = useCallback(async () => {
    if (!isLoggedIn || !userPhone || typeof window === "undefined") return;
    try {
      const phoneClean = userPhone.trim();
      const isAdminUser = phoneClean === ADMIN_PHONE;

      await enableNetwork(db).catch(() => {});

      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean), limit(1));
      const fetchPromises: Promise<any>[] = [getDocs(userQ)];
      
      if (isAdminUser) {
        fetchPromises.push(getDocs(query(collection(db, "users"), limit(200))));
        fetchPromises.push(getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(100))));
        fetchPromises.push(getDocs(query(collection(db, "password_requests"), limit(50))));
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
      console.error("Rapid Sync Error:", e);
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

    unsubscribes.push(onSnapshot(query(collection(db, "users"), where("phone", "==", phoneClean)), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserBalance(Number(data.balance || 0));
        setProfileImage(data.profileImage || null);
      }
    }));

    const txQuery = isAdminUser 
      ? query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(100))
      : query(collection(db, "transactions"), where("userPhone", "==", phoneClean), orderBy("createdAt", "desc"), limit(50));

    unsubscribes.push(onSnapshot(txQuery, (snap) => {
      const newTxs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      
      if (!isInitialLoad.current) {
        snap.docChanges().forEach((change) => {
          const tx = change.doc.data() as Transaction;
          const txId = change.doc.id;

          // 1. للمدير: إشعار عند وصول إيداع جديد
          if (change.type === "added") {
            if (isAdminUser && tx.status === 'Pending' && (tx.type === 'إيداع محفظة' || tx.type === 'طلب إيداع')) {
              triggerNotification("طلب إيداع جديد 💰", `المبلغ: ${tx.amount.toLocaleString()} - العميل: ${tx.userName || tx.userPhone}`);
            }
          }

          // 2. للزبون: إشعار عند تغيير حالة الطلب (قبول أو رفض)
          if (change.type === "modified") {
            if (!isAdminUser) {
              const oldTx = transactionsRef.current.find(t => t.id === txId);
              if (oldTx && oldTx.status === 'Pending' && tx.status !== 'Pending') {
                if (tx.status === 'Completed') {
                  triggerNotification("تم قبول طلبك بنجاح ✅", `تم تنفيذ ${tx.type} بمبلغ ${tx.amount.toLocaleString()}. رصيدك تم تحديثه.`);
                } else if (tx.status === 'Rejected') {
                  triggerNotification("عذراً، تم رفض طلبك ❌", `طلب ${tx.type} تم رفضه وعاد الرصيد لمحفظتك.`);
                }
              }
            }
          }
        });
      }
      setTransactions(newTxs);
      transactionsRef.current = newTxs;
      isInitialLoad.current = false;
    }));

    if (isAdminUser) {
      unsubscribes.push(onSnapshot(query(collection(db, "users"), limit(200)), (snap) => {
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
      alert("تعذر تحديث السيرفر، تم التراجع عن التغيير المحلي.");
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
      alert("فشل تحديث الرصيد في السيرفر.");
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
      const result = await recordTransactionAction({
        type: 'إيداع محفظة', amount, status: 'Pending', date: now, createdAt: now,
        userName, userPhone, details: "طلب إيداع رصيد", proofImage
      });
      if (!result.success) alert("الخطأ الحقيقي من السيرفر هو: " + result.error);
    } catch (error: any) { alert("عطل في الفايربيز: " + error.message); }
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
