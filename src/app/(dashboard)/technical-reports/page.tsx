import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";

const reportTypeLabels: Record<string, string> = {
  ERP_INSTALLATION: "Instalación ERP",
  TELECOM_NETWORK: "Red Telecomunicaciones",
  SECURITY_CAMERAS: "Cámaras Seguridad",
};

const reportTypeVariants: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "info"> = {
  ERP_INSTALLATION: "primary",
  TELECOM_NETWORK: "info",
  SECURITY_CAMERAS: "success",
};

async function getReports(searchParams: { companyId?: string; reportType?: string }) {
  const where: Record<string, unknown> = {};
  if (searchParams.companyId) where.companyId = searchParams.companyId;
  if (searchParams.reportType) where.reportType = searchParams.reportType;

  return prisma.technicalReport.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function TechnicalReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; reportType?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const reports = await getReports(params);

  const selectClass = "h-10 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Informes Técnicos"
        subtitle="Gestiona los informes y reportes técnicos"
        actions={
          <Link href="/technical-reports/new">
            <Button><Plus className="mr-2 h-4 w-4" />Nuevo Informe</Button>
          </Link>
        }
      />

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
        <form className="flex flex-wrap gap-4" method="GET">
          <select name="reportType" className={selectClass} defaultValue={params.reportType || ""}>
            <option value="">Todos los tipos</option>
            {Object.entries(reportTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button type="submit" variant="outline">Filtrar</Button>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Creado por</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState icon={<FileText className="h-12 w-12" />} message="No hay informes registrados" />
              </TableCell>
            </TableRow>
          ) : (
            reports.map((r: { id: string; title: string; company: { id: string; name: string }; reportType: string; creator: { id: string; name: string | null }; createdAt: Date }) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-navy-900">{r.title}</TableCell>
                <TableCell className="text-navy-500">{r.company.name}</TableCell>
                <TableCell><Badge variant={reportTypeVariants[r.reportType] || "default"}>{reportTypeLabels[r.reportType] || r.reportType}</Badge></TableCell>
                <TableCell className="text-navy-500">{r.creator.name || "—"}</TableCell>
                <TableCell className="text-sm text-navy-400">{formatDate(r.createdAt)}</TableCell>
                <TableCell><Link href={`/technical-reports/${r.id}`}><Button variant="ghost" size="sm">Ver</Button></Link></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
