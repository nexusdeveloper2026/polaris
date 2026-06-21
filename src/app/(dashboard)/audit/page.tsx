"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import {
  Loader2, Search, Filter, ChevronLeft, ChevronRight,
  LogIn, LogOut, Plus, Pencil, Trash2, Upload, Download,
  KeyRound, DollarSign, RefreshCw, AlertTriangle, Shield,
  Building2, Package, Users, FileText, ClipboardList,
  Database, RotateCcw, Eye
} from "lucide-react";

type AuditLogEntry = {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId: number | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: number; name: string | null; email: string };
};

const actionConfig: Record<string, { label: string; icon: typeof Plus; color: string }> = {
  LOGIN: { label: "Inicio de Sesión", icon: LogIn, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  LOGOUT: { label: "Cierre de Sesión", icon: LogOut, color: "text-navy-500 bg-navy-50 dark:bg-white/5" },
  CREATE: { label: "Creación", icon: Plus, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
  UPDATE: { label: "Actualización", icon: Pencil, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  DELETE: { label: "Eliminación", icon: Trash2, color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
  ASSIGN: { label: "Asignación", icon: KeyRound, color: "text-violet-500 bg-violet-50 dark:bg-violet-500/10" },
  UNASSIGN: { label: "Desasignación", icon: RefreshCw, color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
  PAYMENT: { label: "Pago", icon: DollarSign, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
  EXPORT: { label: "Exportación", icon: Download, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  IMPORT: { label: "Importación", icon: Upload, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10" },
  BACKUP: { label: "Backup", icon: Database, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  RESTORE: { label: "Restauración", icon: RotateCcw, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  WIPE: { label: "Limpieza BD", icon: Trash2, color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
  STATUS_CHANGE: { label: "Cambio Estado", icon: RefreshCw, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10" },
};

const entityConfig: Record<string, { label: string; icon: typeof Building2 }> = {
  user: { label: "Usuario", icon: Users },
  company: { label: "Empresa", icon: Building2 },
  product: { label: "Producto", icon: Package },
  productCategory: { label: "Categoría", icon: Package },
  license: { label: "Licencia", icon: KeyRound },
  licenseAssignment: { label: "Asignación", icon: KeyRound },
  licensePayment: { label: "Pago Licencia", icon: DollarSign },
  visit: { label: "Visita", icon: ClipboardList },
  supportCase: { label: "Caso Soporte", icon: FileText },
  transfer: { label: "Traslado", icon: RefreshCw },
  alert: { label: "Alerta", icon: AlertTriangle },
  technicalReport: { label: "Inspección Técnica", icon: FileText },
  implementationSheet: { label: "Ficha Implementación", icon: ClipboardList },
  role: { label: "Rol", icon: Shield },
  contact: { label: "Contacto", icon: Users },
  auth: { label: "Autenticación", icon: LogIn },
  backup: { label: "Backup", icon: Database },
};

function DetailsBadge({ details }: { details: Record<string, unknown> | null }) {
  if (!details) return <span className="text-navy-300 dark:text-white/20">—</span>;
  const entries = Object.entries(details).filter(([_, v]) => v != null && v !== "");
  if (entries.length === 0) return <span className="text-navy-300 dark:text-white/20">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.slice(0, 3).map(([key, value]) => (
        <span key={key} className="inline-flex items-center gap-1 rounded-md bg-navy-50 px-1.5 py-0.5 text-[10px] text-navy-600 dark:bg-white/5 dark:text-white/50">
          {key}: {String(value).slice(0, 30)}
        </span>
      ))}
      {entries.length > 3 && (
        <span className="text-[10px] text-navy-400 dark:text-white/30">+{entries.length - 3}</span>
      )}
    </div>
  );
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entity: "",
    action: "",
    from: "",
    to: "",
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      if (filters.entity) params.set("entity", filters.entity);
      if (filters.action) params.set("action", filters.action);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

      const res = await fetch(`/api/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
        setPages(data.pages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function clearFilters() {
    setFilters({ entity: "", action: "", from: "", to: "" });
    setPage(1);
  }

  const uniqueEntities = [...new Set(logs.map((l) => l.entity))].sort();
  const uniqueActions = [...new Set(logs.map((l) => l.action))].sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro de Actividad"
        subtitle={`Registro completo de movimientos del sistema · ${total} registros`}
      />

      {/* Filters */}
      <Card className="animate-fade-in-up">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-navy-400" />
              <span className="text-sm font-medium text-navy-600 dark:text-white/60">Filtros</span>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-navy-400 dark:text-white/40 mb-1">Entidad</label>
              <Select value={filters.entity} onChange={(e) => { setFilters({ ...filters, entity: e.target.value }); setPage(1); }} className="h-8 text-xs w-40">
                <option value="">Todas</option>
                {uniqueEntities.map((e) => (
                  <option key={e} value={e}>{entityConfig[e]?.label || e}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-navy-400 dark:text-white/40 mb-1">Acción</label>
              <Select value={filters.action} onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }} className="h-8 text-xs w-40">
                <option value="">Todas</option>
                {uniqueActions.map((a) => (
                  <option key={a} value={a}>{actionConfig[a]?.label || a}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-navy-400 dark:text-white/40 mb-1">Desde</label>
              <Input type="date" value={filters.from} onChange={(e) => { setFilters({ ...filters, from: e.target.value }); setPage(1); }} className="h-8 text-xs w-36" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-navy-400 dark:text-white/40 mb-1">Hasta</label>
              <Input type="date" value={filters.to} onChange={(e) => { setFilters({ ...filters, to: e.target.value }); setPage(1); }} className="h-8 text-xs w-36" />
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters} className="h-8">
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="animate-fade-in-up animate-delay-1">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-navy-300" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-navy-400 dark:text-white/30">
              <Eye className="h-10 w-10 mb-3" />
              <p className="text-sm">No hay registros de actividad</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const action = actionConfig[log.action] || { label: log.action, icon: Eye, color: "text-navy-500 bg-navy-50" };
                    const entity = entityConfig[log.entity] || { label: log.entity, icon: Eye };
                    const ActionIcon = action.icon;
                    const EntityIcon = entity.icon;
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${action.color}`}>
                            <ActionIcon className="h-3.5 w-3.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-navy-500 dark:text-white/50 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-navy-900 dark:text-white">{log.user.name || log.user.email}</p>
                            <p className="text-[10px] text-navy-400 dark:text-white/30">{log.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.action === "DELETE" ? "danger" : log.action === "CREATE" ? "success" : log.action === "LOGIN" ? "primary" : "info"}>
                            {action.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <EntityIcon className="h-3 w-3 text-navy-400" />
                            <span className="text-sm text-navy-700 dark:text-white/70">{entity.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-navy-400 dark:text-white/30">
                          {log.entityId || "—"}
                        </TableCell>
                        <TableCell>
                          <DetailsBadge details={log.details} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-navy-100 px-4 py-3 dark:border-white/[0.06]">
              <p className="text-xs text-navy-400 dark:text-white/40">
                Página {page} de {pages} · {total} registros
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="h-7 w-7 p-0">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
