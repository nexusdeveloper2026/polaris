import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, Plus } from "lucide-react";

const typeVariants: Record<string, "default" | "primary" | "info" | "success" | "warning" | "danger"> = {
  DEMO: "primary",
  INSTALLATION: "info",
  TECHNICAL: "default",
};

const statusVariants: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  SCHEDULED: "warning",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const typeLabels: Record<string, string> = {
  DEMO: "Demo",
  INFO_GATHERING: "Info",
  INSTALLATION: "Instalación",
  INDUCTION: "Inducción",
  REINDUCTION: "Reinducción",
  POST_SALE: "Post Venta",
  TECHNICAL: "Técnica",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Programada",
  IN_PROGRESS: "En Curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

async function getVisits(searchParams: { status?: string; type?: string }) {
  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.type) where.type = searchParams.type;

  return prisma.visit.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { scheduledDate: "desc" },
  });
}

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const visits = await getVisits(params);

  const selectClass = "h-10 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitas"
        subtitle="Gestiona las visitas programadas a empresas"
        actions={
          <Link href="/visits/new">
            <Button><Plus className="mr-2 h-4 w-4" />Nueva Visita</Button>
          </Link>
        }
      />

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
        <form className="flex flex-wrap gap-4" method="GET">
          <select name="type" className={selectClass} defaultValue={params.type || ""}>
            <option value="">Todos los tipos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select name="status" className={selectClass} defaultValue={params.status || ""}>
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button type="submit" variant="outline">Filtrar</Button>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asignado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState icon={<CalendarCheck className="h-12 w-12" />} message="No hay visitas registradas" />
              </TableCell>
            </TableRow>
          ) : (
            visits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell className="font-medium text-navy-900">{visit.company.name}</TableCell>
                <TableCell><Badge variant={typeVariants[visit.type] || "default"}>{typeLabels[visit.type] || visit.type}</Badge></TableCell>
                <TableCell className="text-sm text-navy-400">{formatDate(visit.scheduledDate)}</TableCell>
                <TableCell><Badge variant={statusVariants[visit.status] || "default"}>{statusLabels[visit.status] || visit.status}</Badge></TableCell>
                <TableCell className="text-navy-500">{visit.assignedUser?.name || visit.assignedUser?.email || "—"}</TableCell>
                <TableCell><Link href={`/visits/${visit.id}`}><Button variant="ghost" size="sm">Ver</Button></Link></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
