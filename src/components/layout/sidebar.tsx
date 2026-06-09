"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
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
  ChevronsLeft,
} from "lucide-react";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={19} /> },
  { title: "Empresas", href: "/companies", icon: <Building2 size={19} /> },
  { title: "Productos", href: "/products", icon: <Package size={19} /> },
  { title: "Licencias", href: "/licenses", icon: <KeyRound size={19} /> },
  { title: "Visitas", href: "/visits", icon: <CalendarCheck size={19} /> },
  { title: "Soporte", href: "/support-cases", icon: <TicketCheck size={19} /> },
  { title: "Traslados", href: "/transfers", icon: <Truck size={19} /> },
  { title: "Usuarios", href: "/users", icon: <Users size={19} /> },
  { title: "Perfiles", href: "/roles", icon: <Shield size={19} /> },
  { title: "Alertas", href: "/alerts", icon: <Bell size={19} /> },
  { title: "Informes Técnicos", href: "/technical-reports", icon: <FileText size={19} /> },
  { title: "Fichas Implementación", href: "/implementation-sheets", icon: <ClipboardList size={19} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        collapsed ? "w-[68px]" : "w-64",
        "bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950 shadow-2xl shadow-navy-950/50"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(74,144,217,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(74,144,217,0.2) 0%, transparent 50%)`
      }} />

      {/* Logo */}
      <div className="relative flex h-16 items-center border-b border-white/[0.06] px-4">
        <Link href="/dashboard" className="group flex items-center gap-3 overflow-hidden">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 ring-1 ring-white/10 transition-all duration-300 group-hover:ring-blue-400/30 group-hover:shadow-lg group-hover:shadow-blue-500/20">
            <Image src="/logo/logo.png" alt="NP" width={28} height={28} className="h-7 w-7 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col transition-all duration-300">
              <span className="text-sm font-bold leading-tight tracking-tight text-white">NEXUS</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-blue-400/80">Polaris</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
            Menú
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-white shadow-lg shadow-blue-500/10"
                  : "text-white/45 hover:bg-white/[0.06] hover:text-white/80"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-blue-500 shadow-[0_0_12px_rgba(74,144,217,0.4)]" />
              )}
              <span className={cn(
                "relative z-10 transition-transform duration-300",
                isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/60",
                !isActive && "group-hover:scale-110"
              )}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="relative z-10 truncate">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-white/30 transition-all duration-300 hover:bg-white/[0.06] hover:text-white/60"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          {!collapsed && <span className="text-xs">Colapsar</span>}
        </button>
      </div>

      {/* User card */}
      <div className="border-t border-white/[0.06] p-3">
        <div className={cn(
          "flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/[0.06] backdrop-blur transition-all duration-300 hover:bg-white/[0.08]",
          collapsed && "justify-center px-0"
        )}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-500/25">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/90">Administrador</p>
              <p className="truncate text-[10px] text-white/35">admin@nexuspolaris.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
