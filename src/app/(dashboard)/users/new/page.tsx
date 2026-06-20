"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ECONOMIC_ACTIVITIES } from "@/data/economic-activities";

type Role = { id: number; name: string };

const VENEZUELAN_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
  "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital",
  "Falcón", "Guárico", "La Guaira", "Lara", "Mérida", "Miranda",
  "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira",
  "Trujillo", "Vargas", "Yaracuy", "Zulia",
];

export default function NewUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    fetch("/api/roles")
      .then((r) => r.ok && r.json())
      .then(setRoles);
  }, []);

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
    if (!form.password) missing.push("Contraseña");
    if (!form.docNumber.trim()) missing.push("Número de documento");
    if (!form.state) missing.push("Estado");

    if (missing.length > 0) {
      setError(`Los campos obligatorios están incompletos: ${missing.join(", ")}`);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: form.roleId || null,
        hasCommissions: form.hasCommissions,
        docType: form.docType,
        docNumber: form.docNumber.trim(),
        position: form.position.trim() || null,
        state: form.state || null,
        fullAddress: form.fullAddress.trim() || null,
      }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Usuario creado correctamente");
      router.push("/users");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear usuario");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
            Nuevo Usuario
          </h1>
          <p className="text-sm text-navy-400 dark:text-white/40">
            Crea un nuevo usuario y asígnale un perfil
          </p>
        </div>
      </div>

      <Card className="animate-fade-in-up animate-delay-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre del usuario"
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
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
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

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Usuario"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/users")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
