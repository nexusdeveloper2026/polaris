"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  KeyRound, Plus, Pencil, Trash2, Eye, MoreHorizontal, Loader2,
  AlertTriangle, Clock, Shield, Package, Building2, Search,
  XCircle, RefreshCw, DollarSign, CalendarDays, Copy, Check, Zap,
  Link2, Store, ChevronRight, ArrowLeft, CheckCircle, Truck
} from "lucide-react";

type LicenseAssignment = {
  id: number;
  licenseId: number;
  companyId: number;
  branchId: number | null;
  status: string;
  renewalPeriod: string | null;
  company: { id: number; name: string };
  branch: { id: number; name: string } | null;
  assignedAt: string;
};

type License = {
  id: number;
  licenseKey: string;
  licenseId: string | null;
  name: string | null;
  startDate: string;
  endDate: string;
  maxUsers: number;
  status: string;
  costUSD: number | null;
  discountPercent: number | null;
  licenseType: string | null;
  version: string | null;
  edition: string | null;
  maxActivations: number | null;
  usedActivations: number | null;
  autoRenew: boolean;
  renewalDate: string | null;
  renewalPeriod: string | null;
  vendor: string | null;
  product: { id: number; name: string; category: { name: string } | null };
  assignments: LicenseAssignment[];
};

type Company = { id: number; name: string; branches?: { id: number; name: string }[] };

type ExistingAssignment = {
  assignmentId: number;
  renewalPeriod: string | null;
  status: string;
  companyName: string;
  branchName: string | null;
};

function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const statusVariant: Record<string, "success" | "danger" | "warning" | "info"> = {
  ACTIVE: "success",
  EXPIRED: "danger",
  SUSPENDED: "warning",
  CANCELLED: "danger",
  PENDING: "info",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Activa",
  EXPIRED: "Expirada",
  SUSPENDED: "Suspendida",
  CANCELLED: "Cancelada",
  PENDING: "Pendiente",
};

const licenseTypeLabel: Record<string, string> = {
  PERPETUAL: "Perpetua",
  SUBSCRIPTION: "Suscripción",
  TRIAL: "Prueba",
  OEM: "OEM",
  VOLUME: "Volumen",
  NAMED_USER: "Usuario Nombrado",
  CONCURRENT: "Concurrente",
};

const renewalPeriodLabel: Record<string, string> = {
  MONTHLY: "Mensual",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  SEMI_ANNUAL: "Semestral",
  ANNUAL: "Anual",
};

function StatusBadge({ status }: { status: string }) {
  const variant = statusVariant[status] ?? "default";
  return <Badge variant={variant}>{statusLabel[status] ?? status}</Badge>;
}

function DaysBadge({ endDate }: { endDate: string }) {
  const days = daysRemaining(endDate);
  if (days === 0) return <Badge variant="danger">Vencida</Badge>;
  if (days <= 7) return <Badge variant="danger">{days}d restantes</Badge>;
  if (days <= 30) return <Badge variant="warning">{days}d restantes</Badge>;
  return <Badge variant="success">{days}d restantes</Badge>;
}

function ActionsDropdown({ license, onEdit, onDelete }: {
  license: License;
  onEdit: (l: License) => void;
  onDelete: (l: License) => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function copyKey() {
    navigator.clipboard.writeText(license.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          onClick: () => router.push(`/licenses/${license.id}`),
        },
        {
          label: "Editar",
          icon: <Pencil className="h-4 w-4" />,
          onClick: () => onEdit(license),
        },
        {
          label: copied ? "Copiado" : "Copiar clave",
          icon: copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />,
          onClick: copyKey,
        },
        { label: "", icon: null, onClick: () => {} },
        {
          label: "Eliminar",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => onDelete(license),
          variant: "danger" as const,
        },
      ]}
    />
  );
}

