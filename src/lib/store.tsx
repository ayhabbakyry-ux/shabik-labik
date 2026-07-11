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

  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";
  const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsNotificationSupported(supported);
      if (supported) {
        setNotificationsEnabled(Notification.permission === 'granted');
      }
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if (typeof Audio !== 'undefined') {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.play().catch(() => {});
      }
    } catch (e) {}
  }, []);

  const triggerNotification = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "https://picsum.photos/seed/genie/200/200" });
        playNotificationSound();
      } catch (e) {}
    }
  }, [playNotificationSound]);

  const requestNotificationPermission = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === "granted");
      });
    }
  }, []);

  const fetchCloudData = useCallback(async (phone: string) => {
    if (!phone) return;
    const isAdminUser = phone.trim() === ADMIN_PHONE;
    
    try {
      const userDataRes = await getUserDataAction(phone.trim());
      if (userDataRes.success && userDataRes.data) {
        setUserBalance(userDataRes.data.balance || 0);
        setProfileImage(userDataRes.data.profileImage || null);
        if (userDataRes.data.name) setUserName(userDataRes.data.name);
      }

      if (isAdminUser) {
        const [allTxs, allReqs, allUsrs] = await Promise.all([
          getAllTransactionsAction(),
          getPasswordRequestsAction(),
          getAllUsersAction()
        ]);

        if (allUsrs) setAllUsers(allUsrs);
        if (allReqs) setPasswordRequests(allReqs);
        if (allTxs) {
          const sorted = [...allTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(sorted as Transaction[]);
          
          const newOnes = sorted.filter(tx => tx.status === 'Pending' && !prevTransactionsRef.current.find(p => p.id === tx.id));
          if (newOnes.length > 0) triggerNotification("تحديث جديد 🔔", "لديك طلبات معلقة بانتظار المعالجة.");
          prevTransactionsRef.current = sorted as Transaction[];
        }
      } else {
        const userTxs = await getUserTransactionsAction(phone.trim());
        if (userTxs) {
          const sorted = [...userTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(sorted);
          prevTransactionsRef.current = sorted;
        }
      }
    } catch (err) {}
  }, [ADMIN_PHONE, triggerNotification]);

  const checkPendingOrders = useCallback(async () => {
    if (!isLoggedIn || isCheckingOrders || typeof window === 'undefined') return;
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
          if (['accept', 'موافق', 'مقبول', 'نجاح'].includes(remote)) final = 'Completed';
          else if (['reject', 'رفض'].includes(remote)) final = 'Rejected';
          
          if (final) {
            await updateTransactionStatusServer(order.id, final, order.amount, order.userPhone || userPhone);
            await fetchCloudData(userPhone);
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
      fetchCloudData(data.phone);
    }
  }, [fetchCloudData]);

  useEffect(() => {
    if (isLoggedIn && userPhone) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(() => {
        fetchCloudData(userPhone);
        checkPendingOrders();
      }, 20000); 
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
      await signUpAction(phone, "المدير العام", ADMIN_PASS);
      await fetchCloudData(phone);
      return { success: true, message: "أهلاً بك يا مدير." };
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

  const deductBalance = async (amount: number, productDetails: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const newBal = Math.max(0, userBalance - amount);
    setUserBalance(newBal);
    try {
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
      await fetchCloudData(userPhone);
    } catch (e) {}
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    try {
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
      await fetchCloudData(userPhone);
    } catch (e) {}
  };

  const adminAction = async (txId: string, action: 'approve' | 'reject') => {
    const res = await processAdminAction(txId, action);
    if (res.success) await fetchCloudData(userPhone);
  };

  const updateBalanceAdmin = async (phone: string, amount: number, operation: 'add' | 'subtract') => {
    const res = await updateUserBalanceDirectlyAction(phone, amount, operation);
    if (res.success) await fetchCloudData(userPhone);
  };

  const deleteUser = async (phone: string) => {
    const res = await deleteUserAction(phone);
    if (res.success) await fetchCloudData(userPhone);
  };

  const requestReset = async (phone: string) => requestPasswordResetAction(phone);
  const adminResetPassword = async (phone: string, requestId: string) => {
    const res = await completePasswordResetAction(phone, requestId);
    if (res.success) await fetchCloudData(userPhone);
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
      changePassword, updateProfileImage, currency, checkPendingOrders, notificationsEnabled, isNotificationSupported, requestNotificationPermission
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
