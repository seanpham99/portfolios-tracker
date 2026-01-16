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
            {menuItems.map((item) => {
              const isActive = isRouteActive(item.to);
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={`
                      h-10 transition-all duration-200 ease-in-out rounded-lg
                      ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/10 to-transparent text-indigo-300 shadow-[inset_2px_0_0_0_theme(colors.indigo.500)]"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    <Link href={item.to} className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : ""}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-white/10 bg-white/5">
                <AvatarFallback className="rounded-lg bg-transparent text-xs font-medium text-white/70">
                  T
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-white/90">Test User</span>
                <span className="truncate text-xs text-muted-foreground">test@example.com</span>
              </div>
              <UserIcon className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden opacity-50" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="after:bg-white/10 hover:after:bg-indigo-500/50 hover:after:w-1 after:transition-all" />
    </Sidebar>
  );
}

export default function TestDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <TestSidebar />
      <SidebarInset>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-950/20 via-background to-background pointer-events-none -z-20" />

        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1 size-8 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors" />
          <Separator orientation="vertical" className="h-4 bg-white/10" />
          <span className="text-sm font-medium text-muted-foreground">Menu</span>
        </header>

        <div className="flex-1 py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
