
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('shabik_users');
      if (savedUsers) setAllUsers(JSON.parse(savedUsers));

      const savedAuth = localStorage.getItem('shabik_auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        setIsLoggedIn(true);
        setUserPhone(authData.phone);
        setUserName(authData.name);
        setUserBalance(authData.balance);
      }

      const savedTxs = localStorage.getItem('shabik_txs');
      if (savedTxs) setTransactions(JSON.parse(savedTxs));

      const savedPassReqs = localStorage.getItem('shabik_pass_reqs');
      if (savedPassReqs) setPasswordRequests(JSON.parse(savedPassReqs));
    } catch (e) {
      console.error("Error loading data", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // المزامنة مع LocalStorage
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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shabik_pass_reqs', JSON.stringify(passwordRequests));
    }
  }, [passwordRequests, isLoaded]);

  // دالة تسجيل الدخول - تتحقق من وجود الحساب
  const login = (phone: string, password: string) => {
    // حالة المدير
    if (phone === ADMIN_PHONE) {
      if (password === ADMIN_PASS) {
        const data = { phone, name: "المدير أيهم", balance: userBalance };
        setIsLoggedIn(true);
        setUserPhone(phone);
        setUserName(data.name);
        localStorage.setItem('shabik_auth', JSON.stringify(data));
        return { success: true, message: "تم دخول المدير بنجاح" };
      }
      return { success: false, message: "كلمة سر المدير خاطئة" };
    }

    // حالة المستخدم العادي
    const user = allUsers.find(u => u.phone === phone);
    if (!user) {
      return { success: false, message: "عذراً، هذا الرقم غير مسجل لدينا" };
    }

    if (user.password !== password) {
      return { success: false, message: "كلمة السر غير صحيحة" };
    }

    const authData = { phone, name: user.name, balance: user.balance };
    setIsLoggedIn(true);
    setUserPhone(phone);
    setUserName(user.name);
    setUserBalance(user.balance);
    localStorage.setItem('shabik_auth', JSON.stringify(authData));
    return { success: true, message: "تم تسجيل الدخول بنجاح" };
  };

  // دالة إنشاء حساب جديد
  const register = (phone: string, name: string, pass: string) => {
    const exists = allUsers.some(u => u.phone === phone);
    if (exists) {
      return { success: false, message: "هذا الرقم مسجل مسبقاً، يرجى تسجيل الدخول" };
    }

    const newUser: AppUser = { phone, name, password: pass, balance: 0 };
    setAllUsers(prev => [...prev, newUser]);
    return { success: true, message: "تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول" };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPhone("");
    setUserName("");
    setUserBalance(0);
    localStorage.removeItem('shabik_auth');
  };

  const addBalance = (amount: number) => {
    setUserBalance(prev => prev + amount);
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
      details: "إثبات الدفع مرفق"
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const adminAction = (transactionId: string, action: 'approve' | 'reject') => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === transactionId) {
        if (action === 'approve' && tx.status !== 'Completed') {
          setAllUsers(prevUsers => prevUsers.map(u => 
            u.phone === tx.userPhone ? { ...u, balance: u.balance + tx.amount } : u
          ));
          if (tx.userPhone === userPhone) setUserBalance(prev => prev + tx.amount);
          return { ...tx, status: 'Completed' };
        }
        return { ...tx, status: 'Rejected' };
      }
      return tx;
    }));
  };

  // الحذف النهائي والصارم
  const deleteUser = (phone: string) => {
    if (phone === ADMIN_PHONE) return;

    setAllUsers(prev => {
      const newList = prev.filter(u => u.phone !== phone);
      localStorage.setItem('shabik_users', JSON.stringify(newList));
      return newList;
    });

    // طرد المستخدم إذا كان هو المحذوف
    if (userPhone === phone) {
      logout();
    }
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
