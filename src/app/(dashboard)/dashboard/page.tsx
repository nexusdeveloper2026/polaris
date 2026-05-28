import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Building2,
  KeyRound,
  CalendarCheck,
  TicketCheck,
  PlusCircle,
  UserPlus,
} from "lucide-react";

async function getStats() {
  const [companies, activeLicenses, pendingVisits, openCases] =
    await Promise.all([
      prisma.company.count({ where: { isActive: true } }),
      prisma.license.count({ where: { status: "ACTIVE" } }),
      prisma.visit.count({ where: { status: "SCHEDULED" } }),
      prisma.supportCase.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
    ]);
  return { companies, activeLicenses, pendingVisits, openCases };
}

const cards = [
  {
    key: "Empresas Activas",
    icon: Building2,
    accent: "from-blue-500 to-blue-600",
    bgGlow: "bg-blue-500/5",
  },
  {
    key: "Licencias Activas",
    icon: KeyRound,
    accent: "from-emerald-500 to-emerald-600",
    bgGlow: "bg-emerald-500/5",
  },
  {
    key: "Visitas Pendientes",
    icon: CalendarCheck,
    accent: "from-amber-500 to-amber-600",
    bgGlow: "bg-amber-500/5",
  },
  {
    key: "Casos Abiertos",
    icon: TicketCheck,
    accent: "from-rose-500 to-rose-600",
    bgGlow: "bg-rose-500/5",
  },
];

export default async function DashboardPage() {
  const stats = await getStats();
  const values = [
    stats.companies,
    stats.activeLicenses,
    stats.pendingVisits,
    stats.openCases,
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight text-navy-900">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-navy-300">
          Resumen general del sistema
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div
                  className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${card.bgGlow} transition-all duration-500 group-hover:scale-150`}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-sm font-medium text-navy-400">
                    {card.key}
                  </span>
                  <Icon className="h-5 w-5 text-navy-300 transition-transform duration-300 group-hover:scale-110" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight text-navy-900">
                    {values[i]}
                  </div>
                  <div className={`mt-2 h-1 w-16 rounded-full bg-gradient-to-r ${card.accent} opacity-60`} />
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="animate-fade-in-up animate-delay-3 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-navy-800">
          Accesos Rápidos
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Nueva Empresa", href: "/companies/new", icon: PlusCircle },
            { label: "Nueva Visita", href: "/visits/new", icon: CalendarCheck },
            { label: "Nuevo Caso", href: "/support-cases", icon: TicketCheck },
            { label: "Nuevo Usuario", href: "/users", icon: UserPlus },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm font-medium text-navy-700 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
