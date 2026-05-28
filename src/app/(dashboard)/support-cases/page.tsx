import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { formatDate, getSlaStatus } from "@/lib/utils";
import { TicketCheck, Plus } from "lucide-react";

const priorityVariants: Record<string, "default" | "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
};

const statusVariants: Record<string, "default" | "primary" | "warning" | "success" | "danger" | "info"> = {
  OPEN: "danger",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const statusLabels: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En Progreso",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

const slaLabels: Record<string, string> = {
  vencido: "Vencido",
  por_vencer: "Por Vencer",
  dentro_plazo: "En Plazo",
  sin_sla: "Sin SLA",
};

const slaVariants: Record<string, "danger" | "warning" | "success" | "default"> = {
  vencido: "danger",
  por_vencer: "warning",
  dentro_plazo: "success",
  sin_sla: "default",
};

async function getCases(searchParams: { status?: string; priority?: string }) {
  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.priority) where.priority = searchParams.priority;

  return prisma.supportCase.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function SupportCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const cases = await getCases(params);

  const selectClass = "h-10 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Casos de Soporte"
        subtitle="Gestiona los casos de soporte técnico"
        actions={
          <Link href="/support-cases/new">
            <Button><Plus className="mr-2 h-4 w-4" />Nuevo Caso</Button>
          </Link>
        }
      />

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
        <form className="flex flex-wrap gap-4" method="GET">
          <select name="priority" className={selectClass} defaultValue={params.priority || ""}>
            <option value="">Todas las prioridades</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
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
            <TableHead>Asunto</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead>Asignado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyState icon={<TicketCheck className="h-12 w-12" />} message="No hay casos registrados" />
              </TableCell>
            </TableRow>
          ) : (
            cases.map((c) => {
              const slaStatus = getSlaStatus(c.slaDeadline);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-navy-900">{c.company.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-navy-500">{c.subject}</TableCell>
                  <TableCell><Badge variant={priorityVariants[c.priority] || "default"}>{priorityLabels[c.priority] || c.priority}</Badge></TableCell>
                  <TableCell><Badge variant={statusVariants[c.status] || "default"}>{statusLabels[c.status] || c.status}</Badge></TableCell>
                  <TableCell><Badge variant={slaVariants[slaStatus] || "default"}>{slaLabels[slaStatus] || slaStatus}</Badge></TableCell>
                  <TableCell className="text-navy-500">{c.assignedUser?.name || c.assignedUser?.email || "—"}</TableCell>
                  <TableCell><Link href={`/support-cases/${c.id}`}><Button variant="ghost" size="sm">Ver</Button></Link></TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
