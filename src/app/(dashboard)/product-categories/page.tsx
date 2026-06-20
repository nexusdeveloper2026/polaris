"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { Tags, Plus, Pencil, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { products: number };
};

export default function ProductCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/product-categories");
      if (res.ok) setCategories(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setFormName("");
    setFormDesc("");
    setFormError("");
    setEditing(null);
    setShowCreate(true);
  }

  function openEdit(cat: Category) {
    setFormName(cat.name);
    setFormDesc(cat.description || "");
    setFormError("");
    setEditing(cat);
    setShowCreate(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("El nombre es requerido");
      return;
    }
    setFormLoading(true);
    setFormError("");

    try {
      if (editing) {
        const res = await fetch(`/api/product-categories/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() || null }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al actualizar");
        }
        toast.success("Categoría actualizada correctamente");
      } else {
        const res = await fetch("/api/product-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() || null }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al crear");
        }
        toast.success("Categoría creada correctamente");
      }
      setShowCreate(false);
      loadCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/product-categories/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      toast.success("Categoría eliminada correctamente");
      loadCategories();
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al eliminar");
    }
  }

  const filtered = categories.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

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
            Categorías
          </h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-white/40">
            Gestiona las categorías de productos y servicios
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          {search && (
            <Button variant="ghost" onClick={() => setSearch("")}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-navy-300 dark:text-white/30">
            <Tags className="h-12 w-12" />
            <p className="text-sm">No hay categorías registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-navy-900 dark:text-white">{cat.name}</TableCell>
                  <TableCell className="text-navy-500 dark:text-white/50">{cat.description || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="info">{cat._count?.products ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cat.isActive ? "success" : "danger"}>
                      {cat.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-navy-400 dark:text-white/40 text-sm">
                    {formatDate(cat.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu
                        align="right"
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: "Editar",
                            icon: <Pencil className="h-4 w-4" />,
                            onClick: () => openEdit(cat),
                          },
                          { label: "", icon: null, onClick: () => {} },
                          {
                            label: "Eliminar",
                            icon: <Trash2 className="h-4 w-4" />,
                            onClick: () => setDeleteTarget(cat),
                            variant: "danger" as const,
                          },
                        ]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-navy-100 bg-white p-6 shadow-xl dark:border-white/[0.06] dark:bg-navy-800">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">
              {editing ? "Editar Categoría" : "Nueva Categoría"}
            </h2>
            <p className="mt-1 text-sm text-navy-400 dark:text-white/40">
              {editing ? "Modifica el nombre y descripción" : "Crea una nueva categoría para productos o servicios"}
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {formError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">Descripción</label>
                <Input
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Descripción (opcional)"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Guardar Cambios" : "Crear Categoría"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de eliminar la categoría "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
