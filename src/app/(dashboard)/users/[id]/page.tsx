"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

type Role = { id: number; name: string };
type UserData = {
  id: number;
  name: string | null;
  email: string;
  isActive: boolean;
  hasCommissions: boolean;
  docType: string | null;
  docNumber: string | null;
  position: string | null;
  state: string | null;
  fullAddress: string | null;
  roleId: number | null;
  role: { id: number; name: string } | null;
};

const VENEZUELAN_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital",
  "Falcón", "Guárico", "La Guaira", "Lara", "Mérida", "Miranda",
  "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira",
  "Trujillo", "Vargas", "Yaracuy", "Zulia",
];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    hasCommissions: false,
    docType: "V",
    docNumber: "",
    position: "",
    state: "",
    fullAddress: "",
  });

  useEffect(() => {
    async function load() {
      const [userRes, rolesRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch("/api/roles"),
      ]);
      if (userRes.ok) {
        const user: UserData = await userRes.json();
        setForm({
          name: user.name || "",
          email: user.email,
          password: "",
          roleId: user.roleId != null ? String(user.roleId) : "",
          hasCommissions: user.hasCommissions ?? false,
          docType: user.docType || "V",
          docNumber: user.docNumber || "",
          position: user.position || "",
          state: user.state || "",
          fullAddress: user.fullAddress || "",
        });
        setIsActive(user.isActive);
      } else {
        router.push("/users");
      }
      if (rolesRes.ok) setRoles(await rolesRes.json());
      setFetching(false);
    }
    load();
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const missing: string[] = [];
    if (!form.name.trim()) missing.push("Nombre completo");
    if (!form.email.trim()) missing.push("Correo electrónico");
    if (!form.docNumber.trim()) missing.push("Número de documento");
    if (!form.state) missing.push("Estado");

    if (missing.length > 0) {
      setError(`Los campos obligatorios están incompletos: ${missing.join(", ")}`);
      setLoading(false);
      return;
    }

    const body: Record<string, unknown> = {
      name: form.name.trim(),
      email: form.email.trim(),
      roleId: form.roleId || null,
      isActive,
      hasCommissions: form.hasCommissions,
      docType: form.docType,
      docNumber: form.docNumber.trim(),
      position: form.position.trim() || null,
      state: form.state || null,
      fullAddress: form.fullAddress.trim() || null,
    };
    if (form.password) body.password = form.password;

    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Usuario actualizado correctamente");
      router.push("/users");
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
      toast.success("Usuario eliminado correctamente");
      router.push("/users");
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al eliminar");
    }
  }

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy-300 dark:text-white/30" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
            Editar Usuario
          </h1>
          <p className="text-sm text-navy-400 dark:text-white/40">{form.email}</p>
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
              <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl bg-navy-50 p-3 dark:bg-white/[0.03]">
              <span className="text-sm font-medium text-navy-700 dark:text-white/70">Estado:</span>
              <Badge variant={isActive ? "success" : "danger"} className="text-xs">
                {isActive ? "Activo" : "Inactivo"}
              </Badge>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="ml-auto flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-navy-600 transition-all hover:bg-white dark:text-white/70 dark:hover:bg-white/5"
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
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Nueva contraseña
              </label>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Dejar en blanco para mantener actual"
              />
              <p className="text-xs text-navy-300 dark:text-white/30">
                Solo si deseas cambiar la contraseña
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Perfil / Rol
              </label>
              <Select name="roleId" value={form.roleId} onChange={handleChange}>
                <option value="">Sin perfil</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                  Tipo Doc. <span className="text-red-500">*</span>
                </label>
                <Select name="docType" value={form.docType} onChange={handleChange}>
                  <option value="V">V</option>
                  <option value="E">E</option>
                  <option value="P">P</option>
                  <option value="J">J</option>
                  <option value="G">G</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                  Nro. de Documento <span className="text-red-500">*</span>
                </label>
                <Input
                  name="docNumber"
                  value={form.docNumber}
                  onChange={handleChange}
                  placeholder="Número de documento"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Cargo
              </label>
              <Input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Cargo o puesto"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Estado <span className="text-red-500">*</span>
              </label>
              <Select name="state" value={form.state} onChange={handleChange}>
                <option value="">Seleccionar estado</option>
                {VENEZUELAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Dirección Completa
              </label>
              <Textarea
                name="fullAddress"
                value={form.fullAddress}
                onChange={handleChange}
                placeholder="Dirección completa del usuario"
                rows={3}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="hasCommissions"
                checked={form.hasCommissions}
                onChange={handleChange}
                className="h-4 w-4 rounded border-navy-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-navy-700 dark:text-white/70">Aplica para comisiones (Representante de Ventas)</span>
            </label>

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
                className="text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
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
        message={`¿Estás seguro de eliminar el usuario "${form.name || form.email}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
