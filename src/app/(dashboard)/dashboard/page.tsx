import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getStats() {
  const [
    companies,
    activeLicenses,
    pendingVisits,
    openCases,
  ] = await Promise.all([
    prisma.company.count({ where: { isActive: true } }),
    prisma.license.count({ where: { status: "ACTIVE" } }),
    prisma.visit.count({ where: { status: "SCHEDULED" } }),
    prisma.supportCase.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);
  return { companies, activeLicenses, pendingVisits, openCases };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { title: "Empresas Activas", value: stats.companies, color: "bg-blue-500", href: "/companies" },
    { title: "Licencias Activas", value: stats.activeLicenses, color: "bg-green-500", href: "/licenses" },
    { title: "Visitas Pendientes", value: stats.pendingVisits, color: "bg-yellow-500", href: "/visits" },
    { title: "Casos Abiertos", value: stats.openCases, color: "bg-red-500", href: "/support-cases" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              <div className={`h-3 w-3 rounded-full ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
