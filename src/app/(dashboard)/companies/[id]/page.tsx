import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate, formatCurrency, getEffectiveEndDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, Users, Package, KeyRound, CalendarCheck, Pencil, Plus, DollarSign, Clock, GraduationCap, RefreshCw, Store } from "lucide-react";
import { ECONOMIC_ACTIVITIES } from "@/data/economic-activities";
import { LicensePaymentButton } from "@/components/license-payment-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

const typeBadge = {
  MAIN: { label: "Principal", variant: "primary" as const },
  BRANCH: { label: "Sucursal", variant: "info" as const },
};

const licenseStatusBadge: Record<string, { label: string; variant: "success" | "danger" | "warning" }> = {
  ACTIVE: { label: "Activa", variant: "success" },
  EXPIRED: { label: "Vencida", variant: "danger" },
  SUSPENDED: { label: "Suspendida", variant: "warning" },
};

const productStatusBadge: Record<string, { label: string; variant: "success" | "danger" | "warning" }> = {
  ACTIVE: { label: "Activo", variant: "success" },
  EXPIRED: { label: "Vencido", variant: "danger" },
  CANCELLED: { label: "Cancelado", variant: "warning" },
};

const visitStatusBadge: Record<string, { label: string; variant: "primary" | "warning" | "success" | "danger" }> = {
  SCHEDULED: { label: "Programada", variant: "primary" },
  IN_PROGRESS: { label: "En Curso", variant: "warning" },
  COMPLETED: { label: "Completada", variant: "success" },
  CANCELLED: { label: "Cancelada", variant: "danger" },
};

const visitTypeLabels: Record<string, string> = {
  DEMO: "Demo",
  INFO_GATHERING: "Toma de Información",
  INSTALLATION: "Instalación",
  INDUCTION: "Inducción",
  REINDUCTION: "Reinducción",
  POST_SALE: "Post-Venta",
  TECHNICAL: "Técnica",
};

