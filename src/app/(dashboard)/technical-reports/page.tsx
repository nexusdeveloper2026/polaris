"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  FileText, Plus, Eye, Pencil, Trash2, Loader2, Search,
  CheckCircle, XCircle, Clock, AlertTriangle, Building2,
} from "lucide-react";

type Report = {
  id: number;
  title: string;
  reportType: string;
  status: string;
  qualification: string;
  company: { id: number; name: string; taxId: string | null };
  creator: { id: number; name: string | null; email: string };
  createdAt: string;
};

const typeLabels: Record<string, string> = {
  SOFTWARE_DEV: "Software / Desarrollo",
  TELECOM_NETWORK: "Red Telecomunicaciones",
  SECURITY_ELECTRONIC: "Seguridad Electrónica",
  TECH_SUPPORT: "Soporte Técnico",
  OTHER: "Otro",
};

const typeColors: Record<string, string> = {
  SOFTWARE_DEV: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  TELECOM_NETWORK: "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10",
  SECURITY_ELECTRONIC: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
  TECH_SUPPORT: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
  OTHER: "text-gray-500 bg-gray-50 dark:bg-gray-500/10",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Finalizado",
  UNDER_REVIEW: "En Revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

const statusConfig: Record<string, { variant: "default" | "primary" | "success" | "warning" | "danger" | "info"; icon: typeof Clock }> = {
  DRAFT: { variant: "default", icon: Clock },
  SUBMITTED: { variant: "success", icon: CheckCircle },
  UNDER_REVIEW: { variant: "warning", icon: AlertTriangle },
  APPROVED: { variant: "success", icon: CheckCircle },
  REJECTED: { variant: "danger", icon: XCircle },
};

export default function TechnicalReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({ reportType: "", status: "", search: "" });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.reportType) params.set("reportType", filters.reportType);
      if (filters.status) params.set("status", filters.status);
      const res = await fetch(`/api/technical-reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/technical-reports/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Inspección eliminada");
        setReports((prev) => prev.filter((r) => r.id !== deleteId));
        setDeleteId(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al eliminar");
      }
    } finally {
      setDeleting(false);
    }
  }

  const filtered = reports.filter((r) =>
    !filters.search || r.title.toLowerCase().includes(filters.search.toLowerCase()) || r.company.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspecciones Técnicas"
        subtitle="Levantamiento de información en campo para determinar elegibilidad de instalación"
        actions={
          <Link href="/technical-reports/new">
            <Button><Plus className="mr-2 h-4 w-4" />Nueva Inspección</Button>
          </Link>
        }
      />

      <Card className="animate-fade-in-up">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
              <Input placeholder="Buscar por título o empresa..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
            </div>
            <Select value={filters.reportType} onChange={(e) => setFilters({ ...filters, reportType: e.target.value })} className="w-48">
              <option value="">Todos los tipos</option>
              {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-44">
              <option value="">Todos los estados</option>
              {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up animate-delay-1">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-navy-300" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<FileText className="h-12 w-12" />} message="No hay inspecciones registradas" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const sc = statusConfig[r.status] || statusConfig.DRAFT;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-navy-900 dark:text-white">{r.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3 w-3 text-navy-400" />
                            <span className="text-sm text-navy-600 dark:text-white/60">{r.company.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ${typeColors[r.reportType] || ""}`}>
                            {typeLabels[r.reportType] || r.reportType}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={sc.variant}>{statusLabels[r.status]}</Badge></TableCell>
                        <TableCell className="text-sm text-navy-500 dark:text-white/50">{r.creator.name || r.creator.email}</TableCell>
                        <TableCell className="text-xs text-navy-400 dark:text-white/30">{formatDate(r.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/technical-reports/${r.id}`)} className="h-7 w-7 p-0">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/technical-reports/${r.id}/edit`)} className="h-7 w-7 p-0">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)} className="h-7 w-7 p-0 text-red-500 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Inspección"
        message="¿Estás seguro de eliminar esta inspección técnica? Esta acción no se puede deshacer."
        confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
        loading={deleting}
      />
    </div>
  );
}
