"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type User = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: { id: string; name: string } | null;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
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
    if (res.ok) loadUsers();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      loadUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Error al eliminar");
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-navy-300">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button onClick={() => router.push("/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-navy-300">
            <Users className="h-12 w-12" />
            <p className="text-sm">No hay usuarios registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-navy-900">
                        {user.name || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-navy-500">{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="primary">{user.role.name}</Badge>
                    ) : (
                      <span className="text-navy-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "danger"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-navy-400 text-sm">
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
                          <ToggleLeft className="h-4 w-4 text-navy-300" />
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
                        className="text-red-400 hover:bg-red-50 hover:text-red-600"
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
