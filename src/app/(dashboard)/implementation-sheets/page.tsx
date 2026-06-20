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
import { ClipboardList, Plus } from "lucide-react";

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
      <PageHeader
        title="Fichas de Implementación"
        subtitle="Gestiona las fichas de implementación de proyectos"
        actions={
          <Link href="/implementation-sheets/new">
            <Button><Plus className="mr-2 h-4 w-4" />Nueva Ficha</Button>
          </Link>
        }
      />

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
              <TableCell colSpan={5}>
                <EmptyState icon={<ClipboardList className="h-12 w-12" />} message="No hay fichas de implementación registradas" />
              </TableCell>
            </TableRow>
          ) : (
            sheets.map((s: { id: number; company: { id: number; name: string }; creator: { id: number; name: string | null }; status: string; createdAt: Date }) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-navy-900">{s.company.name}</TableCell>
                <TableCell className="text-navy-500">{s.creator.name || "—"}</TableCell>
                <TableCell><Badge variant={statusVariants[s.status] || "default"}>{statusLabels[s.status] || s.status}</Badge></TableCell>
                <TableCell className="text-sm text-navy-400">{formatDate(s.createdAt)}</TableCell>
                <TableCell><Link href={`/implementation-sheets/${s.id}`}><Button variant="ghost" size="sm">Ver</Button></Link></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
