"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { Separator } from "@workspace/ui/components/separator";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  TrendingUp,
  Settings,
  Briefcase,
  User as UserIcon,
} from "lucide-react";

function TestSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { to: "/test-dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/history", icon: History, label: "History" },
    { to: "/analytics", icon: TrendingUp, label: "Analytics" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const isRouteActive = (itemPath: string) => {
    if (itemPath === "/test-dashboard") {
      return pathname === "/test-dashboard";
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300"
    >
      <SidebarHeader className="pb-4 pt-6 z-20">
        <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 border border-white/10 transition-transform hover:scale-105 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <Briefcase className="h-5 w-5 text-white group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden transition-all duration-300">
            <span className="font-serif text-lg font-bold tracking-tight text-white whitespace-nowrap drop-shadow-md">
              Portfolio Tracker
            </span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">
              Premium Edition
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 uppercase tracking-widest text-[10px] font-semibold mb-2 px-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  isActive={isRouteActive(item.to)}
                  tooltip={item.label}
                  className="group/menu-btn relative py-2.5 my-0.5 rounded-lg transition-all duration-200 text-white/60 hover:text-white hover:bg-white/5"
                >
                  <Link href={item.to}>
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-white/5 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="w-full gap-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              <Avatar className="h-8 w-8 border border-white/10">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
                  T
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-white">
                  Test User
                </span>
                <span className="text-xs text-white/40">test@example.com</span>
              </div>
              <UserIcon className="ml-auto h-4 w-4 text-white/40 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default function TestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <TestSidebar />
      <SidebarInset className="flex flex-col min-h-screen overflow-x-hidden">
        <header className="flex h-14 items-center gap-4 border-b border-white/5 px-6 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="text-white/60 hover:text-white hover:bg-white/10 -ml-2" />
          <Separator orientation="vertical" className="h-6 bg-white/10" />
          <span className="text-sm text-white/60">Toggle Sidebar Menu</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
