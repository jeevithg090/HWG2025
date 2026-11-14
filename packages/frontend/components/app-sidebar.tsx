"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Briefcase,
  Calendar,
  CalendarPlus,
  MessageCircle,
  PlusCircle,
  Star,
  User as UserIcon,
  Users,
} from "lucide-react";
import { humanize, getInitials } from "@/lib/format";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/user-context";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isClient, isFreelancer, isStartup } = useUser();

  const canPostGigs = isClient || isStartup || user?.role === "admin";

  const mainNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    {
      title: canPostGigs ? "Projects" : "Find Work",
      url: "/dashboard/freelancing",
      icon: Briefcase,
    },
    { title: "Events", url: "/dashboard/events", icon: Calendar },
    { title: "Community", url: "/dashboard/community", icon: MessageCircle },
    { title: "Marketplace", url: "/freelance", icon: Users },
  ];

  const quickActions = [
    canPostGigs
      ? { title: "Post a Project", url: "/dashboard/freelancing/create-gig", icon: PlusCircle }
      : { title: "My Profile", url: "/dashboard/freelancing/profile", icon: UserIcon },
    ...(canPostGigs || isFreelancer
      ? [{ title: "Create Event", url: "/dashboard/events/create", icon: CalendarPlus }]
      : []),
    { title: "Public Events", url: "/events", icon: Star },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TC</span>
          </div>
          <span className="font-bold text-lg">TechCollab</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              {user && (
                <Badge variant="secondary" className="text-xs">
                  {humanize(user.role)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
