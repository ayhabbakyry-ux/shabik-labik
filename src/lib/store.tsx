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
  disableNetwork
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

  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined" || !isAudioUnlocked) return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [isAudioUnlocked]);

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

  const triggerNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined") return;
    playNotificationSound();
    try {
      if ('Notification' in window && Notification.permission === "granted") {
        new Notification(title, { body });
      }
    } catch (e) {}
  }, [playNotificationSound]);

  const refreshCloudData = useCallback(async () => {
    if (!isLoggedIn || !userPhone) return;
    try {
      const phoneClean = userPhone.trim();
      
      // إجبار الفايربيز على محاولة الاتصال مجدداً إذا كان في وضع الـ Offline
      await enableNetwork(db).catch(() => {});

      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean), limit(1));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        setUserBalance(data.balance || 0);
        setProfileImage(data.profileImage || null);
      }
      const txQuery = (phoneClean === ADMIN_PHONE) 
        ? query(collection(db, "transactions"), limit(150))
        : query(collection(db, "transactions"), where("userPhone", "==", phoneClean), limit(100));
      
      const txSnap = await getDocs(txQuery);
      const manualTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      manualTxs.sort((a, b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || ""));
      setTransactions(manualTxs);
    } catch (e) {
      console.error("Refresh Error:", e);
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
    const unsubscribes: (() => void)[] = [];
    const phoneClean = userPhone.trim();
    const isAdminUser = phoneClean === ADMIN_PHONE;

    const unsubUser = onSnapshot(query(collection(db, "users"), where("phone", "==", phoneClean)), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserBalance(data.balance || 0);
        setProfileImage(data.profileImage || null);
      }
    }, (error) => {
      console.warn("Firestore Listen Error (User):", error);
    });
    unsubscribes.push(unsubUser);

    const txQuery = isAdminUser 
      ? query(collection(db, "transactions"), limit(150))
      : query(collection(db, "transactions"), where("userPhone", "==", phoneClean), limit(100));

    const unsubTxs = onSnapshot(txQuery, (snap) => {
      const newTxs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      newTxs.sort((a, b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || ""));

      if (!isInitialLoad.current) {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            const tx = change.doc.data() as Transaction;
            if (isAdminUser && tx.status === 'Pending' && (tx.type === 'إيداع محفظة' || tx.type === 'طلب إيداع')) {
              triggerNotification("طلب إيداع جديد 💰", `من: ${tx.userName || tx.userPhone} بقيمة ${tx.amount.toLocaleString()}`);
            }
          }
        });
      }
      setTransactions(newTxs);
      isInitialLoad.current = false;
    }, (error) => {
      console.warn("Firestore Listen Error (Transactions):", error);
    });
    unsubscribes.push(unsubTxs);

    if (isAdminUser) {
      unsubscribes.push(onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }, (e) => console.warn(e)));
      unsubscribes.push(onSnapshot(collection(db, "password_requests"), (snap) => {
        setPasswordRequests(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }, (e) => console.warn(e)));
    }
    return () => unsubscribes.forEach(unsub => unsub());
  }, [isLoggedIn, userPhone, triggerNotification]);

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
      if (!res.success && typeof window !== "undefined") alert("الخطأ الحقيقي من السيرفر هو: " + res.error);
      await syncBalanceAction(userPhone, newBal);
    } catch (e: any) { if (typeof window !== "undefined") alert("عطل في الاتصال: " + e.message); }
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    const now = new Date().toISOString();
    try {
      const result = await recordTransactionAction({
        type: 'إيداع محفظة', amount, status: 'Pending', date: now, createdAt: now,
        userName, userPhone, details: "طلب إيداع رصيد", proofImage
      });
      if (!result.success) {
        if (typeof window !== "undefined") alert("الخطأ الحقيقي من السيرفر هو: " + result.error);
        return;
      }
    } catch (error: any) { if (typeof window !== "undefined") alert("عطل في الفايربيز: " + error.message); }
  };

  const adminAction = async (id: string, action: 'approve' | 'reject') => { await processAdminAction(id, action); };
  const updateBalanceAdmin = async (p: string, a: number, o: 'add' | 'subtract') => { await updateUserBalanceDirectlyAction(p, a, o); };
  const deleteUser = async (p: string) => { await deleteUserAction(p); };
  const requestReset = async (p: string) => await requestPasswordResetAction(p);
  const adminResetPassword = async (p: string, r: string) => { await completePasswordResetAction(p, r); };
  const changePassword = async (c: string, n: string) => await changePasswordAction(userPhone, c, n);
  const updateProfileImage = async (i: string) => await updateProfileImageAction(userPhone, i, userName);
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
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
          if (['accept', 'موافق', 'مقبول', 'success', 'completed'].includes(remote)) final = 'Completed';
          else if (['reject', 'رفض', 'failed'].includes(remote)) final = 'Rejected';
          if (final) await updateTransactionStatusServer(order.id, final, order.amount, order.userPhone || userPhone);
        }
      } catch (err) {}
    }
    setIsCheckingOrders(false);
  };

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin: userPhone === ADMIN_PHONE, userPhone, userName, userBalance, profileImage, transactions, allUsers, passwordRequests,
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
