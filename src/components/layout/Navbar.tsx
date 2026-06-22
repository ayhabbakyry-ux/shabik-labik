
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "History", icon: History, href: "/history" },
    { label: "Support", icon: MessageSquare, href: "/support" },
    { label: "Profile", icon: "/profile", href: "#" }, // Placeholder for profile
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t h-16 flex items-center justify-around px-4 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center space-y-1 transition-colors",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {typeof item.icon !== 'string' && <item.icon className="h-5 w-5" />}
          <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
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
