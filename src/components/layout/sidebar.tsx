"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "📊" },
  { title: "Empresas", href: "/companies", icon: "🏢" },
  { title: "Productos", href: "/products", icon: "📦" },
  { title: "Licencias", href: "/licenses", icon: "🔑" },
  { title: "Visitas", href: "/visits", icon: "📅" },
  { title: "Soporte", href: "/support-cases", icon: "🎫" },
  { title: "Traslados", href: "/transfers", icon: "🚚" },
  { title: "Usuarios", href: "/users", icon: "👥" },
  { title: "Alertas", href: "/alerts", icon: "🔔" },
  { title: "Informes Técnicos", href: "/technical-reports", icon: "📋" },
  { title: "Fichas Implementación", href: "/implementation-sheets", icon: "📄" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">NEXUS</span>
          <span className="text-sm text-gray-500">ERP</span>
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span>{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
