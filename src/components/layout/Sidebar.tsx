"use client";

import React from 'react';
import { useUser } from "@/lib/store";
import { LogOut, User, Heart, Home, CreditCard, Receipt, Wallet, ShoppingCart, MapPin, MessageCircle, Gift, ShieldAlert } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { userPhone, userName, userBalance, logout, currency, isAdmin } = useUser();
  const pathname = usePathname();
  const { toast } = useToast();

  const menuItems = [
    { title: "الرئيسية", icon: <Home className="h-5 w-5" />, href: "/dashboard" },
    { title: "دعوة الأصدقاء والربح", icon: <Gift className="h-5 w-5" />, href: "/referral" },
    { title: "اضافة رصيد لحسابي", icon: <CreditCard className="h-5 w-5" />, href: "/wallet" },
    { title: "دفعاتي المالية", icon: <Receipt className="h-5 w-5" />, href: "/payments" },
    { title: "محفظتي", icon: <Wallet className="h-5 w-5" />, href: "/wallet" },
    { title: "مشترياتي", icon: <ShoppingCart className="h-5 w-5" />, href: "/history" },
    { title: "المراكز المعتمدة", icon: <MapPin className="h-5 w-5" />, href: "/centers" },
  ];

  const handleLevelClick = () => {
    toast({
      description: "لزيادة مستواك كل ما عليك هو زيادة مشترياتك بالتوفيق إن شاء الله ❤️",
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] transition-opacity backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#161a23] text-white z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto shadow-2xl`}
        dir="rtl"
      >
        <div className="flex flex-col items-center pt-10 pb-6 border-b border-gray-800/50">
          <div className="w-24 h-24 rounded-full bg-white mb-4 overflow-hidden border-2 border-transparent outline outline-2 outline-gray-600 shadow-xl">
            <img 
              src={`https://picsum.photos/seed/${userPhone}/200`} 
              alt={userName} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold font-headline">{userName}</h2>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium mb-3">
            <span 
              onClick={handleLevelClick}
              className="bg-[#2a2f3a] px-4 py-1.5 rounded-full text-gray-300 flex items-center gap-2 text-xs cursor-pointer hover:bg-[#343a4a] transition-colors shadow-inner"
            >
              <span className="text-yellow-500">⭐</span> مميز
            </span>
            <span className="text-gray-400 text-xs">#ID:{userPhone.slice(-4)}</span>
          </div>

          <div className="text-blue-500 font-bold text-2xl mt-1">
            {currency} {userBalance.toLocaleString()}
          </div>
        </div>

        <div className="flex justify-around py-4 border-b border-gray-800/50 text-gray-400">
           <button className="hover:text-red-500 transition-colors p-2"><Heart className="h-6 w-6" /></button>
           <button className="hover:text-white transition-colors p-2"><User className="h-6 w-6" /></button>
           <button onClick={logout} className="hover:text-destructive transition-colors p-2"><LogOut className="h-6 w-6" /></button>
        </div>

        <div className="flex flex-col p-4 gap-2">
          {isAdmin && (
            <Link href="/admin" onClick={onClose}>
              <div className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl w-full transition-all mb-2",
                pathname === "/admin" ? "bg-destructive/20 text-destructive" : "bg-destructive/10 text-destructive hover:bg-destructive/20"
              )}>
                <span className="text-xl"><ShieldAlert className="h-5 w-5" /></span>
                <span className="font-bold text-base font-headline">لوحة الإدارة</span>
              </div>
            </Link>
          )}

          {menuItems.map((item) => (
            <Link key={item.title} href={item.href} onClick={onClose}>
              <div
                className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full transition-all active:scale-[0.98] cursor-pointer ${
                  pathname === item.href 
                    ? 'bg-[#1e3329] text-[#22c55e]' 
                    : 'hover:bg-[#1f242f] text-gray-300'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-base font-headline">{item.title}</span>
              </div>
            </Link>
          ))}
          
          <a
            href="https://wa.me/963939549573"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3 rounded-xl w-full transition-all active:scale-[0.98] hover:bg-[#1f242f] text-gray-300"
          >
            <span className="text-xl"><MessageCircle className="h-5 w-5" /></span>
            <span className="font-medium text-base font-headline">الدعم الفني (واتساب)</span>
          </a>
        </div>
      </div>
    </>
  );
}
