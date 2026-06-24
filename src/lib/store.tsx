
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
  const [userBalance, setUserBalance] = useState(0); // تصفير الرصيد الافتراضي
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const currency = "ل.س.ج";

  useEffect(() => {
    const saved = localStorage.getItem('shabik_auth');
    if (saved) {
      const data = JSON.parse(saved);
      setIsLoggedIn(true);
      setUserPhone(data.phone);
      setUserName(data.name || "مستخدم");
      setUserBalance(data.balance || 0);
    }
  }, []);

  const login = (phone: string, name: string) => {
    setIsLoggedIn(true);
    setUserPhone(phone);
    setUserName(name);
    const initialBalance = 0; // الرصيد يبدأ من الصفر للجميع
    setUserBalance(initialBalance);
    localStorage.setItem('shabik_auth', JSON.stringify({ phone, name, balance: initialBalance }));
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
      date: new Date().toLocaleDateString('ar-SY'),
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
          addBalance(tx.amount);
          return { ...tx, status: 'Completed' };
        }
        return { ...tx, status: 'Rejected' };
      }
      return tx;
    }));
  };

  return (
    <UserContext.Provider value={{ 
      isLoggedIn, userPhone, userName, userBalance, transactions, 
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
