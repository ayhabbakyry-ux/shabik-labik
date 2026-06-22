
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Rejected';
  date: string;
};

type UserContextType = {
  isLoggedIn: boolean;
  userPhone: string;
  userBalance: number;
  transactions: Transaction[];
  login: (phone: string) => void;
  logout: () => void;
  addBalance: (amount: number) => void;
  requestDeposit: (amount: number) => void;
  adminAction: (transactionId: string, action: 'approve' | 'reject') => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Simulation of persistence or initial data
  useEffect(() => {
    const saved = localStorage.getItem('shabik_auth');
    if (saved) {
      const data = JSON.parse(saved);
      setIsLoggedIn(true);
      setUserPhone(data.phone);
      setUserBalance(data.balance || 0);
    }
  }, []);

  const login = (phone: string) => {
    setIsLoggedIn(true);
    setUserPhone(phone);
    const initialBalance = phone === "0939549573" ? 1000000 : 0;
    setUserBalance(initialBalance);
    localStorage.setItem('shabik_auth', JSON.stringify({ phone, balance: initialBalance }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPhone("");
    setUserBalance(0);
    localStorage.removeItem('shabik_auth');
  };

  const addBalance = (amount: number) => {
    setUserBalance(prev => prev + amount);
  };

  const requestDeposit = (amount: number) => {
    const newTx: Transaction = {
      id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: 'Wallet Deposit',
      amount,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
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
      isLoggedIn, userPhone, userBalance, transactions, 
      login, logout, addBalance, requestDeposit, adminAction 
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