const renewalPeriodLabel: Record<string, string> = {
  MONTHLY: "Mensual",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  SEMI_ANNUAL: "Semestral",
  ANNUAL: "Anual",
};

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  const company = await prisma.company.findUnique({
    where: { id: numericId },
    include: {
      parent: { select: { id: true, name: true } },
      salesRep: { select: { id: true, name: true, email: true } },
      branches: { select: { id: true, name: true, type: true } },
      contacts: { orderBy: { isPrimary: "desc" } },
      clientProducts: {
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
      },
      visits: {
        include: {
          contact: { select: { id: true, name: true } },
          assignedUser: { select: { id: true, name: true } },
        },
        orderBy: { scheduledDate: "desc" },
        take: 20,
      },
      _count: { select: { contacts: true, clientProducts: true, visits: true, supportCases: true } },
    },
  });

  if (!company) notFound();

  let licenseAssignments: any[] = [];
  if (company.type === "MAIN") {
    const direct = await prisma.licenseAssignment.findMany({
      where: { companyId: numericId, branchId: null },
      include: { license: { include: { product: true } }, company: true, branch: true },
      orderBy: { assignedAt: "desc" },
    });
    const branchAssignments = await prisma.licenseAssignment.findMany({
      where: { companyId: numericId, branchId: { not: null } },
      include: { license: { include: { product: true } }, company: true, branch: true },
      orderBy: { assignedAt: "desc" },
    });
    licenseAssignments = [...direct, ...branchAssignments];
  } else {
    licenseAssignments = await prisma.licenseAssignment.findMany({
      where: { branchId: numericId },
      include: { license: { include: { product: true } }, company: true, branch: true },
      orderBy: { assignedAt: "desc" },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={company.name}
        subtitle={[
          company.taxId ? `ID: ${company.taxIdType || "V"}-${company.taxId}` : null,
          `Creada el ${formatDate(company.createdAt)}`,
          company.salesRep ? `Rep. Ventas: ${company.salesRep.name || company.salesRep.email}` : null,
        ].filter(Boolean).join(" · ")}
        actions={
          <div className="flex gap-2">
            <Link href={`/companies/${company.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar
              </Button>
            </Link>
            <Badge variant={typeBadge[company.type].variant}>{typeBadge[company.type].label}</Badge>
            <Badge variant={company.isActive ? "success" : "danger"}>{company.isActive ? "Activa" : "Inactiva"}</Badge>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in-up animate-delay-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <CardTitle>Información General</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Dirección", value: [company.address, company.localidad, company.parish, company.municipality, company.state, "Venezuela"].filter(Boolean).join(", ") },
              { label: "Teléfono", value: company.phone },
              { label: "Email", value: company.email },
              { label: "Sitio Web", value: company.website },
              company.economicActivity ? { label: "Actividad Económica", value: `${company.economicActivity} - ${ECONOMIC_ACTIVITIES.find(a => a.code === company.economicActivity)?.name || ""}` } : null,
            ].filter((item): item is { label: string; value: string } => item !== null).map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-navy-50 pb-2">
                <span className="text-navy-400">{label}</span>
                <span className="text-right font-medium text-navy-700">{value || "-"}</span>
              </div>
            ))}
            {company.parent && (
              <div className="flex justify-between border-b border-navy-50 pb-2">
                <span className="text-navy-400">Empresa Principal</span>
                <Link href={`/companies/${company.parent.id}`} className="font-medium text-blue-600 hover:underline">
                  {company.parent.name}
                </Link>
              </div>
            )}
            {company.notes && (
              <div className="border-b border-navy-50 pb-2">
                <span className="mb-1 block text-navy-400">Notas</span>
                <p className="whitespace-pre-wrap text-navy-700">{company.notes}</p>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-navy-400">Sucursales</span>
              <span className="font-medium text-navy-700">{company.branches.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-2">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Contactos", value: company._count.contacts, bg: "bg-blue-50", text: "text-blue-700", icon: Users },
                { label: "Prod/Servicios", value: company._count.clientProducts, bg: "bg-emerald-50", text: "text-emerald-700", icon: Package },
                { label: "Licencias", value: licenseAssignments.length, bg: "bg-cyan-50", text: "text-cyan-700", icon: KeyRound },
                { label: "Visitas", value: company._count.visits, bg: "bg-amber-50", text: "text-amber-700", icon: CalendarCheck },
              ].map(({ label, value, bg, text, icon: Icon }) => (
                <div key={label} className={`rounded-xl ${bg} p-4 text-center transition-all duration-300 hover:scale-105`}>
                  <Icon className={`mx-auto mb-1 h-5 w-5 ${text} opacity-60`} />
                  <p className={`text-2xl font-bold ${text}`}>{value}</p>
                  <p className={`text-xs ${text} opacity-80`}>{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {company.branches.length > 0 && (
        <Card className="animate-fade-in-up animate-delay-3">
          <CardHeader>
            <CardTitle>Sucursales ({company.branches.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <Link href={`/companies/${branch.id}`} className="font-medium text-blue-600 hover:underline">
                        {branch.name}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {[
        { title: "Contactos", count: company.contacts.length, items: company.contacts, cols: ["Nombre", "Cargo", "Teléfono", "Email", "Principal"], render: (c: any) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium text-navy-900">{c.name}</TableCell>
            <TableCell className="text-navy-500">{c.position || "-"}</TableCell>
            <TableCell className="text-navy-500">{c.phone || "-"}</TableCell>
            <TableCell className="text-navy-500">{c.email || "-"}</TableCell>
            <TableCell>{c.isPrimary && <Badge variant="success">Principal</Badge>}</TableCell>
          </TableRow>
        ), emptyMsg: "No hay contactos registrados" },
        { title: "Productos / Servicios", count: company.clientProducts.length, items: company.clientProducts, cols: ["Producto", "Categoría", "Cantidad", "Precio", "Inicio", "Fin", "Estado"], render: (cp: any) => (
          <TableRow key={cp.id}>
            <TableCell className="font-medium text-navy-900">{cp.product.name}</TableCell>
            <TableCell className="text-navy-500">{cp.product.category?.name || "-"}</TableCell>
            <TableCell className="text-navy-700">{cp.quantity}</TableCell>
            <TableCell className="text-navy-700">{formatCurrency(cp.price)}</TableCell>
            <TableCell className="text-sm text-navy-400">{cp.startDate ? formatDate(cp.startDate) : "-"}</TableCell>
            <TableCell className="text-sm text-navy-400">{cp.endDate ? formatDate(cp.endDate) : "-"}</TableCell>
            <TableCell><Badge variant={productStatusBadge[cp.status].variant}>{productStatusBadge[cp.status].label}</Badge></TableCell>
          </TableRow>
        ), emptyMsg: "No hay productos o servicios contratados" },
        { title: "Licencias", count: licenseAssignments.length, items: licenseAssignments, cols: company.type === "MAIN" ? ["Entidad", "Producto", "Renovación", "Precio", "Soporte", "Capacitaciones", "Vigencia", "Estado", ""] : ["Producto", "Renovación", "Precio", "Soporte", "Capacitaciones", "Vigencia", "Estado", ""], render: (la: any) => {
          const renewal = la.renewalPeriod || la.license.renewalPeriod;
          const price = la.priceOverride != null ? Number(la.priceOverride) : null;
          const supportH = la.supportHours ?? 0;
          const trainings = la.trainingSessions ?? 0;
          const isBranch = la.branchId != null;
          return (
          <TableRow key={la.id}>
            {company.type === "MAIN" && (
              <TableCell>
                {isBranch ? (
                  <div className="flex items-center gap-1.5">
                    <Store className="h-3 w-3 text-sky-500" />
                    <span className="text-sm text-navy-700">{la.branch?.name || "Sucursal"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-blue-500" />
                    <span className="text-sm font-medium text-navy-900">Directo</span>
                  </div>
                )}
              </TableCell>
            )}
            <TableCell className="font-medium text-navy-900">{la.license.product.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5 text-sm text-navy-700">
                <RefreshCw className="h-3 w-3 text-navy-300" />
                {renewal ? (renewalPeriodLabel[renewal] || renewal) : "Sin período"}
              </div>
            </TableCell>
            <TableCell>
              {price != null ? (
                <div className="flex items-center gap-1 text-sm font-medium text-navy-900">
                  <DollarSign className="h-3 w-3 text-amber-500" />
                  {formatCurrency(price)}
                </div>
              ) : (
                <span className="text-sm text-navy-400">—</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-navy-700">
                <Clock className="h-3 w-3 text-blue-400" />
                {supportH > 0 ? `${supportH}h` : "—"}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-navy-700">
                <GraduationCap className="h-3 w-3 text-violet-400" />
                {trainings > 0 ? `${trainings}` : "—"}
              </div>
            </TableCell>
            <TableCell className="text-xs text-navy-400">{formatDate(la.license.startDate)} — {formatDate(getEffectiveEndDate(la.renewalEndDate, la.license.startDate, la.renewalPeriod || la.license.renewalPeriod))}</TableCell>
            <TableCell><Badge variant={(() => { const end = getEffectiveEndDate(la.renewalEndDate, la.license.startDate, la.renewalPeriod || la.license.renewalPeriod); if (la.status === "CANCELLED") return "danger"; if (la.status === "SUSPENDED") return "warning"; if (new Date(end) < new Date()) return "danger"; return "success"; })()}>{(() => { const end = getEffectiveEndDate(la.renewalEndDate, la.license.startDate, la.renewalPeriod || la.license.renewalPeriod); if (la.status === "CANCELLED") return "Cancelada"; if (la.status === "SUSPENDED") return "Suspendida"; if (new Date(end) < new Date()) return "Vencida"; return "Activa"; })()}</Badge></TableCell>
            <TableCell>
              <LicensePaymentButton
                assignment={{
                  id: la.id,
                  renewalPeriod: la.renewalPeriod || null,
                  priceOverride: la.priceOverride != null ? Number(la.priceOverride) : null,
                  company: { id: la.company.id, name: la.company.name },
                  branch: la.branch ? { id: la.branch.id, name: la.branch.name } : null,
                  license: { id: la.license.id, name: la.license.name, product: { name: la.license.product.name } },
                }}
              />
            </TableCell>
          </TableRow>
          );
        }, emptyMsg: "No hay licencias asignadas" },
        { title: "Historial de Visitas", count: company._count.visits, items: company.visits, cols: ["Tipo", "Fecha Programada", "Contacto", "Asignado a", "Estado"], render: (v: any) => (
          <TableRow key={v.id}>
            <TableCell className="text-navy-500">{visitTypeLabels[v.type] || v.type}</TableCell>
            <TableCell className="text-sm text-navy-400">{formatDate(v.scheduledDate)}</TableCell>
            <TableCell className="text-navy-500">{v.contact?.name || "-"}</TableCell>
            <TableCell className="text-navy-500">{v.assignedUser?.name || "-"}</TableCell>
            <TableCell><Badge variant={visitStatusBadge[v.status].variant}>{visitStatusBadge[v.status].label}</Badge></TableCell>
          </TableRow>
        ), emptyMsg: "No hay visitas registradas" },
      ].map((section, i) => (
        <Card key={section.title} className="animate-fade-in-up" style={{ animationDelay: `${(i + 3) * 50}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{section.title} ({section.count})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {section.cols.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={section.cols.length} className="text-center text-navy-400 py-8">
                      {section.emptyMsg}
                    </TableCell>
                  </TableRow>
                ) : (
                  section.items.map((item: any) => section.render(item))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
