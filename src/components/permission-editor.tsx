"use client";

import { MODULES, type Permissions, type PermissionAction } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const actionLabels: Record<PermissionAction, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
};

const actionColors: Record<PermissionAction, string> = {
  view: "bg-blue-100 text-blue-700 border-blue-200 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white",
  create: "bg-emerald-100 text-emerald-700 border-emerald-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white",
  edit: "bg-amber-100 text-amber-700 border-amber-200 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white",
  delete: "bg-red-100 text-red-700 border-red-200 data-[state=checked]:bg-red-500 data-[state=checked]:text-white",
};

export function PermissionEditor({
  value,
  onChange,
}: {
  value: Permissions;
  onChange: (perms: Permissions) => void;
}) {
  function toggle(moduleKey: string, action: PermissionAction) {
    const updated = { ...value };
    if (!updated[moduleKey]) {
      updated[moduleKey] = { view: false, create: false, edit: false, delete: false };
    }
    updated[moduleKey] = {
      ...updated[moduleKey],
      [action]: !updated[moduleKey]?.[action],
    };
    onChange(updated);
  }

  function selectAll(moduleKey: string, checked: boolean) {
    const updated = { ...value };
    const mod = MODULES.find((m) => m.key === moduleKey);
    if (!mod) return;
    updated[moduleKey] = {} as any;
    for (const action of mod.actions) {
      updated[moduleKey][action] = checked;
    }
    onChange(updated);
  }

  function allSelected(moduleKey: string): boolean {
    const mod = MODULES.find((m) => m.key === moduleKey);
    if (!mod) return false;
    const perms = value[moduleKey];
    if (!perms) return false;
    return mod.actions.every((a) => perms[a] === true);
  }

  return (
    <div className="space-y-3">
      {MODULES.map((mod) => {
        const perms = value[mod.key] || {};
        const allSel = allSelected(mod.key);
        return (
          <div
            key={mod.key}
            className="rounded-xl border border-navy-100 bg-white p-4 transition-all duration-300 hover:border-navy-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{mod.icon}</span>
                <span className="font-medium text-navy-800">{mod.label}</span>
              </div>
              <button
                type="button"
                onClick={() => selectAll(mod.key, !allSel)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-300",
                  allSel
                    ? "bg-blue-100 text-blue-700"
                    : "bg-navy-100 text-navy-500 hover:bg-navy-200"
                )}
              >
                {allSel ? "Quitar todas" : "Seleccionar todas"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {mod.actions.map((action) => {
                const checked = perms[action] === true;
                return (
                  <button
                    key={action}
                    type="button"
                    data-state={checked ? "checked" : "unchecked"}
                    onClick={() => toggle(mod.key, action)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                      checked
                        ? actionColors[action].replace("data-[state=checked]:", "")
                        : "bg-white text-navy-400 border-navy-200 hover:border-navy-300"
                    )}
                  >
                    {actionLabels[action]}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
