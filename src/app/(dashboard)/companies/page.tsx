"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/modal";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Building2, Plus, MoreHorizontal, Pencil, Trash2,
  ToggleLeft, ToggleRight, Loader2, Eye,
  ChevronDown, ChevronRight, Store, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { ECONOMIC_ACTIVITIES } from "@/data/economic-activities";

type Company = {
  id: string;
  name: string;
  taxIdType: string | null;
  taxId: string | null;
  type: "MAIN" | "BRANCH";
  isActive: boolean;
  createdAt: string;
  parentId: string | null;
  parent?: { name: string } | null;
  salesRep?: { name: string | null; email: string } | null;
  branches?: Company[];
  _count: { contacts: number; licenseCompanies: number; clientProducts: number };
};

const typeBadge = {
  MAIN: { label: "Principal", variant: "primary" as const },
  BRANCH: { label: "Sucursal", variant: "info" as const },
};

function ActionsDropdown({ company, toggling, onToggle, onDelete }: {
  company: Company;
  toggling: string | null;
  onToggle: (c: Company) => void;
  onDelete: (c: Company) => void;
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
          onClick: () => router.push(`/companies/${company.id}`),
        },
        {
          label: "Editar",
          icon: <Pencil className="h-4 w-4" />,
          onClick: () => router.push(`/companies/${company.id}/edit`),
        },
        {
          label: toggling === company.id ? "Procesando..." : (company.isActive ? "Desactivar" : "Activar"),
          icon: toggling === company.id
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : company.isActive
              ? <ToggleRight className="h-4 w-4" />
              : <ToggleLeft className="h-4 w-4" />,
          onClick: () => onToggle(company),
          disabled: toggling === company.id,
        },
        { label: "", icon: null, onClick: () => {} },
        {
          label: "Eliminar",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => onDelete(company),
          variant: "danger" as const,
        },
      ]}
    />
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [salesRepFilter, setSalesRepFilter] = useState("");
  const [economicActivityFilter, setEconomicActivityFilter] = useState("");
  const [salesReps, setSalesReps] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [availableActivities, setAvailableActivities] = useState<string[]>([]);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCompanies();
    fetch("/api/users").then((r) => r.json()).then((data) => {
      const list = Array.isArray(data) ? data : data.data || [];
      setSalesReps(list.filter((u: { hasCommissions?: boolean }) => u.hasCommissions));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadCompanies(), 300);
    return () => clearTimeout(timeout);
  }, [search, typeFilter, dateFrom, dateTo, salesRepFilter, economicActivityFilter]);

  async function loadCompanies() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (salesRepFilter) params.set("salesRepId", salesRepFilter);
      if (economicActivityFilter) params.set("economicActivity", economicActivityFilter);
      const res = await fetch(`/api/companies?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data ?? json;
        setCompanies(list);
        if (json.availableActivities) setAvailableActivities(json.availableActivities);
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(company: Company) {
    setToggling(company.id);
    const res = await fetch(`/api/companies/${company.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !company.isActive }),
    });
    setToggling(null);
    if (res.ok) {
      toast.success(`Empresa ${company.isActive ? "desactivada" : "activada"} correctamente`);
      loadCompanies();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/companies/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      toast.success("Empresa eliminada correctamente");
      loadCompanies();
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al eliminar");
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderBranchRow(branch: Company) {
    return (
      <TableRow key={branch.id} className="bg-navy-50/50 dark:bg-white/[0.02]">
        <TableCell>
          <div className="ml-10 flex items-center gap-2.5 border-l-2 border-sky-300 pl-4 dark:border-sky-500/40">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 ring-1 ring-sky-100 dark:bg-sky-500/10 dark:ring-sky-500/20">
              <MapPin className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <div className="min-w-0">
              <Link href={`/companies/${branch.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                {branch.name}
              </Link>
            </div>
          </div>
        </TableCell>
        <TableCell className="font-mono text-sm text-navy-500 dark:text-white/50">{branch.taxId ? `${branch.taxIdType || "V"}-${branch.taxId}` : "-"}</TableCell>
        <TableCell>
          <Badge variant="info">Sucursal</Badge>
        </TableCell>
        <TableCell className="text-sm text-navy-500 dark:text-white/50">{branch.salesRep?.name || branch.salesRep?.email || "-"}</TableCell>
        <TableCell className="text-sm text-navy-400 dark:text-white/40">{formatDate(branch.createdAt)}</TableCell>
        <TableCell>
          <Badge variant={branch.isActive ? "success" : "danger"}>
            {branch.isActive ? "Activa" : "Inactiva"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex justify-end">
            <ActionsDropdown company={branch} toggling={toggling} onToggle={toggleActive} onDelete={setDeleteTarget} />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  function renderMainCompany(main: Company) {
    const branches = main.branches || [];
    const isExpanded = expanded.has(main.id);
    const hasBranches = branches.length > 0;

    return [
      <TableRow key={main.id} className="group">
        <TableCell>
          <div className="flex items-center gap-2.5">
            {hasBranches ? (
              <button
                onClick={() => toggleExpand(main.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-100/80 transition-all duration-200 hover:bg-navy-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
              >
                {isExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 text-navy-500 dark:text-white/60" />
                  : <ChevronRight className="h-3.5 w-3.5 text-navy-500 dark:text-white/60" />
                }
              </button>
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-100/80 dark:bg-white/[0.06]">
                <Building2 className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <Link href={`/companies/${main.id}`} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                  {main.name}
                </Link>
                {hasBranches && (
                  <p className="mt-0.5 text-xs text-navy-400 dark:text-white/40">
                    {branches.length} sucursal{branches.length !== 1 ? "es" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="font-mono text-sm text-navy-500 dark:text-white/50">{main.taxId ? `${main.taxIdType || "V"}-${main.taxId}` : "-"}</TableCell>
        <TableCell>
          <Badge variant="primary">Principal</Badge>
        </TableCell>
        <TableCell className="text-sm text-navy-500 dark:text-white/50">{main.salesRep?.name || main.salesRep?.email || "-"}</TableCell>
        <TableCell className="text-sm text-navy-400 dark:text-white/40">{formatDate(main.createdAt)}</TableCell>
        <TableCell>
          <Badge variant={main.isActive ? "success" : "danger"}>
            {main.isActive ? "Activa" : "Inactiva"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex justify-end">
            <ActionsDropdown company={main} toggling={toggling} onToggle={toggleActive} onDelete={setDeleteTarget} />
          </div>
        </TableCell>
      </TableRow>,
      ...(isExpanded ? branches.map(renderBranchRow) : []),
    ];
  }

  const allCompanies = companies;
  const total = allCompanies.reduce((sum, c) => sum + 1 + (c.branches?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">Empresas</h1>
          <p className="mt-1 text-sm text-navy-400 dark:text-white/40">Gestiona las empresas del sistema</p>
        </div>
        <Link href="/companies/new">
          <Button><Plus className="mr-2 h-4 w-4" />Nueva Empresa</Button>
        </Link>
      </div>

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Buscar por nombre, RNC, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-44">
            <option value="">Todos los tipos</option>
            <option value="MAIN">Principal</option>
            <option value="BRANCH">Sucursal</option>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-navy-400 dark:text-white/40">Desde:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-navy-400 dark:text-white/40">Hasta:</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40"
            />
          </div>
          <Select value={salesRepFilter} onChange={(e) => setSalesRepFilter(e.target.value)} className="w-52">
            <option value="">Todos los representantes</option>
            {salesReps.map((r) => (
              <option key={r.id} value={r.id}>{r.name || r.email}</option>
            ))}
          </Select>
          <Select value={economicActivityFilter} onChange={(e) => setEconomicActivityFilter(e.target.value)} className="w-64">
            <option value="">Todas las actividades</option>
            {availableActivities.map((code) => {
              const activity = ECONOMIC_ACTIVITIES.find((a) => a.code === code);
              return <option key={code} value={code}>{code} - {activity?.name || code}</option>;
            })}
          </Select>
          {(search || typeFilter || dateFrom || dateTo || salesRepFilter || economicActivityFilter) && (
            <Button variant="ghost" onClick={() => { setSearch(""); setTypeFilter(""); setDateFrom(""); setDateTo(""); setSalesRepFilter(""); setEconomicActivityFilter(""); }}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-navy-300 dark:text-white/30" />
        </div>
      ) : (
        <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-white/[0.06] dark:bg-navy-800/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RNC</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Rep. Ventas</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {total === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center gap-3 py-12 text-navy-300 dark:text-white/30">
                      <Building2 className="h-12 w-12" />
                      <p className="text-sm">No se encontraron empresas</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : typeFilter === "BRANCH" ? (
                allCompanies.flatMap((main) =>
                  (main.branches || []).map((branch) => renderBranchRow({ ...branch, parent: { name: main.name } }))
                )
              ) : (
                allCompanies.map((main) => renderMainCompany(main))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Empresa"
        message={deleteTarget ? `¿Estás seguro de eliminar la empresa "${deleteTarget.name}"? Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
