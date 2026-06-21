export type PermissionAction = "view" | "create" | "edit" | "delete";

export type ModulePermissions = Record<PermissionAction, boolean>;

export type Permissions = Record<string, ModulePermissions>;

export type ModuleConfig = {
  key: string;
  label: string;
  icon: string;
  actions: PermissionAction[];
};

export const MODULES: ModuleConfig[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊", actions: ["view"] },
  { key: "companies", label: "Empresas", icon: "🏢", actions: ["view", "create", "edit", "delete"] },
  { key: "products", label: "Productos", icon: "📦", actions: ["view", "create", "edit", "delete"] },
  { key: "licenses", label: "Licencias", icon: "🔑", actions: ["view", "create", "edit", "delete"] },
  { key: "visits", label: "Visitas", icon: "📅", actions: ["view", "create", "edit", "delete"] },
  { key: "support-cases", label: "Casos de Soporte", icon: "🎫", actions: ["view", "create", "edit", "delete"] },
  { key: "transfers", label: "Traslados", icon: "🚚", actions: ["view", "create", "edit", "delete"] },
  { key: "users", label: "Usuarios", icon: "👥", actions: ["view", "create", "edit", "delete"] },
  { key: "roles", label: "Perfiles", icon: "🛡️", actions: ["view", "create", "edit", "delete"] },
  { key: "alerts", label: "Alertas", icon: "🔔", actions: ["view"] },
  { key: "technical-reports", label: "Inspecciones Técnicas", icon: "📋", actions: ["view", "create", "edit", "delete"] },
  { key: "implementation-sheets", label: "Fichas Implementación", icon: "📄", actions: ["view", "create", "edit", "delete"] },
  { key: "settings", label: "Configuración", icon: "⚙️", actions: ["view"] },
];

export function buildDefaultPermissions(): Permissions {
  const perms: Permissions = {};
  for (const mod of MODULES) {
    perms[mod.key] = {} as ModulePermissions;
    for (const action of mod.actions) {
      perms[mod.key][action] = false;
    }
  }
  return perms;
}
