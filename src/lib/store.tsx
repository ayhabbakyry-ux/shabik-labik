
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
  getAllTransactionsAction,
  updateUserBalanceDirectlyAction
} from '@/app/actions/admin';
import { changePasswordAction, updateProfileImageAction } from '@/app/actions/profile';
import { messaging } from '@/lib/firebase-config';
import { getToken, onMessage } from 'firebase/messaging';

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
  updateBalanceAdmin: (phone: string, amount: number, operation: 'add' | 'subtract') => Promise<void>;
  deleteUser: (phone: string) => Promise<void>;
  requestReset: (phone: string) => Promise<{ success: boolean; message: string }>;
  adminResetPassword: (phone: string, requestId: string) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateProfileImage: (imageData: string) => Promise<{ success: boolean; message?: string }>;
  currency: string;
  checkPendingOrders: () => Promise<void>;
  notificationsEnabled: boolean;
  isNotificationSupported: boolean;
  requestNotificationPermission: () => void;
  refreshCloudData: () => Promise<void>;
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
  
  const prevTransactionsRef = useRef<Transaction[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";
  const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
  const VAPID_KEY = "BDvYkX3Xq4u3U7YyH5R8E7J2p9G1L6M5K9S2W4X8Q7P1V6B3N5M8"; 

  const getIconForService = (type: string, details: string) => {
    const text = (type + (details || "")).toLowerCase();
    if (text.includes("سيريتل") || text.includes("syriatel")) return "https://i.postimg.cc/9MwTgJxR/Screenshot-20260712-221408.png";
    if (text.includes("mtn") || text.includes("ام تي ان")) return "https://i.postimg.cc/LXQfNGBF/Screenshot-20260712-221317.png";
    if (text.includes("pubg") || text.includes("ببجي")) return "https://i.postimg.cc/Kz7cYTjq/Screenshot-20260712-221644.png";
    if (text.includes("free") || text.includes("فري")) return "https://i.postimg.cc/HWPRyx5d/Screenshot-20260712-221757.png";
    if (text.includes("bigo") || text.includes("بيجو")) return "https://i.postimg.cc/QxmBb2Xw/Screenshot-20260712-221513.png";
    if (text.includes("tik") || text.includes("تيك")) return "https://i.postimg.cc/J0vR6523/Screenshot-20260712-224351.png";
    if (text.includes("likee") || text.includes("لايكي")) return "https://i.postimg.cc/j2FjVbL5/Screenshot-20260712-224255.png";
    if (text.includes("jawaker") || text.includes("جواكر")) return "https://i.postimg.cc/G2SRtjrQ/Screenshot-20260712-224536.png";
    return "https://picsum.photos/seed/genie/200/200";
  };

  const playNotificationSound = useCallback(() => {
    try {
      if (typeof Audio !== 'undefined') {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.play().catch(() => {});
      }
    } catch (e) {}
  }, []);

  const triggerNotification = useCallback(async (title: string, body: string, iconUrl?: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === "granted") {
        try {
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
              body,
              icon: iconUrl || "https://picsum.photos/seed/genie/200/200",
              badge: "https://picsum.photos/seed/genie/100/100",
              vibrate: [200, 100, 200],
              tag: 'shabik-notification',
              requireInteraction: true
            });
          } else {
            new Notification(title, { body, icon: iconUrl });
          }
          playNotificationSound();
        } catch (e) {
          playNotificationSound();
        }
      }
    }
  }, [playNotificationSound]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsNotificationSupported(supported);
      if (supported) {
        setNotificationsEnabled(Notification.permission === 'granted');
        if (messaging) {
          onMessage(messaging, (payload) => {
            if (payload.notification) {
              triggerNotification(payload.notification.title || "تنبيه جديد", payload.notification.body || "", payload.notification.image || payload.notification.icon);
            }
          });
        }
      }
    }
  }, [triggerNotification]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
      if (permission === "granted" && messaging) {
        try {
          await getToken(messaging, { vapidKey: VAPID_KEY });
        } catch (err) {}
      }
    }
  }, []);

  const fetchCloudData = useCallback(async (phone: string, force = false) => {
    if (!phone) return;
    if (isFetchingRef.current && !force) return;
    
    isFetchingRef.current = true;
    const phoneClean = phone.trim();
    const isAdminUser = phoneClean === ADMIN_PHONE;
    
    try {
      const userDataRes = await getUserDataAction(phoneClean);
      if (userDataRes.success && userDataRes.data) {
        setUserBalance(userDataRes.data.balance || 0);
        setProfileImage(userDataRes.data.profileImage || null);
        if (userDataRes.data.name) setUserName(userDataRes.data.name);
      }

      if (isAdminUser) {
        const [allReqs, allUsrs] = await Promise.all([
          getPasswordRequestsAction(),
          getAllUsersAction()
        ]);
        setPasswordRequests(allReqs || []);
        setAllUsers(allUsrs || []);
      }

      const currentTxs = isAdminUser 
        ? await getAllTransactionsAction() 
        : await getUserTransactionsAction(phoneClean);

      const sorted = [...(currentTxs || [])].sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        return dateB.localeCompare(dateA);
      });
      
      if (prevTransactionsRef.current.length > 0) {
        sorted.forEach(newTx => {
          const oldTx = prevTransactionsRef.current.find(p => p.id === newTx.id);
          const serviceIcon = getIconForService(newTx.type, newTx.details || "");
          
          if (oldTx) {
            if (oldTx.status !== newTx.status) {
              const statusLabel = newTx.status === 'Completed' ? "مقبول ✅" : newTx.status === 'Rejected' ? "مرفوض ❌" : "قيد الانتظار ⏳";
              triggerNotification(`تحديث حالة الطلب`, `طلبك (${newTx.type}) أصبح: ${statusLabel}`, serviceIcon);
            }
          } else {
            if (isAdminUser) {
              triggerNotification(`طلب جديد 🚨`, `المستخدم ${newTx.userName || newTx.userPhone} أرسل طلباً جديداً: ${newTx.type}`, serviceIcon);
            } else {
              triggerNotification(`تأكيد إرسال الطلب`, `تم استلام طلبك (${newTx.type}) وهو قيد المراجعة الآن.`, serviceIcon);
            }
          }
        });
      }

      setTransactions(sorted as Transaction[]);
      prevTransactionsRef.current = sorted as Transaction[];
    } catch (err) {
      console.error("Fetch Cloud Error:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [ADMIN_PHONE, triggerNotification]);

  const refreshCloudData = async () => {
    if (userPhone) await fetchCloudData(userPhone, true);
  };

  const checkPendingOrders = useCallback(async () => {
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
          if (['accept', 'موافق', 'مقبول', 'نجاح', 'completed', 'success'].includes(remote)) final = 'Completed';
          else if (['reject', 'رفض', 'rejected', 'failed'].includes(remote)) final = 'Rejected';
          
          if (final) {
            await updateTransactionStatusServer(order.id, final, order.amount, order.userPhone || userPhone);
            await fetchCloudData(userPhone, true);
          }
        }
      } catch (err) {}
    }
    setIsCheckingOrders(false);
  }, [isLoggedIn, isCheckingOrders, transactions, userPhone, fetchCloudData]);

  useEffect(() => {
    const saved = localStorage.getItem('shabik_auth');
    if (saved) {
      const data = JSON.parse(saved);
      setIsLoggedIn(true);
      setUserPhone(data.phone);
      setUserName(data.name);
      fetchCloudData(data.phone, true);
    }
  }, [fetchCloudData]);

  useEffect(() => {
    if (isLoggedIn && userPhone) {
      pollingIntervalRef.current = setInterval(() => fetchCloudData(userPhone), 5000);
    }
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  }, [isLoggedIn, userPhone, fetchCloudData]);

  const login = async (phone: string, password: string) => {
    const phoneClean = phone.trim();
    if (phoneClean === ADMIN_PHONE && password === ADMIN_PASS) {
      const adminData = { phone: phoneClean, name: "المدير العام", balance: 0 };
      setIsLoggedIn(true);
      setUserPhone(phoneClean);
      setUserName(adminData.name);
      localStorage.setItem('shabik_auth', JSON.stringify(adminData));
      await signUpAction(phoneClean, "المدير العام", ADMIN_PASS);
      await fetchCloudData(phoneClean, true);
      return { success: true, message: "أهلاً بك يا مدير." };
    }
    const result = await signInAction(phoneClean, password);
    if (result.success && result.user) {
      setIsLoggedIn(true);
      setUserPhone(result.user.phone);
      setUserName(result.user.name);
      localStorage.setItem('shabik_auth', JSON.stringify(result.user));
      await fetchCloudData(result.user.phone, true);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPhone("");
    localStorage.removeItem('shabik_auth');
  };

  const deductBalance = async (amount: number, productDetails: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const newBal = Math.max(0, userBalance - amount);
    setUserBalance(newBal);
    await syncBalanceAction(userPhone, newBal);
    await recordTransactionAction({
      external_order_id: externalId || "",
      type: 'طلب شحن',
      amount,
      status: initialStatus,
      date: new Date().toISOString(),
      userName,
      userPhone,
      details: productDetails,
      balanceBefore: before,
      balanceAfter: newBal
    });
    await fetchCloudData(userPhone, true);
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    await recordTransactionAction({
      type: 'إيداع محفظة',
      amount,
      status: 'Pending',
      date: new Date().toISOString(),
      userName,
      userPhone,
      details: "طلب إيداع رصيد",
      proofImage
    });
    await fetchCloudData(userPhone, true);
  };

  const adminAction = async (txId: string, action: 'approve' | 'reject') => {
    const res = await processAdminAction(txId, action);
    if (res.success) await fetchCloudData(userPhone, true);
  };

  const updateBalanceAdmin = async (phone: string, amount: number, operation: 'add' | 'subtract') => {
    const res = await updateUserBalanceDirectlyAction(phone, amount, operation);
    if (res.success) await fetchCloudData(userPhone, true);
  };

  const deleteUser = async (phone: string) => {
    const res = await deleteUserAction(phone);
    if (res.success) await fetchCloudData(userPhone, true);
  };

  const requestReset = async (phone: string) => requestPasswordResetAction(phone);
  const adminResetPassword = async (phone: string, requestId: string) => {
    const res = await completePasswordResetAction(phone, requestId);
    if (res.success) await fetchCloudData(userPhone, true);
  };
  const changePassword = async (currentPass: string, newPass: string) => changePasswordAction(userPhone, currentPass, newPass);
  const updateProfileImage = async (imageData: string) => {
    const res = await updateProfileImageAction(userPhone, imageData, userName);
    if (res.success) setProfileImage(imageData);
    return res;
  };

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin: userPhone === ADMIN_PHONE, userPhone, userName, userBalance, profileImage, transactions, allUsers, passwordRequests,
      login, register: signUpAction, logout, deductBalance, requestDeposit, adminAction, updateBalanceAdmin, deleteUser, requestReset, adminResetPassword,
      changePassword, updateProfileImage, currency, checkPendingOrders, notificationsEnabled, isNotificationSupported, requestNotificationPermission, refreshCloudData
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser error');
  return context;
}
