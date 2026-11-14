import type React from "react";
import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { UserProvider } from "@/lib/user-context";
import { ChatProvider } from "@/lib/chat-context";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | TechCollab" },
  robots: { index: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ChatProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="min-w-0">
            <DashboardHeader />
            <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </ChatProvider>
    </UserProvider>
  );
}
