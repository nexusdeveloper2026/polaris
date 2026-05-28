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
import { formatDate, formatCurrency } from "@/lib/utils";
import { KeyRound, Plus, Pencil, Trash2, Loader2, DollarSign } from "lucide-react";

type License = {
  id: string;
  licenseKey: string;
  startDate: string;
  endDate: string;
  maxUsers: number;
  status: string;
  name: string | null;
  costUSD: number | null;
  company: { id: string; name: string };
  product: { id: string; name: string };
};

function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const statusVariant: Record<string, "success" | "danger" | "warning"> = {
  ACTIVE: "success",
  EXPIRED: "danger",
  SUSPENDED: "warning",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Activa",
  EXPIRED: "Expirada",
  SUSPENDED: "Suspendida",
};

export default function LicensesPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadLicenses(); }, []);

  async function loadLicenses() {
    try {
      const res = await fetch("/api/licenses");
      if (res.ok) setLicenses(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/licenses/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      loadLicenses();
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
            Licencias
          </h1>
          <p className="mt-1 text-sm text-navy-300">
            Gestiona las licencias de productos y servicios
          </p>
        </div>
        <Button onClick={() => router.push("/licenses/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Licencia
        </Button>
      </div>

      {licenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-navy-300">
            <KeyRound className="h-12 w-12" />
            <p className="text-sm">No hay licencias registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Clave</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Días Rest.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell className="font-medium text-navy-900">
                    {license.name || <span className="text-navy-300">—</span>}
                  </TableCell>
                  <TableCell className="text-navy-500">
                    {license.company.name}
                  </TableCell>
                  <TableCell className="text-navy-500">
                    {license.product.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-navy-400">
                    {license.licenseKey}
                  </TableCell>
                  <TableCell className="text-navy-700">
                    {license.costUSD != null ? (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-emerald-500" />
                        {formatCurrency(license.costUSD)}
                      </span>
                    ) : <span className="text-navy-300">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-navy-400">
                    {formatDate(license.startDate)}
                  </TableCell>
                  <TableCell className="text-sm text-navy-400">
                    {formatDate(license.endDate)}
                  </TableCell>
                  <TableCell className="text-navy-700">
                    {daysRemaining(license.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[license.status] ?? "default"}>
                      {statusLabel[license.status] ?? license.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/licenses/${license.id}`)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(license)}
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
        title="Eliminar Licencia"
        message={deleteTarget ? `¿Estás seguro de eliminar la licencia "${deleteTarget.licenseKey}" de ${deleteTarget.company.name}? Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
