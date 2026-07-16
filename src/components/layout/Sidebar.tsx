"use client";

import React, { useState } from 'react';
import { useUser } from "@/lib/store";
import { 
  LogOut, 
  Home, 
  Wallet, 
  Receipt, 
  ShoppingCart, 
  MapPin, 
  LifeBuoy,
  Star,
  Bot,
  KeyRound,
  Camera,
  Loader2,
  Gift
} from "lucide-react";
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
  const { userPhone, userName, userBalance, logout, currency, isAdmin, profileImage, updateProfileImage } = useUser();
  const pathname = usePathname();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const baseMenuItems = [
    { title: "الرئيسية", icon: <Home className="h-5 w-5" />, href: "/dashboard" },
    { title: "المحفظة", icon: <Wallet className="h-5 w-5" />, href: "/wallet" },
    { title: "دفعاتي المالية", icon: <Receipt className="h-5 w-5" />, href: "/payments" },
    { title: "مشترياتي", icon: <ShoppingCart className="h-5 w-5" />, href: "/history" },
  ];

  const adminOnlyItems = isAdmin ? [
    { title: "برنامج المكافآت", icon: <Gift className="h-5 w-5" />, href: "/referral" }
  ] : [];

  const otherMenuItems = [
    { title: "المراكز المعتمدة", icon: <MapPin className="h-5 w-5" />, href: "/centers" },
    { title: "المساعد الذكي", icon: <Bot className="h-5 w-5" />, href: "/ai-assistant" },
    { title: "تغيير كلمة المرور", icon: <KeyRound className="h-5 w-5" />, href: "/profile/change-password" },
    { title: "الدعم الفني", icon: <LifeBuoy className="h-5 w-5" />, href: "/support" },
  ];

  const menuItems = [...baseMenuItems, ...adminOnlyItems, ...otherMenuItems];

  const handleLevelClick = () => {
    toast({
      description: "لترقية مستوى حسابك، يرجى زيادة حجم المشتريات في المنصة.",
    });
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار ملف صورة صالح." });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const rawBase64 = reader.result as string;
        const compressedBase64 = await compressImage(rawBase64);
        
        const res = await updateProfileImage(compressedBase64);
        setUploading(false);
        
        if (res.success) {
          toast({ title: "تم التحديث بنجاح", description: "تم تحديث صورة الملف الشخصي بنجاح." });
        } else {
          toast({ 
            variant: "destructive", 
            title: "فشل التعديل", 
            description: res.message || "حدث خطأ أثناء الرفع، يرجى المحاولة مرة أخرى." 
          });
        }
      } catch (err) {
        setUploading(false);
        toast({ variant: "destructive", title: "خطأ غير متوقع", description: "تعذر معالجة الصورة المطلوبة." });
      }
    };
    reader.readAsDataURL(file);
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
          <div className="relative mb-4 group cursor-pointer">
            <input 
              type="file" 
              id="sidebar-profile-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label htmlFor="sidebar-profile-upload" className="cursor-pointer block relative">
               <Avatar className={cn("w-24 h-24 border-4 border-[#1e232d] shadow-2xl transition-all group-hover:opacity-80 group-hover:scale-105", uploading && "animate-pulse")}>
                  <AvatarImage src={profileImage || `https://picsum.photos/seed/${userPhone}/200`} className="object-cover" />
                  <AvatarFallback className="bg-primary text-2xl font-bold">{userName?.[0] || 'U'}</AvatarFallback>
               </Avatar>
               
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                  {uploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
               </div>
            </label>
            
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1.5 shadow-lg border-2 border-[#11151d]">
               <Star className="h-3 w-3 text-[#11151d] fill-current" />
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black font-headline tracking-tight">{userName || "مستخدم"}</h2>
            <div className="flex items-center justify-center gap-2">
               <span 
                  onClick={handleLevelClick}
                  className="bg-yellow-500/10 text-yellow-500 px-3 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 transition-all"
                >
                  {isAdmin ? "المدير العام" : "عضو مميز ⭐"}
                </span>
               <span className="text-gray-500 text-[10px] font-bold">ID: {userPhone || "0000"}</span>
            </div>
          </div>

          <div className="mt-6 w-full bg-[#1c232d] p-4 rounded-2xl text-center border border-gray-800/50 shadow-inner">
             <p className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-widest">الرصيد المتاح</p>
             <div className="text-primary font-black text-2xl">
                {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[12px] font-medium">{currency}</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col p-4 gap-1.5">
          {menuItems.map((item) => (
            <Link key={item.title} href={item.href} onClick={onClose}>
              <div
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl w-full transition-all active:scale-[0.97] cursor-pointer",
                  pathname === item.href 
                    ? 'bg-[#1c232d] text-primary border border-primary/20 shadow-lg shadow-primary/5'
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