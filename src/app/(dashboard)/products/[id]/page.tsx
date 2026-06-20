import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDate, PERIOD_DAYS, calculateDailyPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Pencil, KeyRound, Receipt, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const typeBadge: Record<string, { label: string; variant: "primary" | "info" }> = {
  PRODUCT: { label: "Producto", variant: "primary" },
  SERVICE: { label: "Servicio", variant: "info" },
};

const licenseStatusBadge: Record<string, { label: string; variant: "success" | "danger" | "warning" }> = {
  ACTIVE: { label: "Activa", variant: "success" },
  EXPIRED: { label: "Vencida", variant: "danger" },
  SUSPENDED: { label: "Suspendida", variant: "warning" },
};

const periodLabels: Record<string, string> = {
  ONE_TIME: "Pago Único",
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  BIMONTHLY: "Bimensual",
  QUARTERLY: "Trimestral",
  SEMI_ANNUAL: "Semestral",
  ANNUAL: "Anual",
  OTHER: "Otro",
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  const product = await prisma.product.findUnique({
    where: { id: numericId },
    include: {
      category: true,
      licenses: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const tb = typeBadge[product.type] || { label: product.type, variant: "default" as const };
  const price = Number(product.price);
  const cost = Number(product.cost);
  const discountPct = product.discountPercent;
  const ivaPct = product.ivaPercent;
  const discountAmount = price * (discountPct / 100);
  const priceAfterDiscount = price - discountAmount;
  const ivaAmount = priceAfterDiscount * (ivaPct / 100);
  const finalPrice = priceAfterDiscount + ivaAmount;
  const dailyPrice = calculateDailyPrice(finalPrice, product.paymentPeriod);
  const periodDays = PERIOD_DAYS[product.paymentPeriod] || 30;
  const profit = finalPrice - cost;
  const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        subtitle={[
          product.category ? `Categoría: ${product.category.name}` : null,
          `Creado el ${formatDate(product.createdAt)}`,
        ].filter(Boolean).join(" · ")}
        actions={
          <div className="flex gap-2">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Volver
              </Button>
            </Link>
            <Link href={`/products/${product.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar
              </Button>
            </Link>
            <Badge variant={tb.variant}>{tb.label}</Badge>
            <Badge variant={product.isActive ? "success" : "danger"}>{product.isActive ? "Activo" : "Inactivo"}</Badge>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in-up animate-delay-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <CardTitle>Información del Producto</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Costo", value: formatCurrency(product.cost) },
              { label: "Precio", value: formatCurrency(product.price) },
              discountPct > 0 ? { label: "Descuento", value: `${discountPct}% (-${formatCurrency(discountAmount)})` } : null,
              ivaPct > 0 ? { label: "IVA", value: `${ivaPct}% (+${formatCurrency(ivaAmount)})` } : null,
              { label: "Precio Final", value: formatCurrency(finalPrice) },
              { label: "Período de Pago", value: periodLabels[product.paymentPeriod] || product.paymentPeriod },
              { label: "Categoría", value: product.category?.name || "-" },
              { label: "Tipo", value: product.type === "PRODUCT" ? "Producto" : "Servicio" },
              { label: "Estatus", value: product.isActive ? "Activo" : "Inactivo" },
            ].filter((item): item is { label: string; value: string } => item !== null).map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="text-navy-400 dark:text-white/40">{label}</span>
                <span className="text-right font-medium text-navy-700 dark:text-white/70">{value}</span>
              </div>
            ))}
            {product.description && (
              <div className="border-b border-navy-50 pb-2 dark:border-white/[0.06]">
                <span className="mb-1 block text-navy-400 dark:text-white/40">Descripción</span>
                <p className="whitespace-pre-wrap text-navy-700 dark:text-white/70">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="animate-fade-in-up animate-delay-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-500" />
                <CardTitle>Resumen de Costos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="text-xs font-medium text-navy-400 dark:text-white/40 uppercase tracking-wider">Costo</p>
                  <p className="mt-1 text-xl font-bold text-navy-900 dark:text-white">{formatCurrency(cost)}</p>
                </div>
                <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="text-xs font-medium text-navy-400 dark:text-white/40 uppercase tracking-wider">Precio Final</p>
                  <p className="mt-1 text-xl font-bold text-navy-900 dark:text-white">{formatCurrency(finalPrice)}</p>
                </div>
              </div>

              {discountPct > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 dark:bg-amber-500/10">
                  <span className="text-sm text-amber-700 dark:text-amber-400">Descuento ({discountPct}%)</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {ivaPct > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-purple-50 px-4 py-2 dark:bg-purple-500/10">
                  <span className="text-sm text-purple-700 dark:text-purple-400">IVA ({ivaPct}%)</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-400">+{formatCurrency(ivaAmount)}</span>
                </div>
              )}

              {product.paymentPeriod !== "ONE_TIME" && finalPrice > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-500/10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-400">Precio Diario (calculado a {periodDays} días)</span>
                  </div>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">{formatCurrency(dailyPrice)} / día</span>
                </div>
              )}

              <div className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${profit >= 0 ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" : "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"}`}>
                <div>
                  <p className={`text-sm font-medium ${profit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>Ganancia / Pérdida</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
                    {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profit >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"}`}>
                  {profitMargin.toFixed(1)}% margen
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up animate-delay-3">
            <CardHeader>
              <CardTitle>Licencias ({product.licenses.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {product.licenses.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-navy-400 dark:text-white/40">
                  No hay licencias registradas para este producto
                </p>
              ) : (
                <div className="divide-y divide-navy-50 dark:divide-white/[0.06]">
                  {product.licenses.map((license) => (
                    <div key={license.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <KeyRound className="h-4 w-4 text-navy-300 dark:text-white/30" />
                        <div>
                          <p className="font-mono text-xs text-navy-400 dark:text-white/40">{license.licenseKey}</p>
                          <p className="text-xs text-navy-400 dark:text-white/40">
                            {license.maxUsers} usuarios · {formatDate(license.startDate)} - {formatDate(license.endDate)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={licenseStatusBadge[license.status]?.variant ?? "default"}>
                        {licenseStatusBadge[license.status]?.label ?? license.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
