"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { DateInput } from "@/components/ui/date-input";
import {
  ArrowLeft, Save, Trash2, Loader2, KeyRound, Building2, Package,
  CalendarDays, Users, FileText, Info, Copy, Check, Shield,
  DollarSign, Clock, Gift, Percent, Wrench, GraduationCap, Hash, Tag, Store,
  Zap, Code, Layers, RefreshCw, ShoppingCart, Truck
} from "lucide-react";
import { toast } from "sonner";

type Product = { id: number; name: string };

type LicenseData = {
  id: number;
  productId: number;
  licenseKey: string;
  startDate: string;
  endDate: string;
  maxUsers: number;
  status: string;
  notes: string | null;
  licenseId: string | null;
  name: string | null;
  costUSD: number | null;
  supportHours: number;
  freeDays: number;
  discountPercent: number | null;
  allowedTechnicalVisits: number;
  additionalTechHourValue: number | null;
  additionalTrainingPerPerson: number | null;
  licenseType: string | null;
  version: string | null;
  edition: string | null;
  maxActivations: number | null;
  usedActivations: number | null;
  autoRenew: boolean;
  renewalDate: string | null;
  renewalPeriod: string | null;
  lastActivatedAt: string | null;
  lastUsedAt: string | null;
  purchaseDate: string | null;
  vendor: string | null;
  purchaseOrderNumber: string | null;
  assignments: {
    id: number;
    companyId: number;
    branchId: number | null;
    status: string;
    renewalPeriod: string | null;
    company: { id: number; name: string };
    branch: { id: number; name: string } | null;
    assignedAt: string;
  }[];
  product: { id: number; name: string };
};

const statusOptions = [
  { value: "ACTIVE", label: "Activa", badge: "success" as const },
  { value: "SUSPENDED", label: "Suspendida", badge: "warning" as const },
  { value: "EXPIRED", label: "Expirada", badge: "danger" as const },
  { value: "CANCELLED", label: "Cancelada", badge: "danger" as const },
  { value: "PENDING", label: "Pendiente", badge: "info" as const },
];

