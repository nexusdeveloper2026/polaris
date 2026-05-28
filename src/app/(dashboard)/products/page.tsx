import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { formatCurrency } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { Package, Plus } from "lucide-react";

const typeBadge: Record<string, "primary" | "info"> = { PRODUCT: "primary", SERVICE: "info" };

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        subtitle="Gestiona el catálogo de productos y servicios"
        actions={
          <Link href="/products/new">
            <Button><Plus className="mr-2 h-4 w-4" />Nuevo Producto</Button>
          </Link>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState icon={<Package className="h-12 w-12" />} message="No hay productos registrados" />
              </TableCell>
            </TableRow>
          ) : (
            products.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-navy-900">{product.name}</TableCell>
                <TableCell className="text-navy-500">{product.category?.name ?? "—"}</TableCell>
                <TableCell><Badge variant={typeBadge[product.type] ?? "default"}>{product.type === "PRODUCT" ? "Producto" : "Servicio"}</Badge></TableCell>
                <TableCell className="text-navy-700">{formatCurrency(product.price)}</TableCell>
                <TableCell><Badge variant={product.isActive ? "success" : "danger"}>{product.isActive ? "Activo" : "Inactivo"}</Badge></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
