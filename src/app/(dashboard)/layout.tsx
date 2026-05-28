import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/layout/page-transition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <div className="ml-64 flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </Providers>
  );
}
