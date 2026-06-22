
"use client";

import { WalletCard } from "@/components/dashboard/WalletCard";
import { ServiceGrid } from "@/components/dashboard/ServiceGrid";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { useUser } from "@/lib/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { isLoggedIn, userPhone } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-background">
      <DesktopHeader />
      
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Mobile Header Area */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold font-headline">Hello, <span className="text-primary">{userPhone}</span></h1>
            <p className="text-xs text-muted-foreground">Quick access to digital goods</p>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <WalletCard />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Services</h3>
            <span className="text-xs text-primary font-bold uppercase tracking-widest cursor-pointer">View All</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 bg-white border-none shadow-sm h-11" placeholder="Search games, topups..." />
          </div>

          <ServiceGrid isAdmin={userPhone === "0939549573"} />
        </div>

        {/* Featured Section */}
        <div className="rounded-2xl bg-gradient-to-br from-secondary to-blue-700 p-6 text-white shadow-lg">
          <h4 className="font-bold text-xl mb-2">PUBG 3.5 Global Update</h4>
          <p className="text-sm opacity-90 mb-4">New seasonal items synced from Al-Ragheb. Get exclusive UC packs now!</p>
          <button className="px-6 py-2 bg-white text-secondary rounded-full font-bold text-sm shadow-md hover:scale-105 transition-transform">
            Browse Packs
          </button>
        </div>
      </main>

      <Navbar />
    </div>
  );
}
