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

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  COMPLETED: "Completado",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

const statusVariants: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "default",
  COMPLETED: "primary",
  APPROVED: "success",
  REJECTED: "danger",
};

async function getSheets(searchParams: { companyId?: string }) {
  const where: Record<string, unknown> = {};
  if (searchParams.companyId) where.companyId = searchParams.companyId;

  return prisma.implementationSheet.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ImplementationSheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const sheets = await getSheets(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hojas de Implementación</h1>
        <Link href="/implementation-sheets/new">
          <Button>Nueva Hoja</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Creado por</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sheets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No hay hojas de implementación registradas
              </TableCell>
            </TableRow>
          ) : (
            sheets.map((s: { id: string; company: { id: string; name: string }; creator: { id: string; name: string | null }; status: string; createdAt: Date }) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.company.name}</TableCell>
                <TableCell>{s.creator.name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[s.status] || "default"}>
                    {statusLabels[s.status] || s.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(s.createdAt)}</TableCell>
                <TableCell>
                  <Link href={`/implementation-sheets/${s.id}`}>
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
