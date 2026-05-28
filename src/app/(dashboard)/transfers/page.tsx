import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

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
    include: {
      user: true,
      approvedBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transferencias</h1>
        <Link href="/transfers/new">
          <Button>Nueva Transferencia</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado de Transferencias</CardTitle>
        </CardHeader>
        <CardContent>
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
              {transfers.map((transfer: any) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">{transfer.user.name ?? transfer.user.email}</TableCell>
                  <TableCell>{transfer.fromLocation}</TableCell>
                  <TableCell>{transfer.toLocation}</TableCell>
                  <TableCell>{formatDate(transfer.transferDate)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[transfer.status] ?? "default"}>
                      {statusLabel[transfer.status] ?? transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{transfer.approvedBy?.name ?? transfer.approvedBy?.email ?? "—"}</TableCell>
                </TableRow>
              ))}
              {transfers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No hay transferencias registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