export default function EditLicensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxUsers, setMaxUsers] = useState("1");
  const [status, setStatus] = useState("ACTIVE");
  const [licenseKey, setLicenseKey] = useState("");
  const [notes, setNotes] = useState("");

  const [licenseId, setLicenseId] = useState("");
  const [name, setName] = useState("");
  const [costUSD, setCostUSD] = useState("");
  const [supportHours, setSupportHours] = useState("0");
  const [freeDays, setFreeDays] = useState("0");
  const [discountPercent, setDiscountPercent] = useState("");
  const [allowedTechnicalVisits, setAllowedTechnicalVisits] = useState("0");
  const [additionalTechHourValue, setAdditionalTechHourValue] = useState("");
  const [additionalTrainingPerPerson, setAdditionalTrainingPerPerson] = useState("");

  // New fields
  const [licenseType, setLicenseType] = useState("SUBSCRIPTION");
  const [version, setVersion] = useState("");
  const [edition, setEdition] = useState("");
  const [maxActivations, setMaxActivations] = useState("1");
  const [usedActivations, setUsedActivations] = useState("0");
  const [autoRenew, setAutoRenew] = useState(false);
  const [renewalDate, setRenewalDate] = useState("");
  const [renewalPeriod, setRenewalPeriod] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const [licenseRes, prodRes] = await Promise.all([
        fetch(`/api/licenses/${id}`),
        fetch("/api/products"),
      ]);

      if (licenseRes.ok) {
        const lic: LicenseData = await licenseRes.json();
        setProductId(lic.productId);
        setStartDate(lic.startDate.slice(0, 10));
        setEndDate(lic.endDate.slice(0, 10));
        setMaxUsers(String(lic.maxUsers));
        setStatus(lic.status);
        setLicenseKey(lic.licenseKey);
        setNotes(lic.notes || "");
        setLicenseId(lic.licenseId || "");
        setName(lic.name || "");
        setCostUSD(lic.costUSD != null ? String(lic.costUSD) : "");
        setSupportHours(String(lic.supportHours));
        setFreeDays(String(lic.freeDays));
        setDiscountPercent(lic.discountPercent != null ? String(lic.discountPercent) : "");
        setAllowedTechnicalVisits(String(lic.allowedTechnicalVisits));
        setAdditionalTechHourValue(lic.additionalTechHourValue != null ? String(lic.additionalTechHourValue) : "");
        setAdditionalTrainingPerPerson(lic.additionalTrainingPerPerson != null ? String(lic.additionalTrainingPerPerson) : "");
        // New fields
        setLicenseType(lic.licenseType || "SUBSCRIPTION");
        setVersion(lic.version || "");
        setEdition(lic.edition || "");
        setMaxActivations(String(lic.maxActivations || 1));
        setUsedActivations(String(lic.usedActivations || 0));
        setAutoRenew(lic.autoRenew || false);
        setRenewalDate(lic.renewalDate ? lic.renewalDate.slice(0, 10) : "");
        setRenewalPeriod(lic.renewalPeriod || "");
        setPurchaseDate(lic.purchaseDate ? lic.purchaseDate.slice(0, 10) : "");
        setVendor(lic.vendor || "");
        setPurchaseOrderNumber(lic.purchaseOrderNumber || "");
      } else {
        router.push("/licenses");
      }

      if (prodRes.ok) setProducts(await prodRes.json());

      setFetching(false);
    }
    load();
  }, [id, router]);

  const selectedProduct = products.find((p) => p.id === productId);
  const statusMeta = statusOptions.find((s) => s.value === status);
  const total = costUSD && discountPercent
    ? (parseFloat(costUSD) * (1 - parseFloat(discountPercent) / 100)).toFixed(2)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/licenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId, startDate, endDate, maxUsers, status, notes,
          licenseId: licenseId || null,
          name: name || null,
          costUSD: costUSD || null,
          supportHours,
          freeDays,
          discountPercent: discountPercent || null,
          allowedTechnicalVisits,
          additionalTechHourValue: additionalTechHourValue || null,
          additionalTrainingPerPerson: additionalTrainingPerPerson || null,
          licenseType, version: version || null, edition: edition || null,
          maxActivations, usedActivations, autoRenew,
          renewalDate: renewalDate || null,
          renewalPeriod: renewalPeriod || null,
          purchaseDate: purchaseDate || null,
          vendor: vendor || null,
          purchaseOrderNumber: purchaseOrderNumber || null,
        }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Licencia actualizada correctamente");
      router.push(`/licenses/${id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al actualizar");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/licenses/${id}`, { method: "DELETE" });
    setDeleting(false);
    setShowDelete(false);
    if (res.ok) {
      toast.success("Licencia eliminada correctamente");
      router.push("/licenses");
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al eliminar");
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy-300 dark:text-white/30" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
            Editar Licencia
          </h1>
          <p className="text-sm text-navy-400 dark:text-white/40">
            Modifica los datos de la licencia
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="animate-scale-in flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <Info className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* License Key Banner */}
        <div className="animate-fade-in-up animate-delay-1 flex items-center gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50 px-5 py-3 shadow-sm dark:border-blue-500/20 dark:from-blue-500/10 dark:to-blue-500/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
            <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-500">Clave de Licencia</p>
            <code className="block truncate font-mono text-sm font-semibold text-navy-900 dark:text-white">{licenseKey}</code>
          </div>
          <button
            type="button"
            onClick={copyKey}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-navy-500 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-white/10 dark:hover:bg-white/20"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            {/* Identificación */}
            <Card className="animate-fade-in-up animate-delay-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                    <KeyRound className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Identificación</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">Identificador único y asignación</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-navy-400" />ID de Licencia</span>
                    </label>
                    <Input value={licenseId} onChange={(e) => setLicenseId(e.target.value)} placeholder="Ej: LIC-001" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-navy-400" />Nombre</span>
                    </label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Licencia Premium Anual" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                    <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 text-navy-400" />Producto <span className="text-red-500">*</span></span>
                  </label>
                  <Select value={productId ?? ""} onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : null)} required>
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tipo y Versión */}
            <Card className="animate-fade-in-up animate-delay-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10">
                    <Layers className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>Tipo y Versión</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">Tipo de licencia, edición y versión</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-navy-400" />Tipo de Licencia</span>
                    </label>
                    <Select value={licenseType} onChange={(e) => setLicenseType(e.target.value)}>
                      <option value="SUBSCRIPTION">Suscripción</option>
                      <option value="PERPETUAL">Perpetua</option>
                      <option value="TRIAL">Prueba</option>
                      <option value="OEM">OEM</option>
                      <option value="VOLUME">Volumen</option>
                      <option value="NAMED_USER">Usuario Nombrado</option>
                      <option value="CONCURRENT">Concurrente</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Code className="h-3.5 w-3.5 text-navy-400" />Edición</span>
                    </label>
                    <Select value={edition} onChange={(e) => setEdition(e.target.value)}>
                      <option value="">No especificada</option>
                      <option value="STANDARD">Estándar</option>
                      <option value="PROFESSIONAL">Profesional</option>
                      <option value="ENTERPRISE">Empresarial</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-navy-400" />Versión</span>
                    </label>
                    <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Ej: 3.2.1" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-navy-400" />Máx. Activaciones</span>
                    </label>
                    <Input type="number" min="1" value={maxActivations} onChange={(e) => setMaxActivations(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-navy-400" />Usadas</span>
                    </label>
                    <Input type="number" min="0" value={usedActivations} onChange={(e) => setUsedActivations(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-navy-400" />Máx. Usuarios</span>
                    </label>
                    <Input type="number" min="1" value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vigencia y Renovación */}
            <Card className="animate-fade-in-up animate-delay-3 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Vigencia y Renovación</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">Período de validez, estado y auto-renovación</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4 rounded-xl bg-navy-50 px-4 py-3 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-navy-400 dark:text-white/40" />
                    <span className="text-sm font-medium text-navy-700 dark:text-white/70">Estado:</span>
                  </div>
                  <Badge variant={statusMeta?.badge ?? "default"}>
                    {statusMeta?.label ?? status}
                  </Badge>
                  <Select value={status} onChange={(e) => setStatus(e.target.value)} className="ml-auto w-36">
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-navy-400" />Fecha de Inicio <span className="text-red-500">*</span></span>
                    </label>
                    <DateInput value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-navy-400" />Fecha de Vencimiento <span className="text-red-500">*</span></span>
                    </label>
                    <DateInput value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                </div>
                {startDate && endDate && new Date(endDate) < new Date(startDate) && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    La fecha de vencimiento es anterior a la fecha de inicio
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-navy-100 bg-navy-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <RefreshCw className="h-4 w-4 text-navy-400 dark:text-white/40" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-navy-700 dark:text-white/70">Auto-renovación</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoRenew(!autoRenew)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRenew ? "bg-blue-500" : "bg-navy-200 dark:bg-white/10"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRenew ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  {autoRenew && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                        <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-navy-400" />Fecha de Renovación</span>
                      </label>
                      <DateInput value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                    <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5 text-navy-400" />Período de Renovación</span>
                  </label>
                  <Select value={renewalPeriod} onChange={(e) => setRenewalPeriod(e.target.value)} className="max-w-xs">
                    <option value="">Seleccionar período</option>
                    <option value="MONTHLY">Mensual</option>
                    <option value="BIMONTHLY">Bimestral</option>
                    <option value="QUARTERLY">Trimestral</option>
                    <option value="SEMI_ANNUAL">Semestral</option>
                    <option value="ANUAL">Anual</option>
                  </Select>
                  <p className="text-xs text-navy-400 dark:text-white/30">Cada empresa puede definir su período de renovación</p>
                </div>
              </CardContent>
            </Card>

            {/* Costos y Compra */}
            <Card className="animate-fade-in-up animate-delay-4 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Costos y Compra</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">Valor, descuentos y datos de compra</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-navy-400" />Costo en USD</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400">$</span>
                      <Input type="number" step="0.01" min="0" value={costUSD} onChange={(e) => setCostUSD(e.target.value)} className="pl-7" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Percent className="h-3.5 w-3.5 text-navy-400" />Descuento (%)</span>
                    </label>
                    <div className="relative">
                      <Input type="number" step="0.01" min="0" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="0" />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-navy-400">%</span>
                    </div>
                    {total && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Total: ${total} USD
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><ShoppingCart className="h-3.5 w-3.5 text-navy-400" />Fecha de Compra</span>
                    </label>
                    <DateInput value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-navy-400" />Proveedor</span>
                    </label>
                    <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Ej: Microsoft, Adobe..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-navy-400" />N° Orden de Compra</span>
                    </label>
                    <Input value={purchaseOrderNumber} onChange={(e) => setPurchaseOrderNumber(e.target.value)} placeholder="OC-001" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Servicios Técnicos */}
            <Card className="animate-fade-in-up animate-delay-5 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-rose-400 to-rose-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10">
                    <Wrench className="h-4 w-4 text-rose-600" />
                  </div>
                  <div>
                    <CardTitle>Servicios Técnicos y Capacitación</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">Horas de soporte, visitas y capacitación</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-navy-400" />Horas de Soporte</span>
                    </label>
                    <Input type="number" min="0" value={supportHours} onChange={(e) => setSupportHours(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5 text-navy-400" />Visitas Técnicas</span>
                    </label>
                    <Input type="number" min="0" value={allowedTechnicalVisits} onChange={(e) => setAllowedTechnicalVisits(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-navy-400" />Hora Técnica Adicional</span>
                    </label>
                    <div className="relative max-w-xs">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400">$</span>
                      <Input type="number" step="0.01" min="0" value={additionalTechHourValue} onChange={(e) => setAdditionalTechHourValue(e.target.value)} className="pl-7" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                      <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-navy-400" />Capacitación / Persona</span>
                    </label>
                    <div className="relative max-w-xs">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400">$</span>
                      <Input type="number" step="0.01" min="0" value={additionalTrainingPerPerson} onChange={(e) => setAdditionalTrainingPerPerson(e.target.value)} className="pl-7" placeholder="0.00" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                    <span className="flex items-center gap-1.5"><Gift className="h-3.5 w-3.5 text-navy-400" />Días Gratis</span>
                  </label>
                  <Input type="number" min="0" value={freeDays} onChange={(e) => setFreeDays(e.target.value)} className="max-w-xs" />
                  <p className="text-xs text-navy-400 dark:text-white/30">Período de prueba o cortesía en días</p>
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
            <Card className="animate-fade-in-up animate-delay-6 overflow-hidden">
              <CardContent className="pt-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                    <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-navy-400" />Notas</span>
                  </label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Resumen */}
          <div className="space-y-6">
            <div className="animate-fade-in-up animate-delay-3">
              <Card className="sticky top-24 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
                <CardHeader>
                  <CardTitle className="text-sm">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5 dark:bg-white/[0.03]">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-white/40">Identificación</span>
                    <p className="font-medium text-navy-900 dark:text-white">{name || <span className="text-navy-300 font-normal">Sin nombre</span>}</p>
                    <p className="text-xs text-navy-400 dark:text-white/40">{licenseId || "ID no asignado"}</p>
                    <p className="text-xs text-navy-500 dark:text-white/50">
                      Tipo: {licenseType === "SUBSCRIPTION" ? "Suscripción" : licenseType === "PERPETUAL" ? "Perpetua" : licenseType}
                      {edition ? ` · ${edition === "STANDARD" ? "Estándar" : edition === "PROFESSIONAL" ? "Profesional" : "Empresarial"}` : ""}
                      {version ? ` v${version}` : ""}
                    </p>
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5 dark:bg-white/[0.03]">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-white/40">Producto</span>
                    <p className="text-xs text-navy-700 dark:text-white/70">{selectedProduct?.name || "Producto: —"}</p>
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5 dark:bg-white/[0.03]">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-white/40">Estado</span>
                    <Badge variant={statusMeta?.badge ?? "default"}>{statusMeta?.label ?? status}</Badge>
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5 dark:bg-white/[0.03]">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-white/40">Vigencia</span>
                    <p className="font-medium text-navy-900 text-xs dark:text-white">{startDate || "—"} → {endDate || "—"}</p>
                    <p className="text-xs text-navy-700 dark:text-white/70">Usuarios: {maxUsers} · Activaciones: {usedActivations}/{maxActivations}</p>
                    {autoRenew && <p className="text-xs text-emerald-600 dark:text-emerald-400">Auto-renovación activada</p>}
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5 dark:bg-white/[0.03]">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-white/40">Económico</span>
                    <p className="text-xs text-navy-700 dark:text-white/70">Costo: {costUSD ? `$${costUSD} USD` : "—"}</p>
                    {discountPercent && <p className="text-xs text-emerald-600 dark:text-emerald-400">Dto: {discountPercent}%</p>}
                    {total && <p className="text-xs font-semibold text-navy-900 dark:text-white">Total: ${total} USD</p>}
                    {vendor && <p className="text-xs text-navy-500 dark:text-white/50">Proveedor: {vendor}</p>}
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5 dark:bg-white/[0.03]">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-white/40">Técnico</span>
                    <p className="text-xs text-navy-700 dark:text-white/70">Soporte: {supportHours}h · Visitas: {allowedTechnicalVisits}</p>
                    <p className="text-xs text-navy-700 dark:text-white/70">
                      Hora adicional: {additionalTechHourValue ? `$${additionalTechHourValue}/h` : "—"}
                    </p>
                    <p className="text-xs text-navy-700 dark:text-white/70">
                      Capacitación: {additionalTrainingPerPerson ? `$${additionalTrainingPerPerson}/pers` : "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-fade-in-up animate-delay-5 flex flex-col gap-2">
              <Button type="submit" size="lg" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => router.push(`/licenses/${id}`)} className="w-full text-navy-400">
                Cancelar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDelete(true)}
                className="w-full text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Licencia
              </Button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar Licencia"
        message={`¿Estás seguro de eliminar la licencia "${licenseKey}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
