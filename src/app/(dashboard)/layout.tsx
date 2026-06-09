"use client";

import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/layout/page-transition";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-surface dark:bg-navy-950">
      <Sidebar />
      <div
        className="flex flex-1 flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ marginLeft: collapsed ? 68 : 256 }}
      >
        <Navbar />
        <main className="flex-1 p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </Providers>
  );
}
