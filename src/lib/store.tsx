
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
  doc,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { signInAction, signUpAction, requestPasswordResetAction, signOutAction } from '@/app/actions/auth';
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
  triggerPushSilently: (targetPhone: string, title: string, body: string, url?: string) => void;
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
  const currency = "SYP";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";
  const NOTIFICATION_SOUND = "/shabik-labik.mp3";

  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined" || !isAudioUnlocked) return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(() => {});
    } catch (e) {}
  }, [isAudioUnlocked]);

  const triggerPushSilently = useCallback((targetPhone: string, title: string, body: string, url?: string) => {
    if (typeof window === "undefined") return;
    
    (async () => {
      try {
        const phoneClean = targetPhone.trim();
        const userQ = query(collection(db, "users"), where("phone", "==", phoneClean));
        const snap = await getDocs(userQ);
        if (snap.empty) return;
        
        const userData = snap.docs[0].data();
        const token = userData.fcmToken;
        if (!token) return;

        fetch('/api/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, title, body, url })
        }).catch(() => {});
      } catch (e) {}
    })();
  }, []);

  const unlockAudio = () => {
    if (typeof window === "undefined") return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0;
      audio.play().then(() => setIsAudioUnlocked(true)).catch(() => {});
    } catch (e) {}
  };

  const setupFCM = useCallback(async (phone: string) => {
    if (typeof window === "undefined" || !('serviceWorker' in navigator)) return;
    try {
      const messaging = await getMessagingSafe();
      if (!messaging) return;
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;
      
      const token = await getToken(messaging, { 
        serviceWorkerRegistration: registration,
        vapidKey: "BDR4_Xp_T_p7_S_p_X_8_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X_X"
      });

      if (token) {
        const q = query(collection(db, "users"), where("phone", "==", phone.trim()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, "users", snap.docs[0].id), { fcmToken: token });
          setNotificationsEnabled(true);
        }
      }
    } catch (e) {}
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          unlockAudio();
          if (userPhone) await setupFCM(userPhone);
          setNotificationsEnabled(true);
        }
      } catch (e) {}
    }
  };

  const refreshCloudData = useCallback(async () => {
    if (!isLoggedIn || !userPhone || typeof window === "undefined") return;
    try {
      const phoneClean = userPhone.trim();
      const isAdminUser = phoneClean === ADMIN_PHONE;
      await enableNetwork(db).catch(() => {});

      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean));
      const results = await getDocs(userQ);
      if (!results.empty) {
        const data = results.docs[0].data();
        setUserBalance(Number(data.balance || 0));
        setProfileImage(data.profileImage || null);
        if (data.fcmToken) setNotificationsEnabled(true);
      }

      const txQ = isAdminUser 
        ? query(collection(db, "transactions"))
        : query(collection(db, "transactions"), where("userPhone", "==", phoneClean));
      
      const txSnap = await getDocs(txQ);
      const rawTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      setTransactions([...rawTxs].sort((a,b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || "")));

      if (isAdminUser) {
        const allUsersSnap = await getDocs(collection(db, "users"));
        setAllUsers(allUsersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const passSnap = await getDocs(collection(db, "password_requests"));
        setPasswordRequests(passSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {}
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
      ? query(collection(db, "transactions"))
      : query(collection(db, "transactions"), where("userPhone", "==", phoneClean));

    unsubscribes.push(onSnapshot(txQuery, (snap) => {
      const rawTxs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      if (!isInitialLoad.current) {
        snap.docChanges().forEach((change) => {
          if (change.type === "added" && isAdminUser && change.doc.data().status === 'Pending') {
            playNotificationSound();
          }
        });
      }
      setTransactions([...rawTxs].sort((a,b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || "")));
      isInitialLoad.current = false;
    }));

    if (isAdminUser) {
      unsubscribes.push(onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));
      unsubscribes.push(onSnapshot(collection(db, "password_requests"), (snap) => {
        setPasswordRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));
    }

    return () => unsubscribes.forEach(unsub => unsub());
  }, [isLoggedIn, userPhone, playNotificationSound, refreshCloudData]);

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

  const logout = async () => {
    if (userPhone) {
      await signOutAction(userPhone);
    }
    setIsLoggedIn(false); 
    setUserPhone("");
    localStorage.removeItem('shabik_auth');
  };

  const adminAction = async (id: string, action: 'approve' | 'reject') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    const res = await processAdminAction(id, action);
    if (res.success && tx.userPhone) {
      const title = action === 'approve' ? "✅ تم قبول الإيداع" : "❌ طلب مرفوض";
      const body = action === 'approve' ? `تمت إضافة ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ل.س لرصيدك.` : "نعتذر، تم رفض طلب الإيداع.";
      triggerPushSilently(tx.userPhone, title, body, "/wallet");
    }
  };

  const updateBalanceAdmin = async (phone: string, amount: number, operation: 'add' | 'subtract') => {
    const res = await updateUserBalanceDirectlyAction(phone, amount, operation);
    if (res.success) {
      triggerPushSilently(phone, "💰 تحديث رصيد", `تم ${operation === 'add' ? 'إضافة' : 'سحب'} مبلغ من حسابك.`, "/wallet");
    }
  };

  const deductBalance = async (amount: number, productDetails: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const newBal = Math.max(0, userBalance - amount);
    
    // تحديث الحالة المحلية فوراً لتجربة مستخدم سريعة
    setUserBalance(newBal);

    try {
      const phoneClean = userPhone.trim();
      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean));
      const userSnap = await getDocs(userQ);
      
      if (!userSnap.empty) {
        const userDocRef = doc(db, "users", userSnap.docs[0].id);
        // التحديث الفعلي في السيرفر لخصم الرصيد من حساب الزبون (حجز الرصيد)
        await updateDoc(userDocRef, { balance: newBal });
      }

      const now = new Date().toISOString();
      // تسجيل المعاملة في السجل لضمان الشفافية
      await addDoc(collection(db, "transactions"), {
        external_order_id: externalId || "",
        type: 'طلب شحن',
        amount,
        status: initialStatus,
        date: now,
        createdAt: now,
        userName,
        userPhone: phoneClean,
        details: productDetails,
        balanceBefore: before,
        balanceAfter: newBal
      });
      
      triggerPushSilently(ADMIN_PHONE, "🚀 طلب شحن جديد", `قام ${userName} بطلب شحن جديد.`, "/admin");
    } catch (e) {
      console.error("Critical: Failed to persist deduction in Firestore", e);
      // التراجع عن التحديث المحلي في حال فشل السيرفر لضمان دقة البيانات
      setUserBalance(before);
      throw e;
    }
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    const now = new Date().toISOString();
    await addDoc(collection(db, "transactions"), {
      type: 'إيداع محفظة',
      amount,
      status: 'Pending',
      date: now,
      createdAt: now,
      userName,
      userPhone: userPhone.trim(),
      details: "طلب إيداع رصيد جديد",
      proofImage
    });
    triggerPushSilently(ADMIN_PHONE, "💳 إيداع جديد وصل!", `قام ${userName} بإرسال ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ل.س.`, "/admin");
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
          if (['accept', 'موافق', 'success', 'completed', 'مكتمل'].includes(remote)) final = 'Completed';
          else if (['reject', 'failed', 'رفض', 'مرفوض'].includes(remote)) final = 'Rejected';
          if (final) {
            await updateTransactionStatusServer(order.id, final, order.amount, order.userPhone || userPhone);
            triggerPushSilently(order.userPhone || userPhone, final === 'Completed' ? "✨ شحن مكتمل" : "⚠️ فشل شحن", "يرجى مراجعة سجل الطلبات.", "/history");
          }
        }
      } catch (err) {}
    }
    setIsCheckingOrders(false);
  };

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin: userPhone.trim() === ADMIN_PHONE, userPhone, userName, userBalance, profileImage, transactions, allUsers, passwordRequests,
      login, register: signUpAction, logout, deductBalance, requestDeposit, adminAction, updateBalanceAdmin, deleteUser: deleteUserAction, requestReset: requestPasswordResetAction, adminResetPassword: completePasswordResetAction,
      changePassword: changePasswordAction, updateProfileImage: updateProfileImageAction, currency, checkPendingOrders, notificationsEnabled, isNotificationSupported, requestNotificationPermission, refreshCloudData,
      isAudioUnlocked, unlockAudio, triggerPushSilently
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser context is missing');
  return context;
}
