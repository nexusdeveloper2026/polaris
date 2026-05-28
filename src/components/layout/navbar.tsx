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
  "/alerts": "Alertas",
  "/technical-reports": "Informes Técnicos",
  "/implementation-sheets": "Fichas de Implementación",
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const basePath = "/" + (pathname.split("/")[1] || "");
  const title = pageTitles[basePath] || "NEXUS ERP";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {session?.user?.name || session?.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
