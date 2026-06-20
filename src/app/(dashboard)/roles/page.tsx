"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { MODULES, type Permissions } from "@/lib/permissions";
import { ConfirmDialog } from "@/components/ui/modal";
import { Shield, Plus, Pencil, Trash2, Users, Eye, Check } from "lucide-react";

type Role = {
  id: number;
  name: string;
  description: string | null;
  permissions: Permissions | null;
  _count: { users: number };
};

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) setRoles(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/roles/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      loadRoles();
    } else {
      const data = await res.json();
      alert(data.error || "Error al eliminar");
    }
  }

  function countPermissions(perms: Permissions | null): number {
    if (!perms) return 0;
    let count = 0;
    for (const actions of Object.values(perms)) {
      for (const val of Object.values(actions)) {
        if (val) count++;
      }
    }
    return count;
  }

  function getModuleLabel(key: string): string {
    return MODULES.find((m) => m.key === key)?.label || key;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-navy-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-navy-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Perfiles
          </h1>
          <p className="mt-1 text-sm text-navy-300">
            Gestiona los perfiles y permisos del sistema
          </p>
        </div>
        <Button onClick={() => router.push("/roles/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Perfil
        </Button>
      </div>

      {roles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-navy-300">
            <Shield className="h-12 w-12" />
            <p className="text-sm">No hay perfiles registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up animate-delay-1 space-y-3">
          {roles.map((role) => {
            const permCount = countPermissions(role.permissions);
            const permModules = role.permissions
              ? Object.entries(role.permissions)
                  .filter(([, actions]) => Object.values(actions).some(Boolean))
                  .map(([key]) => key)
              : [];

            return (
              <Card key={role.id} className="transition-all duration-300 hover:shadow-md">
                <div className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-navy-600 text-sm font-bold text-white shadow-sm">
                    {role.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-navy-900">{role.name}</h3>
                      <Badge variant="primary" className="text-[10px]">
                        <Users className="mr-1 h-3 w-3" />
                        {role._count.users}
                      </Badge>
                      <Badge variant="info" className="text-[10px]">
                        <Eye className="mr-1 h-3 w-3" />
                        {permCount} permisos
                      </Badge>
                    </div>
                    {role.description && (
                      <p className="mt-0.5 text-sm text-navy-300">
                        {role.description}
                      </p>
                    )}
                    {permModules.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {permModules.slice(0, 6).map((mod) => (
                          <span
                            key={mod}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600"
                          >
                            <Check className="h-2.5 w-2.5" />
                            {getModuleLabel(mod)}
                          </span>
                        ))}
                        {permModules.length > 6 && (
                          <span className="text-[10px] text-navy-300">
                            +{permModules.length - 6} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/roles/${role.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(role)}
                      className="text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Perfil"
        message={deleteTarget ? `¿Estás seguro de eliminar el perfil "${deleteTarget.name}"? Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
