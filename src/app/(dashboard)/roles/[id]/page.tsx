"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ConfirmDialog } from "@/components/ui/modal";
import { ArrowLeft, Save, Trash2, Loader2, Shield } from "lucide-react";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Permissions>(buildDefaultPermissions());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/roles/${id}`);
      if (res.ok) {
        const role = await res.json();
        setName(role.name);
        setDescription(role.description || "");
        if (role.permissions) {
          const merged = buildDefaultPermissions();
          for (const [mod, actions] of Object.entries(role.permissions)) {
            if (merged[mod]) {
              merged[mod] = { ...merged[mod], ...(actions as any) };
            }
          }
          setPermissions(merged);
        }
      } else {
        router.push("/roles");
      }
      setFetching(false);
    }
    load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, permissions }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/roles");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al actualizar");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
    setDeleting(false);
    setShowDelete(false);
    if (res.ok) {
      router.push("/roles");
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Editar Perfil
          </h1>
          <p className="text-sm text-navy-300">{name}</p>
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

        <div className="animate-fade-in-up animate-delay-3 flex items-center justify-between">
          <div className="flex gap-3">
            <Button type="submit" size="lg" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar Cambios"}
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

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar Perfil"
        message={`¿Estás seguro de eliminar el perfil "${name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
