"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { formatCurrency, PERIOD_DAYS, calculateDailyPrice } from "@/lib/utils";
import { Package, Plus, Pencil, Trash2, Eye, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Category = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  description: string | null;
  type: "PRODUCT" | "SERVICE";
  cost: number;
  price: number;
  discountPercent: number;
  ivaPercent: number;
  paymentPeriod: string;
  dailyPrice: number;
  isActive: boolean;
  categoryId: number | null;
  category: Category | null;
  createdAt: string;
};

const typeBadge: Record<string, { label: string; variant: "primary" | "info" }> = {
  PRODUCT: { label: "Producto", variant: "primary" },
  SERVICE: { label: "Servicio", variant: "info" },
};

const periodLabels: Record<string, string> = {
  ONE_TIME: "Único",
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  SEMI_ANNUAL: "Semestral",
  ANNUAL: "Anual",
  OTHER: "Otro",
};

function ActionsDropdown({ product, onEdit, onDelete }: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const router = useRouter();
  return (
    <DropdownMenu
      align="right"
      trigger={
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
      items={[
        {
          label: "Ver detalles",
          icon: <Eye className="h-4 w-4" />,
          onClick: () => router.push(`/products/${product.id}`),
        },
        {
          label: "Editar",
          icon: <Pencil className="h-4 w-4" />,
          onClick: () => onEdit(product),
        },
        { label: "", icon: null, onClick: () => {} },
        {
          label: "Eliminar",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => onDelete(product),
          variant: "danger" as const,
        },
      ]}
    />
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/product-categories").then((r) => r.json()),
    ]).then(([productsData, categoriesData]) => {
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {}, 300);
    return () => clearTimeout(timeout);
  }, [search, typeFilter, categoryFilter]);

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    if (categoryFilter && p.categoryId !== Number(categoryFilter)) return false;
    return true;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      toast.success("Producto desactivado correctamente");
      setProducts((prev) => prev.map((p) => p.id === deleteTarget.id ? { ...p, isActive: false } : p));
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al eliminar");
    }
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("");
    setCategoryFilter("");
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
            Productos y Servicios
          </h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-white/40">
            Gestiona el catálogo de productos y servicios
          </p>
        </div>
        <Button onClick={() => router.push("/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto / Servicio
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
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
            <option value="">Todos los tipos</option>
            <option value="PRODUCT">Producto</option>
            <option value="SERVICE">Servicio</option>
          </Select>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-48">
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          {(search || typeFilter || categoryFilter) && (
            <Button variant="ghost" onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-navy-300 dark:text-white/30">
            <Package className="h-12 w-12" />
            <p className="text-sm">No hay productos registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Precio Final</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20">
                        <Package className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <span className="font-medium text-navy-900 dark:text-white">
                          {product.name}
                        </span>
                        {product.description && (
                          <p className="text-xs text-navy-400 dark:text-white/40 truncate max-w-[200px]">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-navy-500 dark:text-white/50">
                    {product.category?.name || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadge[product.type]?.variant ?? "default"}>
                      {typeBadge[product.type]?.label ?? product.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-navy-500 dark:text-white/50 text-sm">
                    {periodLabels[product.paymentPeriod] || "—"}
                  </TableCell>
                  <TableCell className="text-navy-700 dark:text-white/70">
                    {formatCurrency(product.cost)}
                  </TableCell>
                  <TableCell className="text-navy-700 dark:text-white/70">
                    {(() => {
                      const p = product.price;
                      const d = p * (product.discountPercent / 100);
                      const afterD = p - d;
                      const iva = afterD * (product.ivaPercent / 100);
                      const finalP = afterD + iva;
                      return (
                        <div>
                          {product.discountPercent > 0 && (
                            <span className="text-xs text-navy-400 line-through dark:text-white/30">{formatCurrency(p)}</span>
                          )}
                          <span className={product.discountPercent > 0 ? "ml-1 text-emerald-600 dark:text-emerald-400 font-medium" : "font-medium"}>
                            {formatCurrency(finalP)}
                          </span>
                          {product.ivaPercent > 0 && (
                            <span className="ml-1 text-xs text-purple-500 dark:text-purple-400">(IVA {product.ivaPercent}%)</span>
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "success" : "danger"}>
                      {product.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ActionsDropdown
                        product={product}
                        onEdit={(p) => router.push(`/products/${p.id}/edit`)}
                        onDelete={setDeleteTarget}
                      />
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
        title="Eliminar Producto"
        message={`¿Estás seguro de desactivar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Desactivar"
        loading={deleting}
      />
    </div>
  );
}
