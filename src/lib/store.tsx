
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

type UserContextType = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userPhone: string;
  userName: string;
  userBalance: number;
  transactions: Transaction[];
  login: (phone: string, name: string) => void;
  logout: () => void;
  addBalance: (amount: number) => void;
  requestDeposit: (amount: number, proofImage: string) => void;
  adminAction: (transactionId: string, action: 'approve' | 'reject') => void;
  currency: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const currency = "ل.س.ج";

  const ADMIN_PHONE = "0939549573";

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    const savedAuth = localStorage.getItem('shabik_auth');
    if (savedAuth) {
      const data = JSON.parse(savedAuth);
      setIsLoggedIn(true);
      setUserPhone(data.phone);
      setUserName(data.name || "مستخدم");
      setUserBalance(data.balance || 0);
    }

    const savedTxs = localStorage.getItem('shabik_txs');
    if (savedTxs) {
      setTransactions(JSON.parse(savedTxs));
    }
  }, []);

  // حفظ المعاملات في localStorage عند تغيرها
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('shabik_txs', JSON.stringify(transactions));
    }
  }, [transactions]);

  // حفظ الرصيد عند تغيره
  useEffect(() => {
    if (isLoggedIn) {
      const currentAuth = JSON.parse(localStorage.getItem('shabik_auth') || '{}');
      localStorage.setItem('shabik_auth', JSON.stringify({ ...currentAuth, balance: userBalance }));
    }
  }, [userBalance, isLoggedIn]);

  const login = (phone: string, name: string) => {
    setIsLoggedIn(true);
    setUserPhone(phone);
    setUserName(name);
    // في الإنتاج، الرصيد يبدأ من 0 أو من قاعدة البيانات
    setUserBalance(0);
    localStorage.setItem('shabik_auth', JSON.stringify({ phone, name, balance: 0 }));
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
        if (action === 'approve') {
          // فقط إذا لم يكن الطلب قد اكتمل سابقاً
          if (tx.status !== 'Completed') {
            setUserBalance(current => current + tx.amount);
          }
          return { ...tx, status: 'Completed' };
        }
        return { ...tx, status: 'Rejected' };
      }
      return tx;
    }));
  };

  const isAdmin = userPhone === ADMIN_PHONE;

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, isAdmin, userPhone, userName, userBalance, transactions, 
      login, logout, addBalance, requestDeposit, adminAction, currency
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
