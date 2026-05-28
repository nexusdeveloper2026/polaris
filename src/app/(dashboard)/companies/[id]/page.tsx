import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

const typeBadge = {
  MAIN: { label: "Principal", variant: "primary" as const },
  BRANCH: { label: "Sucursal", variant: "info" as const },
};

const licenseStatusBadge = {
  ACTIVE: { label: "Activa", variant: "success" as const },
  EXPIRED: { label: "Vencida", variant: "danger" as const },
  SUSPENDED: { label: "Suspendida", variant: "warning" as const },
};

const productStatusBadge = {
  ACTIVE: { label: "Activo", variant: "success" as const },
  EXPIRED: { label: "Vencido", variant: "danger" as const },
  CANCELLED: { label: "Cancelado", variant: "warning" as const },
};

const visitStatusBadge = {
  SCHEDULED: { label: "Programada", variant: "primary" as const },
  IN_PROGRESS: { label: "En Curso", variant: "warning" as const },
  COMPLETED: { label: "Completada", variant: "success" as const },
  CANCELLED: { label: "Cancelada", variant: "danger" as const },
};

const visitTypeLabels: Record<string, string> = {
  DEMO: "Demo",
  INFO_GATHERING: "Toma de Información",
  INSTALLATION: "Instalación",
  INDUCTION: "Inducción",
  REINDUCTION: "Reinducción",
  POST_SALE: "Post-Venta",
  TECHNICAL: "Técnica",
};

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      branches: { select: { id: true, name: true, type: true } },
      contacts: { orderBy: { isPrimary: "desc" } },
      clientProducts: {
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
      },
      licenses: {
        include: { product: true },
        orderBy: { createdAt: "desc" },
      },
      visits: {
        include: {
          contact: { select: { id: true, name: true } },
          assignedUser: { select: { id: true, name: true } },
        },
        orderBy: { scheduledDate: "desc" },
        take: 20,
      },
      _count: {
        select: {
          contacts: true,
          licenses: true,
          clientProducts: true,
          visits: true,
          supportCases: true,
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-gray-500">
            {company.taxId && <>RNC: {company.taxId} &middot; </>}
            Creada el {formatDate(company.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={typeBadge[company.type].variant}>
            {typeBadge[company.type].label}
          </Badge>
          <Badge variant={company.isActive ? "success" : "danger"}>
            {company.isActive ? "Activa" : "Inactiva"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Dirección</span>
              <span className="text-right">{company.address || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Teléfono</span>
              <span>{company.phone || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Email</span>
              <span>{company.email || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Sitio Web</span>
              <span>{company.website || "-"}</span>
            </div>
            {company.parent && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Empresa Principal</span>
                <Link
                  href={`/companies/${company.parent.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {company.parent.name}
                </Link>
              </div>
            )}
            {company.notes && (
              <div className="border-b pb-2">
                <span className="block text-gray-500 mb-1">Notas</span>
                <p className="whitespace-pre-wrap">{company.notes}</p>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">Sucursales</span>
              <span>{company._count.contacts > 0 ? company.branches.length : 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{company._count.contacts}</p>
                <p className="text-xs text-blue-600">Contactos</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {company._count.clientProducts}
                </p>
                <p className="text-xs text-green-600">Prod/Servicios</p>
              </div>
              <div className="rounded-lg bg-cyan-50 p-4 text-center">
                <p className="text-2xl font-bold text-cyan-700">
                  {company._count.licenses}
                </p>
                <p className="text-xs text-cyan-600">Licencias</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{company._count.visits}</p>
                <p className="text-xs text-amber-600">Visitas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {company.branches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sucursales ({company.branches.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <Link
                        href={`/companies/${branch.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {branch.name}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contactos ({company.contacts.length})</CardTitle>
          <Button variant="outline" size="sm">Añadir Contacto</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Principal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                    No hay contactos registrados
                  </TableCell>
                </TableRow>
              ) : (
                company.contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.position || "-"}</TableCell>
                    <TableCell>{contact.phone || "-"}</TableCell>
                    <TableCell>{contact.email || "-"}</TableCell>
                    <TableCell>
                      {contact.isPrimary && (
                        <Badge variant="success">Principal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos / Servicios ({company.clientProducts.length})</CardTitle>
          <Button variant="outline" size="sm">Añadir Producto</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.clientProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                    No hay productos o servicios contratados
                  </TableCell>
                </TableRow>
              ) : (
                company.clientProducts.map((cp) => (
                  <TableRow key={cp.id}>
                    <TableCell className="font-medium">{cp.product.name}</TableCell>
                    <TableCell>{cp.product.category?.name || "-"}</TableCell>
                    <TableCell>{cp.quantity}</TableCell>
                    <TableCell>{formatCurrency(cp.price)}</TableCell>
                    <TableCell className="text-sm">
                      {cp.startDate ? formatDate(cp.startDate) : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {cp.endDate ? formatDate(cp.endDate) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={productStatusBadge[cp.status].variant}>
                        {productStatusBadge[cp.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Licencias ({company.licenses.length})</CardTitle>
          <Button variant="outline" size="sm">Añadir Licencia</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.licenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                    No hay licencias registradas
                  </TableCell>
                </TableRow>
              ) : (
                company.licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-medium">{license.product.name}</TableCell>
                    <TableCell className="font-mono text-xs">{license.licenseKey}</TableCell>
                    <TableCell>{license.maxUsers}</TableCell>
                    <TableCell className="text-sm">{formatDate(license.startDate)}</TableCell>
                    <TableCell className="text-sm">{formatDate(license.endDate)}</TableCell>
                    <TableCell>
                      <Badge variant={licenseStatusBadge[license.status].variant}>
                        {licenseStatusBadge[license.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Visitas ({company._count.visits})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Programada</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.visits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                    No hay visitas registradas
                  </TableCell>
                </TableRow>
              ) : (
                company.visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{visitTypeLabels[visit.type] || visit.type}</TableCell>
                    <TableCell className="text-sm">{formatDate(visit.scheduledDate)}</TableCell>
                    <TableCell>{visit.contact?.name || "-"}</TableCell>
                    <TableCell>{visit.assignedUser?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={visitStatusBadge[visit.status].variant}>
                        {visitStatusBadge[visit.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
