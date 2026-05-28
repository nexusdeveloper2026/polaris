import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
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
import { formatDate, getSlaStatus } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Casos de Soporte</h1>
        <Link href="/support-cases/new">
          <Button>Nuevo Caso</Button>
        </Link>
      </div>

      <form className="flex gap-4" method="GET">
        <select
          name="priority"
          className="flex h-10 w-full max-w-[200px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          defaultValue={params.priority || ""}
        >
          <option value="">Todas las prioridades</option>
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="status"
          className="flex h-10 w-full max-w-[200px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          defaultValue={params.status || ""}
        >
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
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
              <TableCell colSpan={7} className="text-center text-gray-500">
                No hay casos registrados
              </TableCell>
            </TableRow>
          ) : (
            cases.map((c) => {
              const slaStatus = getSlaStatus(c.slaDeadline);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.company.name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {c.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityVariants[c.priority] || "default"}>
                      {priorityLabels[c.priority] || c.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[c.status] || "default"}>
                      {statusLabels[c.status] || c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={slaVariants[slaStatus] || "default"}>
                      {slaLabels[slaStatus] || slaStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.assignedUser?.name || c.assignedUser?.email || "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/support-cases/${c.id}`}>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
