
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
import { signInAction, signUpAction, requestPasswordResetAction } from '@/app/actions/auth';
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
  triggerPushSilently: (targetPhone: string, title: string, body: string) => void;
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
  const currency = "ل.س";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";
  const NOTIFICATION_SOUND = "/shabik-labik.mp3";

  const logTechnicalError = (ctx: string, err: any) => {
    console.warn(`Safe Notification Warning [${ctx}]:`, err?.message || err);
  };

  const sortTransactionsClientSide = useCallback((txs: Transaction[]) => {
    return [...txs].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA; 
    });
  }, []);

  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined" || !isAudioUnlocked) return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(() => {});
    } catch (e) {}
  }, [isAudioUnlocked]);

  const triggerPushSilently = useCallback((targetPhone: string, title: string, body: string) => {
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

        // إرسال غير معطل (Non-blocking)
        fetch('/api/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, title, body })
        }).catch(err => logTechnicalError("API Push Call", err));
        
      } catch (e) {
        logTechnicalError("Push Dispatch Background", e);
      }
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
    if (typeof window === "undefined") return;
    
    const isCompatible = 'serviceWorker' in navigator && 'Notification' in window && 'PushManager' in window;
    if (!isCompatible) return;

    try {
      const messaging = await getMessagingSafe();
      if (!messaging) return;
      
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn("FCM: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing. Notifications will not be registered.");
        return;
      }

      getToken(messaging, { 
        serviceWorkerRegistration: registration,
        vapidKey: vapidKey
      }).then(async (token) => {
        if (token) {
          const phoneClean = phone.trim();
          const q = query(collection(db, "users"), where("phone", "==", phoneClean));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const userDoc = snap.docs[0];
            if (userDoc.data().fcmToken !== token) {
              await updateDoc(doc(db, "users", userDoc.id), { fcmToken: token });
            }
          }
        }
      }).catch(err => logTechnicalError("FCM Token Persistence", err));

    } catch (e: any) {
      logTechnicalError("FCM Setup Architecture", e);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === "granted");
        if (permission === "granted") {
          unlockAudio();
          if (userPhone) setupFCM(userPhone);
        }
      } catch (e) {
        logTechnicalError("Permission Request Flow", e);
      }
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
      }

      const txQ = isAdminUser 
        ? query(collection(db, "transactions"))
        : query(collection(db, "transactions"), where("userPhone", "==", phoneClean));
      
      const txSnap = await getDocs(txQ);
      const rawTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      setTransactions(sortTransactionsClientSide(rawTxs));

      if (isAdminUser) {
        const allUsersSnap = await getDocs(collection(db, "users"));
        setAllUsers(allUsersSnap.docs.map(d => ({ ...d.data(), id: d.id })));
        const passSnap = await getDocs(collection(db, "password_requests"));
        setPasswordRequests(passSnap.docs.map(d => ({ ...d.data(), id: d.id })));
      }
    } catch (e: any) {
       logTechnicalError("Cloud Data Refresh", e);
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
              playNotificationSound();
            }
          });
        }
        setTransactions(sortedTxs);
        isInitialLoad.current = false;
      } catch (e) {
        logTechnicalError("Transaction Sync", e);
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
  }, [isLoggedIn, userPhone, playNotificationSound, refreshCloudData, sortTransactionsClientSide, setupFCM]);

  const login = async (phone: string, password: string) => {
    const phoneClean = phone.trim();
    if (phoneClean === ADMIN_PHONE && password === ADMIN_PASS) {
      const data = { phone: phoneClean, name: "المدير العام" };
      setIsLoggedIn(true); setUserPhone(phoneClean); setUserName(data.name);
      localStorage.setItem('shabik_auth', JSON.stringify(data));
      setupFCM(phoneClean);
      return { success: true, message: "مرحباً بك يا مدير." };
    }
    const result = await signInAction(phoneClean, password);
    if (result.success && result.user) {
      setIsLoggedIn(true); setUserPhone(result.user.phone); setUserName(result.user.name);
      localStorage.setItem('shabik_auth', JSON.stringify(result.user));
      setupFCM(phoneClean);
    }
    return result;
  };

  const logout = () => {
    setIsLoggedIn(false); setUserPhone("");
    localStorage.removeItem('shabik_auth');
  };

  const adminAction = async (id: string, action: 'approve' | 'reject') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    try {
      const res = await processAdminAction(id, action);
      if (!res.success) throw new Error("Database Write Failed");
      
      if (tx.userPhone) {
        const title = action === 'approve' ? "تم تحديث الرصيد" : "طلب مرفوض";
        const body = action === 'approve' 
          ? `تمت إضافة مبلغ ${tx.amount.toLocaleString()} ل.س إلى رصيدك` 
          : "تم رفض طلب الإيداع الخاص بك، يرجى مراجعة الإدارة.";
        triggerPushSilently(tx.userPhone, title, body);
      }
    } catch (e) {
      logTechnicalError("Admin Finalization", e);
    }
  };

  const updateBalanceAdmin = async (phone: string, amount: number, operation: 'add' | 'subtract') => {
    try {
      const res = await updateUserBalanceDirectlyAction(phone, amount, operation);
      if (!res.success) throw new Error();
    } catch (e) {
      logTechnicalError("Balance Direct Update", e);
    }
  };

  const deductBalance = async (amount: number, productDetails: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const newBal = Math.max(0, userBalance - amount);
    setUserBalance(newBal);
    
    try {
      const now = new Date().toISOString();
      const txData = {
        external_order_id: externalId || "",
        type: 'طلب شحن',
        amount,
        status: initialStatus,
        date: now,
        createdAt: now,
        userName,
        userPhone: userPhone.trim(),
        details: productDetails,
        balanceBefore: before,
        balanceAfter: newBal
      };

      await addDoc(collection(db, "transactions"), txData);
      triggerPushSilently(ADMIN_PHONE, "طلب شحن جديد", `هناك طلب شحن بقيمة ${amount} ل.س من ${userName}`);
      
    } catch (e: any) {
      setUserBalance(before);
      logTechnicalError("Deduction Logic Failure", e);
    }
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    try {
      const now = new Date().toISOString();
      const txData = {
        type: 'إيداع محفظة',
        amount,
        status: 'Pending',
        date: now,
        createdAt: now,
        userName,
        userPhone: userPhone.trim(),
        details: "طلب إيداع رصيد",
        proofImage
      };

      await addDoc(collection(db, "transactions"), txData);
      triggerPushSilently(ADMIN_PHONE, "طلب إيداع جديد", `قام ${userName} بإرسال إيداع بقيمة ${amount} ل.س`);
      
      alert("تم إرسال طلبك بنجاح للمدير.");
    } catch (error: any) { 
        logTechnicalError("Deposit Submission Crash Protection", error);
        alert("فشل في إرسال الطلب: " + (error.message || "خطأ غير معروف"));
    }
  };

  const deleteUser = async (p: string) => { await deleteUserAction(p); };
  const requestReset = async (p: string) => await requestPasswordResetAction(p);
  const adminResetPassword = async (p: string, r: string) => { await completePasswordResetAction(p, r); };
  const changePassword = async (c: string, n: string) => await changePasswordAction(userPhone, c, n);
  const updateProfileImage = async (i: string) => await updateProfileImageAction(userPhone, i, userName);
  
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
            if (final === 'Completed') {
               const targetId = order.details?.split('ID: ')[1] || "حسابك";
               triggerPushSilently(order.userPhone || userPhone, "تم اكتمال الشحن", `تمت عملية شحن ${targetId} بنجاح`);
            }
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
