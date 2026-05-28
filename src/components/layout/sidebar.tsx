"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Package,
  KeyRound,
  CalendarCheck,
  TicketCheck,
  Truck,
  Users,
  Shield,
  Bell,
  FileText,
  ClipboardList,
} from "lucide-react";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { title: "Empresas", href: "/companies", icon: <Building2 size={18} /> },
  { title: "Productos", href: "/products", icon: <Package size={18} /> },
  { title: "Licencias", href: "/licenses", icon: <KeyRound size={18} /> },
  { title: "Visitas", href: "/visits", icon: <CalendarCheck size={18} /> },
  { title: "Soporte", href: "/support-cases", icon: <TicketCheck size={18} /> },
  { title: "Traslados", href: "/transfers", icon: <Truck size={18} /> },
  { title: "Usuarios", href: "/users", icon: <Users size={18} /> },
  { title: "Perfiles", href: "/roles", icon: <Shield size={18} /> },
  { title: "Alertas", href: "/alerts", icon: <Bell size={18} /> },
  { title: "Informes Técnicos", href: "/technical-reports", icon: <FileText size={18} /> },
  { title: "Fichas Implementación", href: "/implementation-sheets", icon: <ClipboardList size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-gradient-to-b from-blue-700 via-navy-800 to-navy-900 shadow-2xl">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/dashboard" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white shadow-lg backdrop-blur transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/25">
            NP
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight tracking-tight text-white">NEXUS</span>
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-blue-300">Polaris</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-none p-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-white/15 text-white shadow-lg"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-400 shadow-[0_0_8px_rgba(74,144,217,0.5)]" />
              )}
              <span className={cn(
                "relative z-10 transition-transform duration-300",
                !isActive && "group-hover:scale-110"
              )}>
                {item.icon}
              </span>
              <span className="relative z-10">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 backdrop-blur transition-all duration-300 hover:bg-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-lg">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white">Administrador</span>
            <span className="text-[10px] text-white/40">admin@nexuspolaris.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
