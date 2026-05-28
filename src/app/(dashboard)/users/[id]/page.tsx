"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { ArrowLeft, Save, Trash2, Loader2, User, ToggleLeft, ToggleRight } from "lucide-react";

type Role = { id: string; name: string };
type UserData = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  roleId: string | null;
  role: { id: string; name: string } | null;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [userRes, rolesRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch("/api/roles"),
      ]);
      if (userRes.ok) {
        const user: UserData = await userRes.json();
        setName(user.name || "");
        setEmail(user.email);
        setRoleId(user.roleId || "");
        setIsActive(user.isActive);
      } else {
        router.push("/users");
      }
      if (rolesRes.ok) setRoles(await rolesRes.json());
      setFetching(false);
    }
    load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body: Record<string, unknown> = {
      name,
      email,
      roleId: roleId || null,
      isActive,
    };
    if (password) body.password = password;

    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/users");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al actualizar");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    setDeleting(false);
    setShowDelete(false);
    if (res.ok) {
      router.push("/users");
    } else {
      const data = await res.json();
      alert(data.error || "Error al eliminar");
    }
  }

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy-300" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Editar Usuario
          </h1>
          <p className="text-sm text-navy-300">{email}</p>
        </div>
      </div>

      <Card className="animate-fade-in-up animate-delay-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            <CardTitle>Información del Usuario</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl bg-navy-50 p-3">
              <span className="text-sm font-medium text-navy-700">Estado:</span>
              <Badge variant={isActive ? "success" : "danger"} className="text-xs">
                {isActive ? "Activo" : "Inactivo"}
              </Badge>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="ml-auto flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-navy-600 transition-all hover:bg-white"
              >
                {isActive ? (
                  <ToggleRight className="h-5 w-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-navy-300" />
                )}
                {isActive ? "Usuario activo" : "Usuario inactivo"}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Nombre completo
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Correo electrónico
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Nueva contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar en blanco para mantener actual"
              />
              <p className="text-xs text-navy-300">
                Solo si deseas cambiar la contraseña
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Perfil / Rol
              </label>
              <Select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option value="">Sin perfil</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/users")}
                >
                  Cancelar
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDelete(true)}
                className="text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar el usuario "${name || email}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
