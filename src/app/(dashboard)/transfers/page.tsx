import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { formatDate } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { Truck, Plus } from "lucide-react";

const statusVariant: Record<string, "warning" | "success" | "danger" | "primary"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  COMPLETED: "primary",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  COMPLETED: "Completada",
};

export default async function TransfersPage() {
  const transfers = await prisma.transfer.findMany({
    include: { user: true, approvedBy: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traslados"
        subtitle="Gestiona los traslados y transferencias de equipos"
        actions={
          <Link href="/transfers/new">
            <Button><Plus className="mr-2 h-4 w-4" />Nuevo Traslado</Button>
          </Link>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Aprobado por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState icon={<Truck className="h-12 w-12" />} message="No hay traslados registrados" />
              </TableCell>
            </TableRow>
          ) : (
            transfers.map((transfer: any) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium text-navy-900">{transfer.user.name ?? transfer.user.email}</TableCell>
                <TableCell className="text-navy-500">{transfer.fromLocation}</TableCell>
                <TableCell className="text-navy-500">{transfer.toLocation}</TableCell>
                <TableCell className="text-sm text-navy-400">{formatDate(transfer.transferDate)}</TableCell>
                <TableCell><Badge variant={statusVariant[transfer.status] ?? "default"}>{statusLabel[transfer.status] ?? transfer.status}</Badge></TableCell>
                <TableCell className="text-navy-500">{transfer.approvedBy?.name ?? transfer.approvedBy?.email ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
