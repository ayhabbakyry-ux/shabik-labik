
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
  deductBalance: (amount: number, productDetails: string) => void;
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
  
  const currency = "ل.س.ج";
  const ADMIN_PHONE = "0939549573";
  const ADMIN_PASS = "872003";

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserPhone("");
    setUserName("");
    setUserBalance(0);
    localStorage.removeItem('shabik_auth');
  }, []);

  useEffect(() => {
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
      
      const currentU = savedUsers ? JSON.parse(savedUsers).find((u: any) => u.phone === authData.phone) : authData;
      setUserBalance(currentU?.balance || 0);
    }
  }, []);

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
    
    // الرصيد الابتدائي صفر دائماً لضمان النزاهة
    const newUser: AppUser = { phone, name, password: pass, balance: 0 };
    setAllUsers(prev => {
      const updated = [...prev, newUser];
      localStorage.setItem('shabik_users', JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: "تم إنشاء الحساب بنجاح، رصيدك الحالي 0" };
  };

  const deleteUser = useCallback((phone: string) => {
    setAllUsers(prev => {
      const updated = prev.filter(u => u.phone !== phone);
      localStorage.setItem('shabik_users', JSON.stringify(updated));
      return updated;
    });

    if (userPhone === phone) {
      logout();
    }
  }, [userPhone, logout]);

  const addBalance = (amount: number) => {
    setAllUsers(prev => {
      const updated = prev.map(u => u.phone === userPhone ? { ...u, balance: u.balance + amount } : u);
      localStorage.setItem('shabik_users', JSON.stringify(updated));
      return updated;
    });
    setUserBalance(prev => prev + amount);
  };

  const deductBalance = (amount: number, productDetails: string) => {
    setAllUsers(prev => {
      const updated = prev.map(u => u.phone === userPhone ? { ...u, balance: u.balance - amount } : u);
      localStorage.setItem('shabik_users', JSON.stringify(updated));
      return updated;
    });
    setUserBalance(prev => prev - amount);

    const newTx: Transaction = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: 'شراء منتج',
      amount,
      status: 'Completed',
      date: new Date().toLocaleString('ar-SY'),
      userName: userName,
      userPhone: userPhone,
      details: productDetails
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      localStorage.setItem('shabik_txs', JSON.stringify(updated));
      return updated;
    });
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
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      localStorage.setItem('shabik_txs', JSON.stringify(updated));
      return updated;
    });
  };

  const adminAction = (transactionId: string, action: 'approve' | 'reject') => {
    setTransactions(prevTxs => {
      const updated = prevTxs.map(tx => {
        if (tx.id === transactionId && tx.status === 'Pending') {
          if (action === 'approve') {
            setAllUsers(prevUsers => {
              const newUsers = prevUsers.map(u => u.phone === tx.userPhone ? { ...u, balance: u.balance + tx.amount } : u);
              localStorage.setItem('shabik_users', JSON.stringify(newUsers));
              if (tx.userPhone === userPhone) {
                setUserBalance(prev => prev + tx.amount);
              }
              return newUsers;
            });
            return { ...tx, status: 'Completed' as const };
          }
          return { ...tx, status: 'Rejected' as const };
        }
        return tx;
      });
      localStorage.setItem('shabik_txs', JSON.stringify(updated));
      return updated;
    });
  };

  const requestPasswordReset = (phone: string) => {
    const newReq = { phone, date: new Date().toLocaleString('ar-SY') };
    setPasswordRequests(prev => {
      const updated = [newReq, ...prev];
      localStorage.setItem('shabik_pass_reqs', JSON.stringify(updated));
      return updated;
    });
  };

  const clearPasswordRequest = (phone: string) => {
    setPasswordRequests(prev => {
      const updated = prev.filter(r => r.phone !== phone);
      localStorage.setItem('shabik_pass_reqs', JSON.stringify(updated));
      return updated;
    });
  };

  const isAdmin = userPhone === ADMIN_PHONE;

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin, userPhone, userName, userBalance, transactions, allUsers, passwordRequests,
      login, register, logout, addBalance, deductBalance, requestDeposit, adminAction, deleteUser, requestPasswordReset, clearPasswordRequest, currency
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
