
"use client";

import * as React from "react";
import { 
  Home, 
  History, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  User,
  ChevronRight,
  Settings
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userPhone, logout } = useUser();
  const isAdmin = userPhone === "0939549573";

  const navItems = [
    { label: "الرئيسية", icon: Home, href: "/dashboard" },
    { label: "سجل العمليات", icon: History, href: "/history" },
    { label: "الدعم الذكي", icon: MessageSquare, href: "/support" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Sidebar side="right" collapsible="icon" className="border-l bg-white">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold font-headline text-primary">شبك لبيك</span>
            <span className="text-[10px] text-muted-foreground font-medium">النسخة الرقمية</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-right">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="h-11 px-4 hover:bg-accent/50 transition-colors"
                  >
                    <a href={item.href} className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-right text-destructive">لوحة الإدارة</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="الإدارة" className="h-11 px-4 text-destructive hover:bg-destructive/5 hover:text-destructive">
                    <a href="#" className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      <span className="font-bold group-data-[collapsible=icon]:hidden">المعلم كونسول</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="w-full flex items-center justify-between hover:bg-muted/50 transition-colors rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden text-right">
                <Avatar className="h-9 w-9 border shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden truncate">
                  <span className="text-sm font-bold truncate">{userPhone}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">مستخدم نشط</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="left" className="w-56" dir="rtl">
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
