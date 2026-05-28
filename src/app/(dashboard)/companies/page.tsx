import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { CompaniesFilters } from "./companies-filters";

interface PageProps {
  searchParams: Promise<{ search?: string; type?: string; page?: string }>;
}

const typeBadge = {
  MAIN: { label: "Principal", variant: "primary" as const },
  BRANCH: { label: "Sucursal", variant: "info" as const },
};

export default async function CompaniesPage({ searchParams }: PageProps) {
  const { search, type, page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr || "1", 10));
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { taxId: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type === "MAIN" || type === "BRANCH") {
    where.type = type;
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { contacts: true, licenses: true, clientProducts: true } },
        parent: { select: { name: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Link href="/companies/new">
          <Button>Nueva Empresa</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <CompaniesFilters
            currentSearch={search || ""}
            currentType={type || ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RNC</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Empresa Principal</TableHead>
                <TableHead>Contactos</TableHead>
                <TableHead>Licencias</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No se encontraron empresas
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Link
                        href={`/companies/${company.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {company.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{company.taxId || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={typeBadge[company.type].variant}>
                        {typeBadge[company.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{company.parent?.name || "-"}</TableCell>
                    <TableCell>{company._count.contacts}</TableCell>
                    <TableCell>{company._count.licenses}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(company.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.isActive ? "success" : "danger"}>
                        {company.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {currentPage} de {totalPages} ({total} registros)
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/companies?${new URLSearchParams({ ...(search && { search }), ...(type && { type }), page: String(currentPage - 1) }).toString()}`}
              >
                <Button variant="outline" size="sm">Anterior</Button>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/companies?${new URLSearchParams({ ...(search && { search }), ...(type && { type }), page: String(currentPage + 1) }).toString()}`}
              >
                <Button variant="outline" size="sm">Siguiente</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
