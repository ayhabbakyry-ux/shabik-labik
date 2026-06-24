
"use client";

import React from 'react';
import { useUser } from "@/lib/store";
import { LogOut, User, Heart, Home, CreditCard, Receipt, Wallet, ShoppingCart, MapPin, MessageCircle } from "lucide-react";
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { userPhone, userBalance, logout } = useUser();

  return (
    <>
      {/* خلفية داكنة شفافة */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] transition-opacity backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* الهيكل الأساسي للقائمة الجانبية */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#161a23] text-white z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto shadow-2xl`}
        dir="rtl"
      >
        {/* 1. قسم البروفايل */}
        <div className="flex flex-col items-center pt-10 pb-6 border-b border-gray-800/50">
          <div className="w-24 h-24 rounded-full bg-white mb-4 overflow-hidden border-2 border-transparent outline outline-2 outline-gray-600 shadow-xl">
            <img 
              src={`https://picsum.photos/seed/${userPhone}/200`} 
              alt={userPhone} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold font-headline">{userPhone === "0939549573" ? "أيهم باكير" : userPhone}</h2>
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✔</span>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium mb-3">
            <span className="bg-[#2a2f3a] px-3 py-1 rounded-full text-gray-300 flex items-center gap-1 text-xs">
              <span className="text-yellow-500">⭐</span> VIP-00
            </span>
            <span className="text-gray-400 text-xs">#2225</span>
          </div>

          <div className="text-blue-500 font-bold text-2xl mt-1">
            SYP {userBalance.toLocaleString()}
          </div>
        </div>

        {/* 2. قسم اللغات والأيقونات السريعة */}
        <div className="flex justify-center gap-6 py-4 border-b border-gray-800/50 text-2xl">
           <button className="hover:opacity-80 transition hover:scale-110 active:scale-90">🇹🇷</button>
           <button className="hover:opacity-80 transition hover:scale-110 active:scale-90">🇬🇧</button>
           <button className="hover:opacity-80 transition hover:scale-110 active:scale-90">🇸🇦</button>
        </div>
        
        <div className="flex justify-around py-4 border-b border-gray-800/50 text-gray-400">
           <button className="hover:text-red-500 transition-colors p-2"><Heart className="h-6 w-6" /></button>
           <button className="hover:text-white transition-colors p-2"><User className="h-6 w-6" /></button>
           <button onClick={logout} className="hover:text-destructive transition-colors p-2"><LogOut className="h-6 w-6" /></button>
        </div>

        {/* 3. قائمة التنقل */}
        <div className="flex flex-col p-4 gap-2">
          <Link href="/dashboard" onClick={onClose}>
            <NavItem title="الرئيسية" icon={<Home className="h-5 w-5" />} />
          </Link>
          <NavItem title="منتجاتي المفضلة" icon={<Heart className="h-5 w-5" />} />
          <NavItem title="اضافة رصيد لحسابي" icon={<CreditCard className="h-5 w-5" />} />
          <Link href="/payments" onClick={onClose}>
            <NavItem title="دفعاتي المالية" icon={<Receipt className="h-5 w-5" />} />
          </Link>
          <Link href="/wallet" onClick={onClose}>
            <NavItem title="محفظتي" icon={<Wallet className="h-5 w-5" />} />
          </Link>
          <Link href="/history" onClick={onClose}>
            <NavItem title="مشترياتي" icon={<ShoppingCart className="h-5 w-5" />} />
          </Link>
          <NavItem title="المراكز المعتمدة" icon={<MapPin className="h-5 w-5" />} />
          <NavItem title="واتساب" icon={<MessageCircle className="h-5 w-5" />} />
        </div>
      </div>
    </>
  );
}

function NavItem({ title, icon, isActive }: { title: string; icon: React.ReactNode; isActive?: boolean }) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full transition-all active:scale-[0.98] cursor-pointer ${
        isActive 
          ? 'bg-[#1e3329] text-[#22c55e]' 
          : 'hover:bg-[#1f242f] text-gray-300'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-base font-headline">{title}</span>
    </div>
  );
}
