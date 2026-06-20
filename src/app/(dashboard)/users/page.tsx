"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { Users, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

type User = {
  id: number;
  name: string | null;
  email: string;
  isActive: boolean;
  state: string | null;
  createdAt: string;
  role: { id: number; name: string } | null;
};

type Role = { id: number; name: string };

const VENEZUELAN_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital",
  "Falcón", "Guárico", "La Guaira", "Lara", "Mérida", "Miranda",
  "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira",
  "Trujillo", "Vargas", "Yaracuy", "Zulia",
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    fetch("/api/roles").then((r) => r.ok && r.json()).then(setRoles).catch(() => {});
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadUsers(), 300);
    return () => clearTimeout(timeout);
  }, [search, roleFilter, statusFilter, stateFilter]);

  async function loadUsers() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("roleId", roleFilter);
      if (statusFilter) params.set("isActive", statusFilter);
      if (stateFilter) params.set("state", stateFilter);
      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(user: User) {
    setToggling(user.id);
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    setToggling(null);
    if (res.ok) {
      toast.success(`Usuario ${user.isActive ? "desactivado" : "activado"} correctamente`);
      loadUsers();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al eliminar");
    }
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setStateFilter("");
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy-300 dark:text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-white/40">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button onClick={() => router.push("/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-44">
            <option value="">Todos los perfiles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">Todos los estatus</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </Select>
          <Select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="w-48">
            <option value="">Todos los estados</option>
            {VENEZUELAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          {(search || roleFilter || statusFilter || stateFilter) && (
            <Button variant="ghost" onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-navy-300 dark:text-white/30">
            <Users className="h-12 w-12" />
            <p className="text-sm">No hay usuarios registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-navy-900 dark:text-white">
                        {user.name || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-navy-500 dark:text-white/50">{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="primary">{user.role.name}</Badge>
                    ) : (
                      <span className="text-navy-300 dark:text-white/30">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-navy-500 dark:text-white/50">
                    {user.state || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "danger"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-navy-400 dark:text-white/40 text-sm">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(user)}
                        disabled={toggling === user.id}
                        title={user.isActive ? "Desactivar" : "Activar"}
                      >
                        {toggling === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.isActive ? (
                          <ToggleRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-navy-300 dark:text-white/30" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/users/${user.id}`)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(user)}
                        className="text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={deleteTarget ? `¿Estás seguro de eliminar el usuario "${deleteTarget.name || deleteTarget.email}"? Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
