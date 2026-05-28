"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, UserPlus } from "lucide-react";

type Role = { id: string; name: string };

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.ok && r.json())
      .then(setRoles);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, roleId: roleId || null }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/users");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear usuario");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Nuevo Usuario
          </h1>
          <p className="text-sm text-navy-300">
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
              <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Nombre completo
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del usuario"
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
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
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
