"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Rejected';
  date: string;
  userName?: string;
  userPhone?: string;
  details?: string;
};

export type AppUser = {
  phone: string;
  name: string;
  password?: string;
  balance: number;
};

export type PasswordRequest = {
  phone: string;
  date: string;
};

type UserContextType = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userPhone: string;
  userName: string;
  userBalance: number;
  transactions: Transaction[];
  allUsers: AppUser[];
  passwordRequests: PasswordRequest[];
  login: (phone: string, password: string) => { success: boolean; message: string };
  register: (phone: string, name: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  addBalance: (amount: number) => void;
  requestDeposit: (amount: number, proofImage: string) => void;
  adminAction: (transactionId: string, action: 'approve' | 'reject') => void;
  deleteUser: (phone: string) => void;
  requestPasswordReset: (phone: string) => void;
  clearPasswordRequest: (phone: string) => void;
  currency: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";

  useEffect(() => {
    const loadData = () => {
      const savedUsers = localStorage.getItem('shabik_users');
      const savedAuth = localStorage.getItem('shabik_auth');
      const savedTxs = localStorage.getItem('shabik_txs');
      const savedPassReqs = localStorage.getItem('shabik_pass_reqs');

      if (savedUsers) setAllUsers(JSON.parse(savedUsers));
      if (savedTxs) setTransactions(JSON.parse(savedTxs));
      if (savedPassReqs) setPasswordRequests(JSON.parse(savedPassReqs));
      
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        setIsLoggedIn(true);
        setUserPhone(authData.phone);
        setUserName(authData.name);
        setUserBalance(authData.balance || 0);
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shabik_users', JSON.stringify(allUsers));
    }
  }, [allUsers, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shabik_txs', JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  const login = (phone: string, password: string) => {
    if (phone === ADMIN_PHONE && password === ADMIN_PASS) {
      const adminData = { phone, name: "المدير أيهم", balance: 0 };
      setIsLoggedIn(true);
      setUserPhone(phone);
      setUserName("المدير أيهم");
      setUserBalance(0);
      localStorage.setItem('shabik_auth', JSON.stringify(adminData));
      return { success: true, message: "تم دخول المدير بنجاح" };
    }

    const user = allUsers.find(u => u.phone === phone);
    if (!user) return { success: false, message: "عذراً، هذا الرقم غير مسجل" };
    if (user.password !== password) return { success: false, message: "كلمة السر خاطئة" };

    setIsLoggedIn(true);
    setUserPhone(phone);
    setUserName(user.name);
    setUserBalance(user.balance);
    localStorage.setItem('shabik_auth', JSON.stringify(user));
    return { success: true, message: "تم تسجيل الدخول بنجاح" };
  };

  const register = (phone: string, name: string, pass: string) => {
    const exists = allUsers.some(u => u.phone === phone);
    if (exists || phone === ADMIN_PHONE) return { success: false, message: "هذا الرقم مسجل مسبقاً" };
    const newUser: AppUser = { phone, name, password: pass, balance: 0 };
    setAllUsers(prev => [...prev, newUser]);
    return { success: true, message: "تم إنشاء الحساب بنجاح" };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPhone("");
    setUserName("");
    setUserBalance(0);
    localStorage.removeItem('shabik_auth');
  };

  const deleteUser = (phone: string) => {
    // حذف قاطع وفوري من الحالة ومن الذاكرة المحلية
    setAllUsers(prev => {
      const filtered = prev.filter(u => u.phone !== phone);
      localStorage.setItem('shabik_users', JSON.stringify(filtered));
      return [...filtered];
    });

    if (userPhone === phone) {
      logout();
    }
  };

  const addBalance = (amount: number) => {
    setUserBalance(prev => prev + amount);
    setAllUsers(prev => prev.map(u => u.phone === userPhone ? { ...u, balance: u.balance + amount } : u));
  };

  const requestDeposit = (amount: number, proofImage: string) => {
    const newTx: Transaction = {
      id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: 'إيداع محفظة',
      amount,
      status: 'Pending',
      date: new Date().toLocaleString('ar-SY'),
      userName: userName,
      userPhone: userPhone,
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const adminAction = (transactionId: string, action: 'approve' | 'reject') => {
    setTransactions(prevTxs => prevTxs.map(tx => {
      if (tx.id === transactionId && tx.status === 'Pending') {
        if (action === 'approve') {
          setAllUsers(prevUsers => prevUsers.map(u => u.phone === tx.userPhone ? { ...u, balance: u.balance + tx.amount } : u));
          if (tx.userPhone === userPhone) setUserBalance(prev => prev + tx.amount);
          return { ...tx, status: 'Completed' as const };
        }
        return { ...tx, status: 'Rejected' as const };
      }
      return tx;
    }));
  };

  const requestPasswordReset = (phone: string) => {
    const newReq = { phone, date: new Date().toLocaleString('ar-SY') };
    setPasswordRequests(prev => [newReq, ...prev]);
  };

  const clearPasswordRequest = (phone: string) => {
    setPasswordRequests(prev => prev.filter(r => r.phone !== phone));
  };

  const isAdmin = userPhone === ADMIN_PHONE;

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin, userPhone, userName, userBalance, transactions, allUsers, passwordRequests,
      login, register, logout, addBalance, requestDeposit, adminAction, deleteUser, requestPasswordReset, clearPasswordRequest, currency
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
