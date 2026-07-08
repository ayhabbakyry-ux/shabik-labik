
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInAction, signUpAction } from '@/app/actions/auth';
import { syncBalanceAction, recordTransactionAction, getUserTransactionsAction } from '@/app/actions/wallet';
import { getAllUsersAction, deleteUserAction, processAdminAction, updateTransactionStatusServer, getUserDataAction } from '@/app/actions/admin';

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
  transactions: Transaction[];
  allUsers: any[];
  passwordRequests: any[];
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (phone: string, name: string, pass: string, refCode?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  deductBalance: (amount: number, productDetails: string, initialStatus?: 'Pending' | 'Completed', externalId?: string) => Promise<void>;
  requestDeposit: (amount: number, proofImage: string) => Promise<void>;
  adminAction: (txId: string, action: 'approve' | 'reject') => Promise<void>;
  deleteUser: (phone: string) => Promise<void>;
  clearPasswordRequest: (phone: string) => Promise<void>;
  currency: string;
  checkPendingOrders: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);
  const [isCheckingOrders, setIsCheckingOrders] = useState(false);
  
  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";

  const fetchCloudData = useCallback(async (phone: string) => {
    const cloudTxs = await getUserTransactionsAction(phone);
    setTransactions(cloudTxs);
    
    const res = await getUserDataAction(phone);
    if (res.success && res.data) {
      setUserBalance(res.data.balance || 0);
      const authData = JSON.parse(localStorage.getItem('shabik_auth') || '{}');
      localStorage.setItem('shabik_auth', JSON.stringify({ ...authData, balance: res.data.balance }));
    }

    if (phone === ADMIN_PHONE) {
      const users = await getAllUsersAction();
      setAllUsers(users);
    }
  }, [ADMIN_PHONE]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('shabik_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsLoggedIn(true);
      setUserPhone(authData.phone);
      setUserName(authData.name);
      setUserBalance(authData.balance || 0);
      fetchCloudData(authData.phone);
    }
  }, [fetchCloudData]);

  const login = async (phone: string, password: string) => {
    if (phone === ADMIN_PHONE && password === ADMIN_PASS) {
      const adminData = { phone, name: "المدير أيهم", balance: 0 };
      setIsLoggedIn(true);
      setUserPhone(phone);
      setUserName(adminData.name);
      localStorage.setItem('shabik_auth', JSON.stringify(adminData));
      await fetchCloudData(phone);
      return { success: true, message: "أهلاً بك يا مدير أيهم" };
    }

    const result = await signInAction(phone, password);
    if (result.success && result.user) {
      setIsLoggedIn(true);
      setUserPhone(result.user.phone);
      setUserName(result.user.name);
      setUserBalance(result.user.balance);
      localStorage.setItem('shabik_auth', JSON.stringify(result.user));
      await fetchCloudData(result.user.phone);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const register = async (phone: string, name: string, pass: string, refCode?: string) => {
    return await signUpAction(phone, name, pass, refCode);
  };

  const deductBalance = async (amount: number, productDetails: string, initialStatus: 'Pending' | 'Completed' = 'Completed', externalId?: string) => {
    const before = userBalance;
    const newBalance = Math.max(0, userBalance - amount);
    setUserBalance(newBalance);
    await syncBalanceAction(userPhone, newBalance);
    
    const authData = JSON.parse(localStorage.getItem('shabik_auth') || '{}');
    localStorage.setItem('shabik_auth', JSON.stringify({ ...authData, balance: newBalance }));

    const txData: Omit<Transaction, 'id'> = {
      external_order_id: externalId || "",
      type: 'شراء منتج',
      amount,
      status: initialStatus,
      date: new Date().toLocaleString('ar-SY'),
      userName,
      userPhone,
      details: productDetails,
      balanceBefore: before,
      balanceAfter: newBalance
    };
    
    const result = await recordTransactionAction(txData);
    const newTx: Transaction = { id: result.id || `ORD-${Date.now()}`, ...txData };
    setTransactions(prev => [newTx, ...prev]);
  };

  const requestDeposit = async (amount: number, proofImage: string) => {
    const txData: Omit<Transaction, 'id'> = {
      type: 'إيداع محفظة',
      amount,
      status: 'Pending',
      date: new Date().toLocaleString('ar-SY'),
      userName,
      userPhone,
      details: "طلب شحن رصيد",
      proofImage
    };
    const result = await recordTransactionAction(txData);
    const newTx: Transaction = { id: result.id || `TX-${Date.now()}`, ...txData };
    setTransactions(prev => [newTx, ...prev]);
  };

  const adminAction = async (txId: string, action: 'approve' | 'reject') => {
    const res = await processAdminAction(txId, action);
    if (res.success) {
      await fetchCloudData(userPhone);
    }
  };

  const checkPendingOrders = async () => {
    if (!isLoggedIn || isCheckingOrders) return;

    const pendingOrders = transactions.filter(tx => tx.status === 'Pending' && tx.external_order_id);
    if (pendingOrders.length === 0) return;

    setIsCheckingOrders(true);
    for (const order of pendingOrders) {
      try {
        const res = await fetch(`/api/check-order?order_id=${order.external_order_id}`);
        const data = await res.json();

        if (data.success && data.status) {
          const remoteStatus = String(data.status).toLowerCase().trim();
          let finalStatus: 'Completed' | 'Rejected' | null = null;

          if (remoteStatus === 'accept' || remoteStatus === 'موافق' || remoteStatus === 'مقبول' || remoteStatus === 'نجاح') {
            finalStatus = 'Completed';
          } else if (remoteStatus === 'reject' || remoteStatus === 'رفض') {
            finalStatus = 'Rejected';
          }

          if (finalStatus) {
            const ownerPhone = order.userPhone || userPhone;
            const updateRes = await updateTransactionStatusServer(order.id, finalStatus, order.amount, ownerPhone);
            
            if (updateRes.success) {
              setTransactions(prev => prev.map(t => t.id === order.id ? { ...t, status: finalStatus! } : t));
              if (finalStatus === 'Rejected' && ownerPhone === userPhone && updateRes.newBalance !== undefined) {
                setUserBalance(updateRes.newBalance);
                const authData = JSON.parse(localStorage.getItem('shabik_auth') || '{}');
                localStorage.setItem('shabik_auth', JSON.stringify({ ...authData, balance: updateRes.newBalance }));
              }
            }
          }
        }
      } catch (err) { console.error("Polling error:", err); }
    }
    setIsCheckingOrders(false);
  };

  const deleteUser = async (phone: string) => {
    const res = await deleteUserAction(phone);
    if (res.success) {
      await fetchCloudData(userPhone);
    }
  };

  const clearPasswordRequest = async (phone: string) => {
    setPasswordRequests(prev => prev.filter(r => r.phone !== phone));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPhone("");
    setUserName("");
    setUserBalance(0);
    setTransactions([]);
    localStorage.removeItem('shabik_auth');
  };

  const isAdmin = userPhone === ADMIN_PHONE;

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin, userPhone, userName, userBalance, transactions, allUsers, passwordRequests,
      login, register, logout, deductBalance, requestDeposit, adminAction, deleteUser, clearPasswordRequest,
      currency, checkPendingOrders
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
}
