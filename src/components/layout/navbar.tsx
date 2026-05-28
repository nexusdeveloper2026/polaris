"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

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

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const basePath = "/" + (pathname.split("/")[1] || "");
  const title = pageTitles[basePath] || "NEXUS POLARIS";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-navy-100 bg-white/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
        <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-navy-50 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[10px] font-bold text-white">
            {(session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-navy-700">
            {session?.user?.name || session?.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="group relative flex h-9 w-9 items-center justify-center rounded-xl text-navy-400 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
          title="Cerrar sesión"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
