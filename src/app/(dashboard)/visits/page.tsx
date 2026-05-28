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
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visitas</h1>
        <Link href="/visits/new">
          <Button>Nueva Visita</Button>
        </Link>
      </div>

      <form className="flex gap-4" method="GET">
        <select
          name="type"
          className="flex h-10 w-full max-w-[200px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          defaultValue={params.type || ""}
        >
          <option value="">Todos los tipos</option>
          {Object.entries(typeLabels).map(([value, label]) => (
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
              <TableCell colSpan={6} className="text-center text-gray-500">
                No hay visitas registradas
              </TableCell>
            </TableRow>
          ) : (
            visits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell className="font-medium">
                  {visit.company.name}
                </TableCell>
                <TableCell>
                  <Badge variant={typeVariants[visit.type] || "default"}>
                    {typeLabels[visit.type] || visit.type}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(visit.scheduledDate)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[visit.status] || "default"}>
                    {statusLabels[visit.status] || visit.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {visit.assignedUser?.name || visit.assignedUser?.email || "—"}
                </TableCell>
                <TableCell>
                  <Link href={`/visits/${visit.id}`}>
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
