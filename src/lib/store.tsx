"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db, getMessagingSafe } from './firebase-config';
import { getToken } from 'firebase/messaging';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  enableNetwork,
  disableNetwork,
  doc,
  updateDoc
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
 * @fileOverview محرك البيانات المطور - نسخة الاستقرار (V17): حل مشكلة السامسونج من الجذور وتأمين المزامنة.
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

  // دالة الفرز في الذاكرة لمنع خطأ Index Error
  const sortTransactionsClientSide = useCallback((txs: Transaction[]) => {
    return [...txs].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA; 
    });
  }, []);

  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(() => {});
    } catch (e) {}
  }, []);

  const triggerNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined") return;
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { 
          body, 
          icon: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg'
        });
      }
      playNotificationSound();
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

  // --- FCM INFRASTRUCTURE (ISOLATED) ---
  const triggerPush = useCallback(async (targetPhone: string, title: string, body: string) => {
    try {
      const q = query(collection(db, "users"), where("phone", "==", targetPhone.trim()));
      const snap = await getDocs(q);
      if (snap.empty) return;
      const token = snap.docs[0].data().fcmToken;
      if (!token) return;

      fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, title, body })
      }).catch(() => {});
    } catch (e) {}
  }, []);

  const setupFCM = useCallback(async (phone: string) => {
    if (typeof window === "undefined") return;
    try {
      const messaging = await getMessagingSafe();
      if (!messaging) return;

      setTimeout(async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
            const token = await getToken(messaging, { 
              serviceWorkerRegistration: registration,
              vapidKey: "BHPJ_A1A1A1A1A1A1A1A1_DUMMY_VAPID_REPLACE" 
            });
            
            if (token) {
              const q = query(collection(db, "users"), where("phone", "==", phone.trim()));
              const snap = await getDocs(q);
              if (!snap.empty) {
                await updateDoc(doc(db, "users", snap.docs[0].id), { fcmToken: token });
              }
            }
          }
        } catch (innerError) {}
      }, 3000);
    } catch (e) {}
  }, []);
  // -------------------------------------

  const refreshCloudData = useCallback(async () => {
    if (!isLoggedIn || !userPhone || typeof window === "undefined") return;
    try {
      const phoneClean = userPhone.trim();
      const isAdminUser = phoneClean === ADMIN_PHONE;

      await enableNetwork(db).catch(() => {});

      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean));
      const fetchPromises: Promise<any>[] = [getDocs(userQ)];
      
      if (isAdminUser) {
        fetchPromises.push(getDocs(collection(db, "users")));
        fetchPromises.push(getDocs(collection(db, "transactions")));
        fetchPromises.push(getDocs(collection(db, "password_requests")));
      } else {
        fetchPromises.push(getDocs(query(collection(db, "transactions"), where("userPhone", "==", phoneClean))));
      }

      const results = await Promise.all(fetchPromises);
      
      if (!results[0].empty) {
        const data = results[0].docs[0].data();
        setUserBalance(Number(data.balance || 0));
        setProfileImage(data.profileImage || null);
      }

      if (isAdminUser) {
        setAllUsers(results[1].docs.map(d => ({ ...d.data(), id: d.id })));
        const rawTxs = results[2].docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
        setTransactions(sortTransactionsClientSide(rawTxs));
        setPasswordRequests(results[3].docs.map(d => ({ ...d.data(), id: d.id })));
      } else {
        const rawTxs = results[1].docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
        setTransactions(sortTransactionsClientSide(rawTxs));
      }
    } catch (e: any) {
      console.error("Critical Refresh Error:", e.message);
      if (e.message.includes("unexpected response")) {
         await disableNetwork(db).catch(() => {});
         await enableNetwork(db).catch(() => {});
      }
    }
  }, [isLoggedIn, userPhone, sortTransactionsClientSide]);

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
    setupFCM(userPhone);

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
      ? query(collection(db, "transactions"))
      : query(collection(db, "transactions"), where("userPhone", "==", phoneClean));

    unsubscribes.push(onSnapshot(txQuery, (snap) => {
      try {
        const rawTxs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
        const sortedTxs = sortTransactionsClientSide(rawTxs);
        
        if (!isInitialLoad.current) {
          snap.docChanges().forEach((change) => {
            const tx = change.doc.data() as Transaction;
            if (change.type === "added" && isAdminUser && tx.status === 'Pending') {
              triggerNotification("طلب إيداع جديد 💰", `المبلغ: ${tx.amount.toLocaleString()} - العميل: ${tx.userName || tx.userPhone}`);
            }
            if (change.type === "modified" && !isAdminUser && tx.userPhone === phoneClean) {
              triggerNotification(tx.status === 'Completed' ? "تم قبول طلبك ✅" : "تم رفض الطلب ❌", `طلب ${tx.type} بمبلغ ${tx.amount.toLocaleString()}.`);
            }
          });
        }
        
        setTransactions(sortedTxs);
        isInitialLoad.current = false;
      } catch (e) {}
    }, (err) => {
       if (err.message.includes("unexpected response")) {
         enableNetwork(db);
       }
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
  }, [isLoggedIn, userPhone, triggerNotification, refreshCloudData, sortTransactionsClientSide, setupFCM]);

  const login = async (phone: string, password: string) => {
    const phoneClean = phone.trim();
    if (phoneClean === ADMIN_PHONE && password === ADMIN_PASS) {
      const data = { phone: phoneClean, name: "المدير العام" };
      setIsLoggedIn(true); setUserPhone(phoneClean); setUserName(data.name);
      localStorage.setItem('shabik_auth', JSON.stringify(data));
      return { success: true, message: "مرحباً بك يا مدير." };
    }
    const result = await signInAction(phoneClean, password);
    if (result.success && result.user) {
      setIsLoggedIn(true); setUserPhone(result.user.phone); setUserName(result.user.name);
      localStorage.setItem('shabik_auth', JSON.stringify(result.user));
    }
    return result;
  };

  const logout = () => {
    setIsLoggedIn(false); setUserPhone("");
    localStorage.removeItem('shabik_auth');
  };

  const adminAction = async (id: string, action: 'approve' | 'reject') => {
    const prev = [...transactions];
    setTransactions(prev.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'Completed' : 'Rejected' } : t));
    try {
      const res = await processAdminAction(id, action);
      if (!res.success) throw new Error();

      // PUSH TRIGGER TO USER
      const tx = transactions.find(t => t.id === id);
      if (tx && tx.userPhone) {
         triggerPush(tx.userPhone, action === 'approve' ? "تم قبول طلبك ✅" : "تم رفض الطلب ❌", `طلب ${tx.type} بمبلغ ${tx.amount.toLocaleString()}.`);
      }
    } catch (e) {
      setTransactions(prev);
      alert("❌ فشل الاتصال بالسيرفر، سيتم التراجع.");
    }
  };

  const updateBalanceAdmin = async (phone: string, amount: number, operation: 'add' | 'subtract') => {
    const prev = [...allUsers];
    setAllUsers(prev.map(u => u.phone === phone ? { ...u, balance: operation === 'add' ? (u.balance || 0) + amount : Math.max(0, (u.balance || 0) - amount) } : u));
    try {
      const res = await updateUserBalanceDirectlyAction(phone, amount, operation);
      if (!res.success) throw new Error();
    } catch (e) {
      setAllUsers(prev);
      alert("❌ فشل تحديث الرصيد.");
    }
  };

  const deductBalance = async (amount: number, productDetails: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const newBal = Math.max(0, userBalance - amount);
    setUserBalance(newBal);
    try {
      const result = await recordTransactionAction({
        external_order_id: externalId || "", type: 'طلب شحن', amount, status: initialStatus,
        date: new Date().toISOString(), createdAt: new Date().toISOString(), userName, userPhone, details: productDetails, balanceBefore: before, balanceAfter: newBal
      });
      if (!result.success) throw new Error();
      await syncBalanceAction(userPhone, newBal);
    } catch (e: any) {
      setUserBalance(before);
      alert("🚨 خطأ تقني في جلب سجل الطلبات: " + (e.message || e));
    }
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    try {
      const result = await recordTransactionAction({
        type: 'إيداع محفظة', amount, status: 'Pending', date: new Date().toISOString(), createdAt: new Date().toISOString(),
        userName, userPhone, details: "طلب إيداع رصيد", proofImage
      });
      
      if (result.success) {
        playNotificationSound();
        await refreshCloudData();
        
        // PUSH TRIGGER TO ADMIN
        triggerPush(ADMIN_PHONE, "طلب إيداع جديد 💰", `المبلغ: ${amount.toLocaleString()} - العميل: ${userName || userPhone}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) { 
        if (String(error).includes("unexpected response")) {
           alert("⚠️ تنبيه: تم تسجيل طلبك ولكن تعذر تحديث الصفحة حالياً بسبب ضعف الشبكة. سيتم تفعيل رصيدك قريباً.");
        } else {
           alert("🚨 حدث خطأ أثناء إرسال الطلب: " + (error.message || error));
        }
    }
  };

  const deleteUser = async (p: string) => { await deleteUserAction(p); };
  const requestReset = async (p: string) => await requestPasswordResetAction(p);
  const adminResetPassword = async (p: string, r: string) => { await completePasswordResetAction(p, r); };
  const changePassword = async (c: string, n: string) => await changePasswordAction(userPhone, c, n);
  const updateProfileImage = async (i: string) => await updateProfileImageAction(userPhone, i, userName);
  
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === "granted");
        if (permission === "granted") unlockAudio();
      } catch (e) {}
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
          else if (['reject', 'failed', 'رفض'].includes(remote)) final = 'Rejected';
          
          if (final) {
            await updateTransactionStatusServer(order.id, final, order.amount, order.userPhone || userPhone);
            // PUSH TRIGGER TO USER
            triggerPush(order.userPhone || userPhone, final === 'Completed' ? "اكتمل طلب الشحن ✅" : "فشل طلب الشحن ❌", `تم تحديث حالة طلبك لـ ${order.type}.`);
          }
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