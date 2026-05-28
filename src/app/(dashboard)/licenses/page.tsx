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

const statusVariant: Record<string, "success" | "danger" | "warning"> = {
  ACTIVE: "success",
  EXPIRED: "danger",
  SUSPENDED: "warning",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Activa",
  EXPIRED: "Expirada",
  SUSPENDED: "Suspendida",
};

function daysRemaining(endDate: Date): number {
  const diff = endDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function LicensesPage() {
  const licenses = await prisma.license.findMany({
    include: { company: true, product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Licencias</h1>
        <Link href="/licenses/new">
          <Button>Nueva Licencia</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado de Licencias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Días Rest.</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license: any) => (
                <TableRow key={license.id}>
                  <TableCell className="font-medium">{license.company.name}</TableCell>
                  <TableCell>{license.product.name}</TableCell>
                  <TableCell className="font-mono text-xs">{license.licenseKey}</TableCell>
                  <TableCell>{formatDate(license.startDate)}</TableCell>
                  <TableCell>{formatDate(license.endDate)}</TableCell>
                  <TableCell>{daysRemaining(license.endDate)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[license.status] ?? "default"}>
                      {statusLabel[license.status] ?? license.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {licenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No hay licencias registradas
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
