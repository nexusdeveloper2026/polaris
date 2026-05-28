"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PermissionEditor } from "@/components/permission-editor";
import { buildDefaultPermissions, type Permissions } from "@/lib/permissions";
import { ArrowLeft, Save, Shield } from "lucide-react";

export default function NewRolePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Permissions>(buildDefaultPermissions());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, permissions }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/roles");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear perfil");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Nuevo Perfil
          </h1>
          <p className="text-sm text-navy-300">
            Define el nombre, descripción y permisos del perfil
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="animate-fade-in-up animate-delay-1">
          <CardHeader>
            <CardTitle>Información del Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Nombre del Perfil
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Administrador, Técnico, Ventas"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Descripción
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe las responsabilidades de este perfil"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <CardTitle>Permisos del Sistema</CardTitle>
            </div>
            <p className="text-sm text-navy-300">
              Selecciona los módulos y acciones a los que este perfil tendrá acceso
            </p>
          </CardHeader>
          <CardContent>
            <PermissionEditor
              value={permissions}
              onChange={setPermissions}
            />
          </CardContent>
        </Card>

        <div className="animate-fade-in-up animate-delay-3 flex gap-3">
          <Button type="submit" size="lg" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Guardando..." : "Guardar Perfil"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push("/roles")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
