import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { CompaniesFilters } from "./companies-filters";
import { Building2, Plus, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ search?: string; type?: string; page?: string }>;
}

const typeBadge = {
  MAIN: { label: "Principal", variant: "primary" as const },
  BRANCH: { label: "Sucursal", variant: "info" as const },
};

export default async function CompaniesPage({ searchParams }: PageProps) {
  const { search, type } = await searchParams;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { taxId: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const hasFilter = !!(search || type);

  let mainCompanies: any[] = [];
  let branchCount = 0;

  if (type === "BRANCH") {
    const [branches, total] = await Promise.all([
      prisma.company.findMany({
        where: { ...where, type: "BRANCH" },
        orderBy: { name: "asc" },
        include: {
          _count: { select: { contacts: true, licenseCompanies: true, clientProducts: true } },
          parent: { select: { name: true } },
        },
      }),
      prisma.company.count({ where: { ...where, type: "BRANCH" } }),
    ]);
    mainCompanies = branches;
    branchCount = total;
  } else {
    const filterWhere = hasFilter ? where : {};
    const [mains, orphans] = await Promise.all([
      prisma.company.findMany({
        where: { ...filterWhere, type: "MAIN" },
        orderBy: { name: "asc" },
        include: {
          branches: {
            where: search ? { OR: (where.OR as any) } : undefined,
            orderBy: { name: "asc" },
            include: {
              _count: { select: { contacts: true, licenseCompanies: true, clientProducts: true } },
              parent: { select: { name: true } },
            },
          },
          _count: { select: { contacts: true, licenseCompanies: true, clientProducts: true } },
          parent: { select: { name: true } },
        },
      }),
      hasFilter
        ? prisma.company.findMany({
            where: { ...where, type: "BRANCH", parentId: null },
            orderBy: { name: "asc" },
            include: {
              _count: { select: { contacts: true, licenseCompanies: true, clientProducts: true } },
              parent: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
    ]);
    mainCompanies = mains;
    branchCount = orphans.length + mains.reduce((sum, m) => sum + m.branches.length, 0);
  }

  const total = mainCompanies.length + branchCount;

  function renderCompanyRow(company: any, isBranch = false) {
    return (
      <TableRow key={company.id} className={isBranch ? "bg-navy-50/50" : ""}>
        <TableCell>
          <div className={`flex items-center gap-2 ${isBranch ? "ml-7" : ""}`}>
            {isBranch && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-navy-300" />}
            <div className="min-w-0">
              <Link href={`/companies/${company.id}`} className="font-medium text-blue-600 hover:underline">
                {company.name}
              </Link>
              {isBranch && company.parent && (
                <p className="text-xs text-navy-400 mt-0.5 truncate">{company.parent.name}</p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="font-mono text-sm text-navy-500">{company.taxId || "-"}</TableCell>
        <TableCell><Badge variant={typeBadge[company.type as keyof typeof typeBadge]?.variant ?? "default"}>{typeBadge[company.type as keyof typeof typeBadge]?.label ?? company.type}</Badge></TableCell>
        <TableCell className="text-sm text-navy-400">{formatDate(company.createdAt)}</TableCell>
        <TableCell><Badge variant={company.isActive ? "success" : "danger"}>{company.isActive ? "Activa" : "Inactiva"}</Badge></TableCell>
      </TableRow>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresas"
        subtitle="Gestiona las empresas del sistema"
        actions={
          <Link href="/companies/new">
            <Button><Plus className="mr-2 h-4 w-4" />Nueva Empresa</Button>
          </Link>
        }
      />

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
        <CompaniesFilters currentSearch={search || ""} currentType={type || ""} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>RNC</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Creada</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {total === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState icon={<Building2 className="h-12 w-12" />} message="No se encontraron empresas" />
              </TableCell>
            </TableRow>
          ) : type === "BRANCH" ? (
            mainCompanies.map((c) => renderCompanyRow(c, true))
          ) : (
            mainCompanies.flatMap((main) => [
              renderCompanyRow(main),
              ...main.branches.map((b: any) => renderCompanyRow(b, true)),
            ])
          )}
        </TableBody>
      </Table>
    </div>
  );
}
