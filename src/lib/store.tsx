
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
  login: (phone: string, name: string, pass: string) => void;
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

  // 1. تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('shabik_auth');
      if (savedAuth) {
        const data = JSON.parse(savedAuth);
        setIsLoggedIn(true);
        setUserPhone(data.phone);
        setUserName(data.name || "مستخدم");
        setUserBalance(data.balance || 0);
      }

      const savedUsers = localStorage.getItem('shabik_users');
      if (savedUsers) {
        setAllUsers(JSON.parse(savedUsers));
      }

      const savedTxs = localStorage.getItem('shabik_txs');
      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      }

      const savedPassReqs = localStorage.getItem('shabik_pass_reqs');
      if (savedPassReqs) {
        setPasswordRequests(JSON.parse(savedPassReqs));
      }
    } catch (e) {
      console.error("Error loading data from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. مزامنة التغييرات مع الذاكرة المحلية
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

  useEffect(() => {
    if (isLoggedIn && isLoaded) {
      localStorage.setItem('shabik_auth', JSON.stringify({ 
        phone: userPhone, 
        name: userName,
        balance: userBalance
      }));
      
      // مزامنة رصيد المستخدم الحالي في قائمة الكل
      setAllUsers(prev => prev.map(u => 
        u.phone === userPhone ? { ...u, balance: userBalance, name: userName } : u
      ));
    }
  }, [userBalance, isLoggedIn, userPhone, userName, isLoaded]);

  const login = (phone: string, name: string, pass: string) => {
    setIsLoggedIn(true);
    setUserPhone(phone);
    setUserName(name);
    
    const existingUser = allUsers.find(u => u.phone === phone);
    const initialBalance = existingUser ? existingUser.balance : 0;
    setUserBalance(initialBalance);

    if (!existingUser) {
      const newUser: AppUser = { phone, name, password: pass, balance: 0 };
      setAllUsers(prev => [...prev, newUser]);
    }
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
          if (tx.status !== 'Completed') {
            setAllUsers(prevUsers => prevUsers.map(u => 
              u.phone === tx.userPhone ? { ...u, balance: u.balance + tx.amount } : u
            ));
            
            if (tx.userPhone === userPhone) {
              setUserBalance(current => current + tx.amount);
            }
          }
          return { ...tx, status: 'Completed' };
        }
        return { ...tx, status: 'Rejected' };
      }
      return tx;
    }));
  };

  const deleteUser = (phone: string) => {
    console.log("Store: Deleting user", phone);
    // تحديث الحالة فوراً
    setAllUsers(prev => {
      const newList = prev.filter(u => u.phone !== phone);
      // تحديث الذاكرة المحلية يدوياً للتأكد من المزامنة
      localStorage.setItem('shabik_users', JSON.stringify(newList));
      return newList;
    });
    
    setPasswordRequests(prev => {
      const newList = prev.filter(r => r.phone !== phone);
      localStorage.setItem('shabik_pass_reqs', JSON.stringify(newList));
      return newList;
    });
    
    if (phone === userPhone) {
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
      login, logout, addBalance, requestDeposit, adminAction, deleteUser, requestPasswordReset, clearPasswordRequest, currency
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
