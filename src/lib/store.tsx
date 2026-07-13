"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from './firebase-config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  getDocs,
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

export type Transaction = {
  id: string;
  external_order_id?: string;
  type: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Rejected';
  date: string;
  createdAt?: string;
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
  const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

  const playNotificationSound = useCallback(() => {
    if (!isAudioUnlocked) return;
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [isAudioUnlocked]);

  const unlockAudio = () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 0;
      audio.play().then(() => {
        setIsAudioUnlocked(true);
      }).catch(e => console.error("Audio Unlock Error:", e));
    } catch (e) {}
  };

  const triggerNotification = useCallback((title: string, body: string) => {
    try {
      playNotificationSound();
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
        new Notification(title, { body });
      }
    } catch (e) {}
  }, [playNotificationSound]);

  const refreshCloudData = useCallback(async () => {
    if (!isLoggedIn || !userPhone) return;
    
    try {
      const phoneClean = userPhone.trim();
      const isAdminUser = phoneClean === ADMIN_PHONE;
      
      const userQ = query(collection(db, "users"), where("phone", "==", phoneClean), limit(1));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        setUserBalance(data.balance || 0);
        setProfileImage(data.profileImage || null);
      }

      let txQuery;
      if (isAdminUser) {
        txQuery = query(collection(db, "transactions"), limit(200));
      } else {
        txQuery = query(collection(db, "transactions"), where("userPhone", "==", phoneClean), limit(100));
      }
      
      const txSnap = await getDocs(txQuery);
      const manualTxs = txSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      
      manualTxs.sort((a, b) => {
        const dateA = a.createdAt || a.date || "";
        const dateB = b.createdAt || b.date || "";
        return dateB.localeCompare(dateA);
      });

      setTransactions(manualTxs);
    } catch (e) {
      console.error("Manual Refresh Error:", e);
    }
  }, [isLoggedIn, userPhone]);

  useEffect(() => {
    const saved = localStorage.getItem('shabik_auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      setIsLoggedIn(true);
      setUserPhone(parsed.phone);
      setUserName(parsed.name);
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsNotificationSupported(true);
      setNotificationsEnabled(Notification.permission === "granted");
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoggedIn) {
        refreshCloudData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoggedIn, refreshCloudData]);

  useEffect(() => {
    if (!isLoggedIn || !userPhone) return;

    const unsubscribes: (() => void)[] = [];
    const phoneClean = userPhone.trim();
    const isAdminUser = phoneClean === ADMIN_PHONE;

    const userQ = query(collection(db, "users"), where("phone", "==", phoneClean));
    const unsubUser = onSnapshot(userQ, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserBalance(data.balance || 0);
        setProfileImage(data.profileImage || null);
      }
    }, (err) => {
      console.error("User Snapshot Error:", err);
      refreshCloudData();
    });
    unsubscribes.push(unsubUser);

    let txQuery;
    if (isAdminUser) {
      txQuery = query(collection(db, "transactions"), limit(150));
    } else {
      txQuery = query(collection(db, "transactions"), where("userPhone", "==", phoneClean), limit(100));
    }

    const unsubTxs = onSnapshot(txQuery, (snap) => {
      const newTxs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
      
      newTxs.sort((a, b) => {
        const dateA = a.createdAt || a.date || "";
        const dateB = b.createdAt || b.date || "";
        return dateB.localeCompare(dateA);
      });

      if (!isInitialLoad.current) {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            const tx = change.doc.data() as Transaction;
            if (isAdminUser && tx.status === 'Pending') {
              triggerNotification("طلب إيداع جديد 💰", `من: ${tx.userName || tx.userPhone} بقيمة ${tx.amount}`);
            } else if (!isAdminUser && tx.userPhone === phoneClean) {
              triggerNotification("تحديث في حسابك", `تم تسجيل ${tx.type} بنجاح.`);
            }
          } else if (change.type === "modified") {
            const tx = change.doc.data() as Transaction;
            triggerNotification("تحديث حالة الطلب", `${tx.type}: ${tx.status === 'Completed' ? "تم القبول ✅" : "تم الرفض ❌"}`);
          }
        });
      }
      
      setTransactions(newTxs);
      isInitialLoad.current = false;
    }, (err) => {
      console.error("TX Snapshot Error:", err);
      refreshCloudData();
    });
    unsubscribes.push(unsubTxs);

    if (isAdminUser) {
      const unsubAllUsers = onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }, (err) => console.error("AllUsers Snapshot Error:", err));
      unsubscribes.push(unsubAllUsers);

      const unsubPass = onSnapshot(collection(db, "password_requests"), (snap) => {
        setPasswordRequests(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      }, (err) => console.error("PassRequests Snapshot Error:", err));
      unsubscribes.push(unsubPass);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
      isInitialLoad.current = true;
    };
  }, [isLoggedIn, userPhone, triggerNotification, refreshCloudData]);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  };

  const login = async (phone: string, password: string) => {
    const phoneClean = phone.trim();
    if (phoneClean === ADMIN_PHONE && password === ADMIN_PASS) {
      const adminData = { phone: phoneClean, name: "المدير العام" };
      setIsLoggedIn(true);
      setUserPhone(phoneClean);
      setUserName(adminData.name);
      localStorage.setItem('shabik_auth', JSON.stringify(adminData));
      return { success: true, message: "مرحباً بك يا مدير." };
    }
    const result = await signInAction(phoneClean, password);
    if (result.success && result.user) {
      setIsLoggedIn(true);
      setUserPhone(result.user.phone);
      setUserName(result.user.name);
      localStorage.setItem('shabik_auth', JSON.stringify(result.user));
    }
    return result;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPhone("");
    localStorage.removeItem('shabik_auth');
  };

  const deductBalance = async (amount: number, productDetails: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const now = new Date().toISOString();
    const newBal = Math.max(0, userBalance - amount);
    
    setUserBalance(newBal);
    
    try {
      await recordTransactionAction({
        external_order_id: externalId || "",
        type: 'طلب شحن',
        amount,
        status: initialStatus,
        date: now,
        createdAt: now,
        userName,
        userPhone,
        details: productDetails,
        balanceBefore: before,
        balanceAfter: newBal
      });
      await syncBalanceAction(userPhone, newBal);
    } catch (e) {
      console.error("Critical DB Error (Deduct):", e);
    }
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    const now = new Date().toISOString();
    
    // الخطوة الأولى: الحفظ في Firestore فوراً وبأعلى سرعة (المطلب الأساسي للعميل)
    try {
      await recordTransactionAction({
        type: 'إيداع محفظة',
        amount,
        status: 'Pending',
        date: now,
        createdAt: now,
        userName,
        userPhone,
        details: "طلب إيداع رصيد من المحفظة",
        proofImage
      });
    } catch (dbError: any) {
      alert("عطل في الفايربيز: " + (dbError.message || dbError));
      console.error("Critical DB Error (Deposit):", dbError);
    }

    // الخطوة الثانية: أي منطق إضافي للإشعارات أو التوكن معزول تماماً وتجاهل الأخطاء
    try {
      // منطق التوكن أو الصور هنا مستقبلاً لن يعطل الحفظ أعلاه
    } catch (silentError: any) {
      alert("عطل في التوكن: " + (silentError.message || silentError));
      // تجاهل بصمت لضمان نجاح العملية المالية على Samsung
    }
  };

  const adminAction = async (txId: string, action: 'approve' | 'reject') => {
    await processAdminAction(txId, action);
  };

  const updateBalanceAdmin = async (phone: string, amount: number, operation: 'add' | 'subtract') => {
    await updateUserBalanceDirectlyAction(phone, amount, operation);
  };

  const deleteUser = async (phone: string) => {
    await deleteUserAction(phone);
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
          
          if (final) {
            await updateTransactionStatusServer(order.id, final, order.amount, order.userPhone || userPhone);
          }
        }
      } catch (err) {}
    }
    setIsCheckingOrders(false);
  };

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin: userPhone === ADMIN_PHONE, userPhone, userName, userBalance, profileImage, transactions, allUsers, passwordRequests,
      login, register: signUpAction, logout, deductBalance, requestDeposit, adminAction, updateBalanceAdmin, deleteUser, requestReset: requestPasswordResetAction, adminResetPassword: completePasswordResetAction,
      changePassword: changePasswordAction, updateProfileImage: updateProfileImageAction, currency, checkPendingOrders, notificationsEnabled, isNotificationSupported, requestNotificationPermission, refreshCloudData,
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
