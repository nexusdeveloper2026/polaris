import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reportes Técnicos</h1>
        <Link href="/technical-reports/new">
          <Button>Nuevo Reporte</Button>
        </Link>
      </div>

      <form className="flex gap-4" method="GET">
        <select
          name="reportType"
          className="flex h-10 w-full max-w-[200px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          defaultValue={params.reportType || ""}
        >
          <option value="">Todos los tipos</option>
          {Object.entries(reportTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

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
              <TableCell colSpan={6} className="text-center text-gray-500">
                No hay reportes registrados
              </TableCell>
            </TableRow>
          ) : (
            reports.map((r: { id: string; title: string; company: { id: string; name: string }; reportType: string; creator: { id: string; name: string | null }; createdAt: Date }) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell>{r.company.name}</TableCell>
                <TableCell>
                  <Badge variant={reportTypeVariants[r.reportType] || "default"}>
                    {reportTypeLabels[r.reportType] || r.reportType}
                  </Badge>
                </TableCell>
                <TableCell>{r.creator.name || "—"}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell>
                  <Link href={`/technical-reports/${r.id}`}>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