export default function LicensesPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStep, setAssignStep] = useState(1);
  const [templateLicense, setTemplateLicense] = useState<License | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<Record<number, number[]>>({});
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
  const [renewalPeriod, setRenewalPeriod] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [existingAssignments, setExistingAssignments] = useState<Record<string, ExistingAssignment>>({});
  const [unassignTargets, setUnassignTargets] = useState<number[]>([]);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    assignmentId: number;
    licenseId: number;
    entityName: string;
    currentStatus: string;
    newStatus: string;
  } | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [unassignConfirmTarget, setUnassignConfirmTarget] = useState<{
    assignmentId: number;
    entityName: string;
  } | null>(null);
  const [unassigning, setUnassigning] = useState(false);

  useEffect(() => { loadLicenses(); }, []);

  async function loadCompanies() {
    try {
      const res = await fetch("/api/companies?type=MAIN&limit=200");
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.data ?? json);
      }
    } catch {}
  }

  async function loadLicenses() {
    setLoading(true);
    try {
      const res = await fetch("/api/licenses");
      if (res.ok) setLicenses(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function openAssignModal() {
    setAssignStep(1);
    setTemplateLicense(null);
    setSelectedCompanies([]);
    setSelectedBranches({});
    setExpandedCompany(null);
    setRenewalPeriod("");
    setExistingAssignments({});
    setUnassignTargets([]);
    loadCompanies();
    setShowAssignModal(true);
  }

  function buildExistingMap(license: License): Record<string, ExistingAssignment> {
    const map: Record<string, ExistingAssignment> = {};
    for (const a of license.assignments) {
      const key = a.branchId ? `${a.companyId}:${a.branchId}` : a.companyId;
      map[key] = {
        assignmentId: a.id,
        renewalPeriod: a.renewalPeriod || null,
        status: a.status,
        companyName: a.company.name,
        branchName: a.branch?.name || null,
      };
    }
    return map;
  }

  function selectLicense(license: License) {
    setTemplateLicense(license);
    setSelectedCompanies([]);
    setSelectedBranches({});
    setExistingAssignments(buildExistingMap(license));
    setUnassignTargets([]);
    setAssignStep(2);
  }

  function toggleCompany(companyId: number) {
    setSelectedCompanies((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
    );
  }

  function toggleBranch(companyId: number, branchId: number) {
    setSelectedBranches((prev) => {
      const current = prev[companyId] || [];
      const updated = current.includes(branchId)
        ? current.filter((id) => id !== branchId)
        : [...current, branchId];
      return { ...prev, [companyId]: updated };
    });
  }

  function toggleUnassign(key: number | string) {
    const assignmentId = typeof key === 'string'
      ? existingAssignments[key]?.assignmentId
      : existingAssignments[String(key)]?.assignmentId;
    if (!assignmentId) return;
    setUnassignTargets((prev) =>
      prev.includes(assignmentId) ? prev.filter((k) => k !== assignmentId) : [...prev, assignmentId]
    );
  }

  async function handleAssign() {
    if (!templateLicense) return;

    const newAssignments: { companyId: number; branchId?: number }[] = [];

    for (const companyId of selectedCompanies) {
      if (existingAssignments[String(companyId)]) continue;
      const branches = selectedBranches[companyId] || [];
      if (branches.length === 0) {
        newAssignments.push({ companyId });
      } else {
        for (const branchId of branches) {
          if (!existingAssignments[`${companyId}:${branchId}`]) {
            newAssignments.push({ companyId, branchId });
          }
        }
      }
    }

    for (const [companyIdStr, branchIds] of Object.entries(selectedBranches)) {
      const companyId = Number(companyIdStr);
      if (selectedCompanies.includes(companyId)) continue;
      for (const branchId of branchIds) {
        if (!existingAssignments[`${companyId}:${branchId}`]) {
          newAssignments.push({ companyId, branchId });
        }
      }
    }

    if (newAssignments.length === 0 && unassignTargets.length === 0) {
      toast.error("Selecciona al menos una empresa/sucursal nueva o marca una asignación para desasignar");
      return;
    }

    setAssigning(true);
    try {
      let created = 0;
      let removed = 0;

      if (newAssignments.length > 0) {
        const res = await fetch("/api/licenses/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            licenseId: templateLicense.id,
            assignments: newAssignments,
            renewalPeriod: renewalPeriod || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          created = data.created;
        } else {
          const data = await res.json().catch(() => null);
          toast.error(data?.error || `Error ${res.status}: ${res.statusText}`);
        }
      }

      for (const key of unassignTargets) {
        const existing = existingAssignments[key];
        if (!existing) continue;
        const res = await fetch("/api/licenses/unassign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId: existing.assignmentId }),
        });
        if (res.ok) removed++;
      }

      if (created > 0) toast.success(`${created} asignación(es) creada(s) correctamente`);
      if (removed > 0) toast.success(`${removed} asignación(es) eliminada(s) correctamente`);
      if (created === 0 && removed === 0) toast.info("No se realizaron cambios");

      setShowAssignModal(false);
      loadLicenses();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error de conexión: ${msg}`);
    } finally {
      setAssigning(false);
    }
  }

  async function handleStatusChange() {
    if (!statusChangeTarget) return;
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/licenses/${statusChangeTarget.licenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusChangeTarget.newStatus }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast.success(`Licencia ${statusChangeTarget.newStatus === "ACTIVE" ? "activada" : "inactivada"} para ${statusChangeTarget.entityName}`);
        setStatusChangeTarget(null);
        if (templateLicense) {
          const updated = await fetch(`/api/licenses`).then((r) => r.json()).then((all: License[]) => all.find((l) => l.id === templateLicense.id));
          if (updated) {
            setTemplateLicense(updated);
            setExistingAssignments(buildExistingMap(updated));
          }
        }
        loadLicenses();
      } else {
        toast.error(data?.error || `Error ${res.status}: ${res.statusText}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error de conexión: ${msg}`);
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleUnassign() {
    if (!unassignConfirmTarget) return;
    setUnassigning(true);
    try {
      const res = await fetch("/api/licenses/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: unassignConfirmTarget.assignmentId }),
      });
      if (res.ok) {
        toast.success(`Licencia desasignada de ${unassignConfirmTarget.entityName}`);
        setUnassignConfirmTarget(null);
        if (templateLicense) {
          const updated = await fetch(`/api/licenses`).then((r) => r.json()).then((all: License[]) => all.find((l) => l.id === templateLicense.id));
          if (updated) {
            setTemplateLicense(updated);
            setExistingAssignments(buildExistingMap(updated));
          }
        }
        loadLicenses();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || `Error al desasignar`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error de conexión: ${msg}`);
    } finally {
      setUnassigning(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/licenses/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      toast.success("Licencia eliminada correctamente");
      loadLicenses();
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al eliminar");
    }
  }

  const filtered = useMemo(() => licenses.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !l.name?.toLowerCase().includes(q) &&
        !l.licenseKey.toLowerCase().includes(q) &&
        !l.licenseId?.toLowerCase().includes(q) &&
        !l.product.name.toLowerCase().includes(q) &&
        !l.vendor?.toLowerCase().includes(q) &&
        !l.assignments.some((a) => a.company.name.toLowerCase().includes(q))
      ) return false;
    }
    if (statusFilter && l.status !== statusFilter) return false;
    if (typeFilter && l.licenseType !== typeFilter) return false;
    return true;
  }), [licenses, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = licenses.length;
    const activeAssignments = licenses.reduce(
      (sum, l) => sum + l.assignments.filter((a) => a.status === "ACTIVE").length,
      0
    );
    const expiringSoon = licenses.filter(
      (l) => l.status === "ACTIVE" && daysRemaining(l.endDate) <= 30 && daysRemaining(l.endDate) > 0
    ).length;
    const expired = licenses.filter((l) => l.status === "EXPIRED").length;
    const totalCost = licenses.reduce((sum, l) => sum + (Number(l.costUSD) || 0), 0);
    return { total, activeAssignments, expiringSoon, expired, totalCost };
  }, [licenses]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy-300 dark:text-white/30" />
      </div>
    );
  }

  const newCount = templateLicense
    ? selectedCompanies.filter((id) => !existingAssignments[String(id)]).length +
      Object.entries(selectedBranches).reduce((acc, [companyIdStr, branchIds]) => {
        const companyId = Number(companyIdStr);
        if (existingAssignments[String(companyId)]) return acc;
        return acc + branchIds.filter((bid) => !existingAssignments[`${companyId}:${bid}`]).length;
      }, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
            Licencias
          </h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-white/40">
            Gestión y control de licencias de software
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAssignModal} className="gap-2">
            <Link2 className="h-4 w-4" />
            Asignar Licencia
          </Button>
          <Button onClick={() => router.push("/licenses/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Licencia
          </Button>
        </div>
      </div>

      <div className="animate-fade-in-up animate-delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <KeyRound className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-navy-400 dark:text-white/40">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.activeAssignments}</p>
              <p className="text-xs text-navy-400 dark:text-white/40">Asignaciones Activas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.expiringSoon}</p>
              <p className="text-xs text-navy-400 dark:text-white/40">Por vencer</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.expired}</p>
              <p className="text-xs text-navy-400 dark:text-white/40">Expiradas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
              <DollarSign className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-navy-900 dark:text-white">{formatCurrency(stats.totalCost)}</p>
              <p className="text-xs text-navy-400 dark:text-white/40">Inversión Total</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300 dark:text-white/30" />
            <Input
              placeholder="Buscar por nombre, clave, producto, proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activa</option>
            <option value="EXPIRED">Expirada</option>
            <option value="SUSPENDED">Suspendida</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="PENDING">Pendiente</option>
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-44">
            <option value="">Todos los tipos</option>
            <option value="PERPETUAL">Perpetua</option>
            <option value="SUBSCRIPTION">Suscripción</option>
            <option value="TRIAL">Prueba</option>
            <option value="OEM">OEM</option>
            <option value="VOLUME">Volumen</option>
            <option value="NAMED_USER">Usuario Nombrado</option>
            <option value="CONCURRENT">Concurrente</option>
          </Select>
          {(search || statusFilter || typeFilter) && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1.5">
              <XCircle className="h-3.5 w-3.5" />
              Limpiar
            </Button>
          )}
          <Button variant="ghost" onClick={loadLicenses} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-navy-300 dark:text-white/30">
            <KeyRound className="h-12 w-12" />
            <p className="text-sm">No hay licencias registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up animate-delay-2 rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LICENCIA</TableHead>
                <TableHead>PROVEEDOR</TableHead>
                <TableHead>PRODUCTO</TableHead>
                <TableHead>TIPO</TableHead>
                <TableHead>VIGENCIA</TableHead>
                <TableHead>COSTO</TableHead>
                <TableHead>ASIGNACIONES</TableHead>
                <TableHead>ESTADO</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((license) => {
                const totalCost = license.costUSD && license.discountPercent
                  ? Number(license.costUSD) * (1 - Number(license.discountPercent) / 100)
                  : Number(license.costUSD) || 0;
                return (
                  <TableRow key={license.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium text-navy-900 dark:text-white">
                          {license.name || license.licenseId || <span className="text-navy-300 dark:text-white/30">Sin nombre</span>}
                        </p>
                        <p className="font-mono text-xs text-navy-400 dark:text-white/40">{license.licenseKey}</p>
                        {license.edition && (
                          <p className="text-xs text-navy-400 dark:text-white/40">{license.edition}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-navy-300 dark:text-white/30" />
                        <p className="text-sm text-navy-700 dark:text-white/70">{license.vendor || "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-navy-300 dark:text-white/30" />
                        <div>
                          <p className="text-sm text-navy-700 dark:text-white/70">{license.product.name}</p>
                          {license.product.category && (
                            <p className="text-xs text-navy-400 dark:text-white/40">{license.product.category.name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {licenseTypeLabel[license.licenseType || "SUBSCRIPTION"] || license.licenseType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-xs text-navy-500 dark:text-white/50">
                          {formatDate(license.startDate)} — {formatDate(license.endDate)}
                        </p>
                        <DaysBadge endDate={license.endDate} />
                        {license.autoRenew && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <RefreshCw className="h-3 w-3" />
                            Auto-renovación
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-navy-700 dark:text-white/70">
                      {license.costUSD != null ? (
                        <div>
                          <p className="font-medium">{formatCurrency(totalCost)}</p>
                          {license.discountPercent && Number(license.discountPercent) > 0 && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              -{license.discountPercent}% dto.
                            </p>
                          )}
                        </div>
                      ) : <span className="text-navy-300 dark:text-white/30">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={license.assignments.length > 0 ? "success" : "default"}>
                        {license.assignments.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={license.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <ActionsDropdown
                          license={license}
                          onEdit={(l) => router.push(`/licenses/${l.id}`)}
                          onDelete={setDeleteTarget}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Licencia"
        message={deleteTarget ? `¿Estás seguro de eliminar la licencia "${deleteTarget.licenseKey}"? Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        loading={deleting}
      />

      <ConfirmDialog
        isOpen={!!statusChangeTarget}
        onClose={() => setStatusChangeTarget(null)}
        onConfirm={handleStatusChange}
        title={statusChangeTarget?.newStatus === "ACTIVE" ? "Activar Licencia" : "Inactivar Licencia"}
        message={statusChangeTarget
          ? statusChangeTarget.newStatus === "ACTIVE"
            ? `¿Deseas activar la licencia para "${statusChangeTarget.entityName}"? La licencia volverá a estar disponible para uso.`
            : `¿Estás seguro de inactivar la licencia para "${statusChangeTarget.entityName}"? La licencia quedará en estado CANCELADA y no podrá ser utilizada.`
          : ""}
        confirmLabel={statusChangeTarget?.newStatus === "ACTIVE" ? "Activar" : "Inactivar"}
        loading={changingStatus}
      />

      <ConfirmDialog
        isOpen={!!unassignConfirmTarget}
        onClose={() => setUnassignConfirmTarget(null)}
        onConfirm={handleUnassign}
        title="Desasignar Licencia"
        message={unassignConfirmTarget
          ? `¿Estás seguro de desasignar la licencia de "${unassignConfirmTarget.entityName}"? Esta acción no se puede deshacer.`
          : ""}
        confirmLabel="Desasignar"
        loading={unassigning}
      />

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <div className="relative z-10 w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl dark:border-white/[0.06] dark:bg-navy-800">
            <div className="border-b border-navy-100 px-6 py-4 dark:border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10">
                    <Link2 className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-navy-900 dark:text-white">
                      {assignStep === 1 && "Seleccionar Licencia"}
                      {assignStep === 2 && "Asignar a Empresas"}
                    </h2>
                    <p className="text-sm text-navy-400 dark:text-white/40">
                      {assignStep === 1 && "Elige la licencia que quieres asignar"}
                      {assignStep === 2 && "Administra asignaciones y períodos de renovación"}
                    </p>
                  </div>
                </div>
                {assignStep === 2 && (
                  <Button variant="ghost" size="sm" onClick={() => setAssignStep(1)}>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Volver
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: "calc(85vh - 140px)" }}>
              {assignStep === 1 && (
                <div className="space-y-3">
                  {licenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-navy-300 dark:text-white/30">
                      <KeyRound className="h-8 w-8 mb-2" />
                      <p className="text-sm">No hay licencias creadas</p>
                      <p className="text-xs mt-1">Crea una licencia primero para poder asignarla</p>
                    </div>
                  ) : (
                    licenses.map((license) => {
                      const isSelected = templateLicense?.id === license.id;
                      return (
                        <div
                          key={license.id}
                          onClick={() => selectLicense(license)}
                          className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                            isSelected
                              ? "border-cyan-300 bg-cyan-50 dark:border-cyan-500/30 dark:bg-cyan-500/10"
                              : "border-navy-100 hover:border-navy-200 hover:bg-navy-50 dark:border-white/[0.06] dark:hover:border-white/[0.1] dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                            <KeyRound className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-navy-900 dark:text-white truncate">
                                {license.name || license.licenseId || "Sin nombre"}
                              </p>
                              <Badge variant="info" className="text-xs">
                                {licenseTypeLabel[license.licenseType || "SUBSCRIPTION"] || license.licenseType}
                              </Badge>
                              <StatusBadge status={license.status} />
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-navy-400 dark:text-white/40">
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {license.product.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatDate(license.startDate)} — {formatDate(license.endDate)}
                              </span>
                              {license.costUSD != null && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(Number(license.costUSD))}
                                </span>
                              )}
                              <Badge variant={license.assignments.length > 0 ? "success" : "default"} className="text-xs">
                                {license.assignments.length} asignación(es)
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-navy-300 dark:text-white/30" />
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {assignStep === 2 && (
                <div className="space-y-4">
                  {companies.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-navy-300 dark:text-white/30">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <Building2 className="h-4 w-4 text-navy-400 dark:text-white/40" />
                          <span className="text-sm font-semibold text-navy-700 dark:text-white/70">Empresas y Sucursales</span>
                          <span className="text-xs text-navy-400 dark:text-white/40">({companies.length} empresa(s) · {companies.reduce((acc, c) => acc + (c.branches?.length || 0), 0)} sucursal(es))</span>
                        </div>

                        {newCount === 0 && unassignTargets.length === 0 && (
                          <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                            <label className="text-sm font-medium text-navy-700 dark:text-white/70">Período de Renovación (Nuevas)</label>
                            <p className="text-xs text-navy-400 dark:text-white/40 mb-2">Se aplicará a las nuevas asignaciones</p>
                            <Select value={renewalPeriod} onChange={(e) => setRenewalPeriod(e.target.value)} className="w-full max-w-xs">
                              <option value="">Predeterminado (de la licencia)</option>
                              <option value="MONTHLY">Mensual</option>
                              <option value="BIMONTHLY">Bimestral</option>
                              <option value="QUARTERLY">Trimestral</option>
                              <option value="SEMI_ANNUAL">Semestral</option>
                              <option value="ANNUAL">Anual</option>
                            </Select>
                          </div>
                        )}

                        {companies.map((company) => {
                          const assigned = existingAssignments[company.id];
                          const isSelected = !assigned && selectedCompanies.includes(company.id);
                          const isExpanded = expandedCompany === company.id;
                          const hasBranches = company.branches && company.branches.length > 0;
                          const isMarkedForUnassign = unassignTargets.includes(company.id);

                          return (
                            <div key={company.id} className="rounded-xl border border-navy-100 dark:border-white/[0.06] overflow-hidden">
                              <div className={`flex items-center gap-3 px-4 py-3 ${
                                isMarkedForUnassign
                                  ? "bg-red-50/50 dark:bg-red-500/5"
                                  : assigned
                                    ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                                    : isSelected
                                      ? "bg-cyan-50 dark:bg-cyan-500/10"
                                      : "hover:bg-navy-50 dark:hover:bg-white/[0.02]"
                              } transition-colors`}>
                                {!assigned ? (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleCompany(company.id)}
                                    className="h-4 w-4 rounded border-navy-300 text-cyan-600 focus:ring-cyan-500"
                                  />
                                ) : isMarkedForUnassign ? (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                                    <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                  </div>
                                ) : (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                    <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                )}
                                <Building2 className={`h-4 w-4 ${assigned && !isMarkedForUnassign ? "text-emerald-600/60 dark:text-emerald-400/60" : "text-navy-400 dark:text-white/40"}`} />
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-navy-900 dark:text-white">{company.name}</span>
                                  {assigned && !isMarkedForUnassign && (
                                    <span className="ml-2 text-sm text-emerald-600 dark:text-emerald-400">(ya asignada)</span>
                                  )}
                                  {isMarkedForUnassign && (
                                    <span className="ml-2 text-sm text-red-600 dark:text-red-400">(marcada para desasignar)</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {assigned && !isMarkedForUnassign && (
                                    <>
                                      <Select
                                        value={assigned.status}
                                        onChange={(e) => {
                                          const newStatus = e.target.value;
                                          if (newStatus !== assigned.status) {
                                            setStatusChangeTarget({
                                              assignmentId: assigned.assignmentId,
                                              licenseId: templateLicense!.id,
                                              entityName: company.name,
                                              currentStatus: assigned.status,
                                              newStatus,
                                            });
                                          }
                                        }}
                                        className="h-7 w-28 text-xs"
                                      >
                                        <option value="ACTIVE">Activa</option>
                                        <option value="CANCELLED">Inactiva</option>
                                      </Select>
                                    </>
                                  )}
                                  {assigned && (
                                    <Button
                                      variant={isMarkedForUnassign ? "default" : "outline"}
                                      size="sm"
                                      className={`h-7 gap-1 text-xs ${isMarkedForUnassign ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                                      onClick={() => toggleUnassign(company.id)}
                                    >
                                      {isMarkedForUnassign ? "Cancelar" : "Desasignar"}
                                    </Button>
                                  )}
                                  {isSelected && !assigned && (
                                    <Badge variant="info" className="text-xs">Seleccionada</Badge>
                                  )}
                                  {hasBranches && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
                                      className="text-xs text-navy-400 hover:text-navy-600 dark:text-white/40 dark:hover:text-white/60"
                                    >
                                      {isExpanded ? "Ocultar" : `${company.branches!.length} sucursal(es)`}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {isExpanded && hasBranches && (
                                <div className="border-t border-navy-100 bg-navy-50/50 px-4 py-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
                                  {company.branches!.map((branch) => {
                                    const branchKey = `${company.id}:${branch.id}`;
                                    const branchAssigned = existingAssignments[branchKey];
                                    const branchSelected = !branchAssigned && (selectedBranches[company.id] || []).includes(branch.id);
                                    const branchMarkedForUnassign = branchAssigned ? unassignTargets.includes(branchAssigned.assignmentId) : false;

                                    if (branchAssigned) {
                                      return (
                                        <div
                                          key={branch.id}
                                          className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                                            branchMarkedForUnassign
                                              ? "bg-red-50/30 dark:bg-red-500/5"
                                              : "bg-emerald-50/30 dark:bg-emerald-500/5"
                                          }`}
                                        >
                                          {branchMarkedForUnassign ? (
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                                              <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                            </div>
                                          ) : (
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                              <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                          )}
                                          <Store className={`h-3.5 w-3.5 ${branchMarkedForUnassign ? "text-red-600/60 dark:text-red-400/60" : "text-emerald-600/60 dark:text-emerald-400/60"}`} />
                                          <span className="text-sm font-medium text-navy-700 dark:text-white/70">{branch.name}</span>
                                          {branchMarkedForUnassign ? (
                                            <span className="text-xs text-red-600 dark:text-red-400">(marcada para desasignar)</span>
                                          ) : (
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400">(ya asignada)</span>
                                          )}
                                          <div className="ml-auto flex items-center gap-2">
                                            {!branchMarkedForUnassign && (
                                              <Select
                                                value={branchAssigned.status}
                                                onChange={(e) => {
                                                  const newStatus = e.target.value;
                                                  if (newStatus !== branchAssigned.status) {
                                                    setStatusChangeTarget({
                                                      assignmentId: branchAssigned.assignmentId,
                                                      licenseId: templateLicense!.id,
                                                      entityName: `${company.name} → ${branch.name}`,
                                                      currentStatus: branchAssigned.status,
                                                      newStatus,
                                                    });
                                                  }
                                                }}
                                                className="h-6 w-28 text-xs"
                                              >
                                                <option value="ACTIVE">Activa</option>
                                                <option value="CANCELLED">Inactiva</option>
                                              </Select>
                                            )}
                                            <Button
                                              variant={branchMarkedForUnassign ? "default" : "outline"}
                                              size="sm"
                                              className={`h-6 gap-1 text-xs ${branchMarkedForUnassign ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                                              onClick={() => toggleUnassign(branchKey)}
                                            >
                                              {branchMarkedForUnassign ? "Cancelar" : "Desasignar"}
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    }

                                    return (
                                      <label
                                        key={branch.id}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${branchSelected ? "bg-cyan-50 dark:bg-cyan-500/10" : "hover:bg-navy-100/50 dark:hover:bg-white/[0.03]"}`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={branchSelected}
                                          onChange={() => toggleBranch(company.id, branch.id)}
                                          className="h-4 w-4 rounded border-navy-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <Store className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                                        <span className="text-sm text-navy-700 dark:text-white/70">{branch.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(() => {
                    if (newCount === 0 && unassignTargets.length === 0) return null;
                    return (
                      <div className="rounded-xl bg-cyan-50 px-4 py-3 dark:bg-cyan-500/10">
                        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
                          {newCount > 0 && `${newCount} empresa(s)/sucursal(es) nueva(s) seleccionada(s)`}
                          {newCount > 0 && unassignTargets.length > 0 && " · "}
                          {unassignTargets.length > 0 && `${unassignTargets.length} asignación(es) para desasignar`}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-navy-100 px-6 py-4 dark:border-white/[0.06]">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                Cancelar
              </Button>
              {assignStep === 2 && (
                <Button
                  onClick={handleAssign}
                  disabled={(newCount === 0 && unassignTargets.length === 0) || assigning}
                >
                  {assigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                  {newCount > 0 && unassignTargets.length > 0
                    ? `Asignar (${newCount}) y Desasignar (${unassignTargets.length})`
                    : newCount > 0
                      ? `Asignar a ${newCount} empresa(s)/sucursal(es)`
                      : `Desasignar ${unassignTargets.length} asignación(es)`
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
