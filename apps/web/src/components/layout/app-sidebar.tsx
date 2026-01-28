"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
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
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  LayoutDashboard,
  History,
  Link2,
  Settings,
  Briefcase,
  LogOut,
  Wallet,
  User as UserIcon,
  ChevronUp,
} from "lucide-react";
import { signOut } from "@/app/(auth)/login/actions";

interface AppSidebarProps {
  user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const menuItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/history", icon: History, label: "History" },
    { to: "/connections", icon: Link2, label: "Connections" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  // Helper to check if a route is active (handles nested routes)
  const isRouteActive = (itemPath: string) => {
    if (itemPath === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(itemPath);
  };

  const userInitial = (user.email?.[0] ?? "U").toUpperCase();
  const userName = user?.email?.split("@")[0] || "User";

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-border">
      {/* Header / Logo */}
      <SidebarHeader className="p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
        >
          {/* Logo Icon */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20 transition-transform duration-200 hover:scale-105 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
            <Briefcase className="h-5 w-5 text-primary-foreground group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
          </div>

          {/* Logo Text - Hidden when collapsed */}
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-foreground tracking-tight whitespace-nowrap">
              Portfolio Tracker
            </span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
              Premium
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-semibold mb-1 px-2 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => {
              const isActive = isRouteActive(item.to);
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={`
                      h-10 rounded-lg transition-all duration-200 cursor-pointer
                      group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0
                      ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-500 font-medium border border-emerald-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                      }
                    `}
                  >
                    <Link
                      href={item.to}
                      className="flex items-center gap-3 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-xl transition-colors cursor-pointer hover:bg-muted/50 data-[state=open]:bg-muted/50 group-data-[collapsible=icon]:justify-center"
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 rounded-lg ring-1 ring-border group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info - Hidden when collapsed */}
                  <div className="flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <p className="truncate font-medium text-foreground text-sm">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  {/* Chevron - Hidden when collapsed */}
                  <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align={isCollapsed ? "center" : "end"}
                className="w-56 rounded-xl border border-border bg-popover p-1"
              >
                {/* User Info Header */}
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/settings" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Preferences</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
                >
                  <form action={signOut} className="w-full">
                    <button type="submit" className="flex w-full items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail for collapse toggle */}
      <SidebarRail className="hover:after:bg-primary/20" />
    </Sidebar>
  );
}
