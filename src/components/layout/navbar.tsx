"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Bell, Check, Clock, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/theme-provider";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/companies": "Empresas",
  "/products": "Productos",
  "/licenses": "Licencias",
  "/visits": "Visitas",
  "/support-cases": "Casos de Soporte",
  "/transfers": "Traslados",
  "/users": "Usuarios",
  "/roles": "Perfiles",
  "/alerts": "Alertas",
  "/technical-reports": "Informes Técnicos",
  "/implementation-sheets": "Fichas de Implementación",
};

type Alert = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const typeColors: Record<string, string> = {
  INFO: "bg-blue-500",
  SUCCESS: "bg-emerald-500",
  WARNING: "bg-amber-500",
  ERROR: "bg-red-500",
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const basePath = "/" + (pathname.split("/")[1] || "");
  const title = pageTitles[basePath] || "NEXUS POLARIS";

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAsRead(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-navy-100/60 px-8 dark:border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 shadow-sm shadow-blue-500/30" />
        <h1 className="text-lg font-semibold tracking-tight text-navy-900 dark:text-white">{title}</h1>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Notifications dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-navy-400 transition-all duration-300 hover:bg-navy-50 hover:text-navy-600 dark:text-white/50 dark:hover:bg-white/[0.08] dark:hover:text-white/80"
          >
            <Bell className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white shadow-md shadow-blue-500/40">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="animate-scale-in absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-navy-100/60 bg-white shadow-2xl shadow-navy-950/15 dark:border-white/[0.08] dark:bg-navy-800">
              <div className="flex items-center justify-between border-b border-navy-100/60 px-4 py-3 dark:border-white/[0.06]">
                <span className="text-sm font-semibold text-navy-900 dark:text-white">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/20 dark:text-blue-400 dark:ring-blue-500/30">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-navy-300 dark:text-white/30">
                    <Bell className="h-8 w-8" />
                    <p className="text-sm">Sin notificaciones</p>
                  </div>
                ) : (
                  alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 border-b px-4 py-3 transition-colors duration-200 hover:bg-navy-50/40 dark:border-white/[0.04] dark:hover:bg-white/[0.04] ${!alert.isRead ? "bg-blue-50/30 dark:bg-blue-500/[0.06]" : ""}`}
                    >
                      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${alert.isRead ? "bg-navy-200 dark:bg-white/20" : typeColors[alert.type] || "bg-navy-400"}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${alert.isRead ? "text-navy-500 dark:text-white/50" : "text-navy-800 dark:text-white/90"}`}>
                          {alert.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-navy-400 dark:text-white/40">{alert.message}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Clock className="h-3 w-3 text-navy-300 dark:text-white/30" />
                          <span className="text-[10px] text-navy-300 dark:text-white/30">{timeAgo(alert.createdAt)}</span>
                        </div>
                      </div>
                      {!alert.isRead && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="mt-1 shrink-0 rounded-md p-1 text-navy-300 transition-colors hover:bg-blue-50 hover:text-blue-500 dark:text-white/30 dark:hover:bg-white/[0.08] dark:hover:text-blue-400"
                          title="Marcar como leída"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {alerts.length > 0 && (
                <div className="border-t border-navy-100/60 bg-navy-50/20 px-4 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <button
                    onClick={() => { router.push("/alerts"); setOpen(false); }}
                    className="w-full text-center text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Ver todas las alertas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="group flex h-10 w-10 items-center justify-center rounded-xl text-navy-400 transition-all duration-300 hover:bg-navy-50 hover:text-navy-600 dark:text-white/50 dark:hover:bg-white/[0.08] dark:hover:text-white/80"
          title={theme === "light" ? "Modo oscuro" : "Modo claro"}
        >
          {theme === "light" ? (
            <Moon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <Sun className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
          )}
        </button>

        <div className="mx-2 h-6 w-px bg-navy-100 dark:bg-white/10" />

        {/* User */}
        <div className="flex items-center gap-3 rounded-xl bg-navy-50/60 px-3 py-1.5 ring-1 ring-navy-100/60 transition-all duration-300 hover:bg-navy-50 dark:bg-white/[0.06] dark:ring-white/[0.08] dark:hover:bg-white/[0.1]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-[11px] font-bold text-white shadow-md shadow-blue-500/20">
            {(session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-navy-800 dark:text-white/90">
              {session?.user?.name || "Usuario"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group flex h-10 w-10 items-center justify-center rounded-xl text-navy-400 transition-all duration-300 hover:bg-red-50 hover:text-red-500 dark:text-white/50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          title="Cerrar sesión"
        >
          <LogOut className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-0.5" />
        </button>
      </div>
    </header>
  );
}
