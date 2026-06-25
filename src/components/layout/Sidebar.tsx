
"use client";

import React from 'react';
import { useUser } from "@/lib/store";
import { LogOut, User, Heart, Home, CreditCard, Receipt, Wallet, ShoppingCart, MapPin, MessageCircle, Gift, ShieldAlert, Star } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { userPhone, userName, userBalance, logout, currency, isAdmin } = useUser();
  const pathname = usePathname();
  const { toast } = useToast();

  const menuItems = [
    { title: "الرئيسية", icon: <Home className="h-5 w-5" />, href: "/dashboard", activeBg: "bg-[#1e3329]", activeText: "text-[#22c55e]" },
    { title: "دعوة الأصدقاء والربح", icon: <Gift className="h-5 w-5" />, href: "/referral" },
    { title: "إضافة رصيد لحسابي", icon: <CreditCard className="h-5 w-5" />, href: "/wallet" },
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
          className="fixed inset-0 bg-black/70 z-[60] transition-opacity backdrop-blur-md"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-xs bg-[#11151d] text-white z-[70] transform transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]`}
        dir="rtl"
      >
        <div className="flex flex-col items-center pt-12 pb-8 border-b border-gray-800/40 px-6">
          <div className="relative mb-4">
             <Avatar className="w-24 h-24 border-4 border-[#1e232d] shadow-2xl">
                <AvatarImage src={`https://picsum.photos/seed/${userPhone}/200`} />
                <AvatarFallback className="bg-primary text-2xl font-bold">{userName[0]}</AvatarFallback>
             </Avatar>
             <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1.5 shadow-lg border-2 border-[#11151d]">
                <Star className="h-3 w-3 text-[#11151d] fill-current" />
             </div>
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black font-headline tracking-tight">{userName || "المستخدم"}</h2>
            <div className="flex items-center justify-center gap-2">
               <span 
                  onClick={handleLevelClick}
                  className="bg-yellow-500/10 text-yellow-500 px-3 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 transition-all"
                >
                  مميز ⭐
                </span>
               <span className="text-gray-500 text-[10px] font-bold">ID: {userPhone || "0000"}</span>
            </div>
          </div>

          <div className="mt-6 w-full bg-[#1c232d] p-4 rounded-2xl text-center border border-gray-800/50 shadow-inner">
             <p className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-widest">الرصيد المتاح</p>
             <div className="text-primary font-black text-2xl">
                {userBalance.toLocaleString()} <span className="text-[12px] font-medium">{currency}</span>
             </div>
          </div>
        </div>

        <div className="flex justify-around py-4 border-b border-gray-800/30">
           <button className="text-gray-500 hover:text-red-500 transition-colors p-2"><Heart className="h-5 w-5" /></button>
           <button className="text-gray-500 hover:text-white transition-colors p-2"><User className="h-5 w-5" /></button>
           <button onClick={logout} className="text-gray-500 hover:text-destructive transition-colors p-2"><LogOut className="h-5 w-5" /></button>
        </div>

        <div className="flex flex-col p-4 gap-1.5">
          {isAdmin && (
            <Link href="/admin" onClick={onClose}>
              <div className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl w-full transition-all mb-2",
                pathname === "/admin" ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-red-500/5 text-red-500 hover:bg-red-500/10"
              )}>
                <ShieldAlert className="h-5 w-5" />
                <span className="font-black text-sm font-headline">لوحة الإدارة</span>
              </div>
            </Link>
          )}

          {menuItems.map((item) => (
            <Link key={item.title} href={item.href} onClick={onClose}>
              <div
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl w-full transition-all active:scale-[0.97] cursor-pointer",
                  pathname === item.href 
                    ? (item.activeBg || 'bg-[#1c232d] text-primary border border-primary/20 shadow-lg shadow-primary/5')
                    : 'hover:bg-[#1c232d]/50 text-gray-400 hover:text-white'
                )}
              >
                <div className={cn("p-2 rounded-xl", pathname === item.href ? "bg-transparent" : "bg-gray-800/20")}>
                  {item.icon}
                </div>
                <span className="font-bold text-sm font-headline">{item.title}</span>
              </div>
            </Link>
          ))}
          
          <a
            href="https://wa.me/963939549573"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl w-full transition-all active:scale-[0.97] hover:bg-[#1c232d]/50 text-gray-400 mt-2"
          >
            <div className="p-2 rounded-xl bg-gray-800/20">
               <MessageCircle className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm font-headline">الدعم الفني (واتساب)</span>
          </a>
        </div>

        <div className="mt-8 px-8 pb-10">
           <button 
             onClick={logout}
             className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500/10 transition-colors"
           >
             <LogOut className="h-4 w-4" /> تسجيل الخروج
           </button>
        </div>
      </div>
    </>
  );
}
