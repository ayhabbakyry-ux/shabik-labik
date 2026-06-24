
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, MessageSquare, Wallet, Bell, ShoppingBag, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Inbox", icon: Inbox, href: "/inbox" },
    { label: "Wallet", icon: Wallet, href: "/wallet" },
    { label: "Home", icon: Home, href: "/dashboard", center: true },
    { label: "Cart", icon: ShoppingBag, href: "/history" },
    { label: "Notifs", icon: Bell, href: "/notifications" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#161a23] border-t border-gray-800 h-20 flex items-center justify-around px-4 md:hidden shadow-2xl">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center transition-all duration-300 relative",
            item.center ? "-mt-10 bg-[#1b222c] p-4 rounded-full border border-gray-700 shadow-xl" : "p-3",
            pathname === item.href ? "text-white bg-[#242b35] rounded-xl shadow-inner" : "text-gray-400 hover:text-white"
          )}
        >
          <item.icon className={cn(
            item.center ? "h-7 w-7" : "h-6 w-6",
            pathname === item.href && !item.center ? "scale-110" : ""
          )} />
        </Link>
      ))}
    </nav>
  );
}

export function DesktopHeader() {
  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-6 h-16 items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-xl font-bold text-primary font-headline">Shabik Labik</Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
          <Link href="/wallet" className="text-sm font-medium hover:text-primary">Wallet</Link>
          <Link href="/history" className="text-sm font-medium hover:text-primary">Transactions</Link>
          <Link href="/support" className="text-sm font-medium hover:text-primary">Smart Support</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {/* User profile / Logout placeholder */}
      </div>
    </header>
  );
}
