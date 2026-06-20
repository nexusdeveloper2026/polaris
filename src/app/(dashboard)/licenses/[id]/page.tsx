import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Pencil, KeyRound, Building2, Package, CalendarDays,
  Users, DollarSign, Clock, Shield, Zap, Code, Tag, RefreshCw,
  ShoppingCart, Truck, Wrench, GraduationCap, FileText, Copy
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
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

const editionLabel: Record<string, string> = {
  STANDARD: "Estándar",
  PROFESSIONAL: "Profesional",
  ENTERPRISE: "Empresarial",
};

const renewalPeriodLabel: Record<string, string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  SEMI_ANNUAL: "Semestral",
  ANNUAL: "Anual",
  BIENNIAL: "Bianual",
  TRIENNIAL: "Trienal",
  PERPETUAL: "Perpetua",
};

function daysRemaining(endDate: Date): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function LicenseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  const license = await prisma.license.findUnique({
    where: { id: numericId },
    include: {
      product: { include: { category: true } },
      assignments: { include: { company: true, branch: true } },
    },
  });

  if (!license) notFound();

  const days = daysRemaining(license.endDate);
  const totalCost = license.costUSD ? Number(license.costUSD) : 0;
  const discount = license.discountPercent ? Number(license.discountPercent) : 0;
  const finalCost = totalCost * (1 - discount / 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={license.name || license.licenseId || "Licencia"}
        subtitle={`${license.assignments.length} empresa(s) asignada(s) · ${license.product.name}`}
        actions={
          <div className="flex gap-2">
            <Link href="/licenses">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Volver
              </Button>
            </Link>
            <Link href={`/licenses/${license.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar
              </Button>
            </Link>
            <Badge variant={statusVariant[license.status] ?? "default"}>
              {statusLabel[license.status] ?? license.status}
            </Badge>
          </div>
        }
      />

      {/* License Key Banner */}
      <div className="animate-fade-in-up flex items-center gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50 px-5 py-3 shadow-sm dark:border-blue-500/20 dark:from-blue-500/10 dark:to-blue-500/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
          <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-500">Clave de Licencia</p>
          <code className="block truncate font-mono text-sm font-semibold text-navy-900 dark:text-white">{license.licenseKey}</code>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Identificación */}
          <Card className="animate-fade-in-up animate-delay-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <KeyRound className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle>Identificación</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">ID de Licencia</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.licenseId || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Nombre</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.name || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Clave</span>
                <span className="text-right font-mono text-xs text-navy-700 dark:text-white/70">{license.licenseKey}</span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Tipo</span>
                <Badge variant="info">{licenseTypeLabel[license.licenseType || "SUBSCRIPTION"] || license.licenseType}</Badge>
              </div>
              {license.edition && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Edición</span>
                  <span className="text-right font-medium text-navy-700 dark:text-white/70">{editionLabel[license.edition] || license.edition}</span>
                </div>
              )}
              {license.version && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Versión</span>
                  <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.version}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Producto */}
          <Card className="animate-fade-in-up animate-delay-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10">
                  <Package className="h-4 w-4 text-violet-600" />
                </div>
                <CardTitle>Producto</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Producto</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.product.name}</span>
              </div>
              {license.product.category && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Categoría</span>
                  <span className="text-right text-navy-700 dark:text-white/70">{license.product.category.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asignaciones */}
          <Card className="animate-fade-in-up animate-delay-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-500/10">
                  <Building2 className="h-4 w-4 text-cyan-600" />
                </div>
                <CardTitle>Asignaciones</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              {license.assignments.length === 0 ? (
                <p className="text-navy-400 dark:text-white/40">Sin asignar</p>
              ) : (
                <div className="space-y-3">
                  {license.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-lg border border-navy-100 bg-navy-50/50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-navy-700 dark:text-white/80">
                          {assignment.company.name}
                        </span>
                        <Badge variant={statusVariant[assignment.status] ?? "default"}>
                          {statusLabel[assignment.status] ?? assignment.status}
                        </Badge>
                      </div>
                      {assignment.branch && (
                        <p className="mt-1 text-xs text-navy-400 dark:text-white/40">
                          Sucursal: {assignment.branch.name}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-navy-400 dark:text-white/40">
                        <span>{assignment.renewalPeriod ? (renewalPeriodLabel[assignment.renewalPeriod] || assignment.renewalPeriod) : "Sin período"}</span>
                        <span>·</span>
                        <span>Asignado: {formatDate(assignment.assignedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Vigencia */}
          <Card className="animate-fade-in-up animate-delay-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle>Vigencia</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Fecha de Inicio</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{formatDate(license.startDate)}</span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Fecha de Vencimiento</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{formatDate(license.endDate)}</span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Días Restantes</span>
                <div className="text-right">
                  {days === 0 ? (
                    <Badge variant="danger">Vencida</Badge>
                  ) : days <= 7 ? (
                    <Badge variant="danger">{days} días</Badge>
                  ) : days <= 30 ? (
                    <Badge variant="warning">{days} días</Badge>
                  ) : (
                    <Badge variant="success">{days} días</Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Auto-renovación</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">
                  {license.autoRenew ? "Sí" : "No"}
                </span>
              </div>
              {license.renewalDate && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Fecha de Renovación</span>
                  <span className="text-right font-medium text-navy-700 dark:text-white/70">{formatDate(license.renewalDate)}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Máx. Usuarios</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.maxUsers}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-navy-400 dark:text-white/40">Activaciones</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">
                  {license.usedActivations || 0} / {license.maxActivations || 1}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Costos */}
          <Card className="animate-fade-in-up animate-delay-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle>Costos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {license.costUSD != null && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Costo Original</span>
                  <span className="text-right font-medium text-navy-700 dark:text-white/70">{formatCurrency(totalCost)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Descuento</span>
                  <span className="text-right font-medium text-emerald-600 dark:text-emerald-400">-{discount}%</span>
                </div>
              )}
              {discount > 0 && license.costUSD != null && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Costo Final</span>
                  <span className="text-right font-bold text-navy-900 dark:text-white">{formatCurrency(finalCost)}</span>
                </div>
              )}
              {license.supportHours ? (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Horas de Soporte</span>
                  <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.supportHours}h</span>
                </div>
              ) : null}
              {license.vendor && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Proveedor</span>
                  <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.vendor}</span>
                </div>
              )}
              {license.purchaseDate && (
                <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                  <span className="text-navy-400 dark:text-white/40">Fecha de Compra</span>
                  <span className="text-right font-medium text-navy-700 dark:text-white/70">{formatDate(license.purchaseDate)}</span>
                </div>
              )}
              {license.purchaseOrderNumber && (
                <div className="flex justify-between pb-2">
                  <span className="text-navy-400 dark:text-white/40">N° Orden de Compra</span>
                  <span className="text-right font-mono text-xs text-navy-700 dark:text-white/70">{license.purchaseOrderNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Servicios Técnicos */}
          <Card className="animate-fade-in-up animate-delay-5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10">
                  <Wrench className="h-4 w-4 text-rose-600" />
                </div>
                <CardTitle>Servicios Técnicos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Horas de Soporte</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.supportHours || 0}h</span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Visitas Técnicas</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.allowedTechnicalVisits || 0}</span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Hora Adicional</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">
                  {license.additionalTechHourValue ? formatCurrency(license.additionalTechHourValue) + "/h" : "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">Capacitación / Persona</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">
                  {license.additionalTrainingPerPerson ? formatCurrency(license.additionalTrainingPerPerson) : "—"}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-navy-400 dark:text-white/40">Días Gratis</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{license.freeDays || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          {license.notes && (
            <Card className="animate-fade-in-up animate-delay-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-navy-400" />
                  <CardTitle>Notas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-navy-700 dark:text-white/70">{license.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
