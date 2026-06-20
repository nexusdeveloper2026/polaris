import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getEffectiveEndDate } from "@/lib/utils";
import {
  Building2,
  KeyRound,
  CalendarCheck,
  TicketCheck,
  PlusCircle,
  UserPlus,
  Landmark,
  Store,
  AlertTriangle,
  Clock,
} from "lucide-react";

function daysRemaining(endDate: Date): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

async function getStats() {
  const [mainCompanies, branchCompanies, activeAssignments, pendingVisits, openCases] =
    await Promise.all([
      prisma.company.count({ where: { type: "MAIN", isActive: true } }),
      prisma.company.count({ where: { type: "BRANCH", isActive: true } }),
      prisma.licenseAssignment.count({ where: { status: "ACTIVE" } }),
      prisma.visit.count({ where: { status: "SCHEDULED" } }),
      prisma.supportCase.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
    ]);
  return { mainCompanies, branchCompanies, activeAssignments, pendingVisits, openCases };
}

async function getExpiringLicenses() {
  const assignments = await prisma.licenseAssignment.findMany({
    where: { status: "ACTIVE" },
    include: {
      license: { include: { product: true } },
      company: true,
      branch: true,
    },
  });

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiring = assignments
    .map((a) => {
      const renewal = a.renewalPeriod || a.license.renewalPeriod;
      const effectiveEnd = getEffectiveEndDate(a.renewalEndDate, a.license.startDate, renewal);
      const days = daysRemaining(effectiveEnd);
      return { ...a, effectiveEnd, days, renewal };
    })
    .filter((a) => a.days > 0 && a.days <= 30)
    .sort((a, b) => a.days - b.days);

  return expiring;
}

const cards = [
  {
    key: "Empresas Principales",
    icon: Landmark,
    accent: "from-blue-500 to-blue-600",
    bgGlow: "bg-blue-500/5",
    darkBgGlow: "dark:bg-blue-500/10",
  },
  {
    key: "Sucursales",
    icon: Store,
    accent: "from-sky-500 to-sky-600",
    bgGlow: "bg-sky-500/5",
    darkBgGlow: "dark:bg-sky-500/10",
  },
  {
    key: "Licencias Activas",
    icon: KeyRound,
    accent: "from-emerald-500 to-emerald-600",
    bgGlow: "bg-emerald-500/5",
    darkBgGlow: "dark:bg-emerald-500/10",
  },
  {
    key: "Visitas Pendientes",
    icon: CalendarCheck,
    accent: "from-amber-500 to-amber-600",
    bgGlow: "bg-amber-500/5",
    darkBgGlow: "dark:bg-amber-500/10",
  },
  {
    key: "Casos Abiertos",
    icon: TicketCheck,
    accent: "from-rose-500 to-rose-600",
    bgGlow: "bg-rose-500/5",
    darkBgGlow: "dark:bg-rose-500/10",
  },
];

const renewalPeriodLabel: Record<string, string> = {
  MONTHLY: "Mensual",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  SEMI_ANNUAL: "Semestral",
  ANNUAL: "Anual",
};

export default async function DashboardPage() {
  const [stats, expiringLicenses] = await Promise.all([getStats(), getExpiringLicenses()]);
  const values = [
    stats.mainCompanies,
    stats.branchCompanies,
    stats.activeAssignments,
    stats.pendingVisits,
    stats.openCases,
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-navy-300 dark:text-white/40">
          Resumen general del sistema
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
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
                  className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${card.bgGlow} ${card.darkBgGlow} transition-all duration-500 group-hover:scale-150`}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-sm font-medium text-navy-400 dark:text-white/40">
                    {card.key}
                  </span>
                  <Icon className="h-5 w-5 text-navy-300 dark:text-white/30 transition-transform duration-300 group-hover:scale-110" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight text-navy-900 dark:text-white">
                    {values[i]}
                  </div>
                  <div className={`mt-2 h-1 w-16 rounded-full bg-gradient-to-r ${card.accent} opacity-60`} />
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {expiringLicenses.length > 0 && (
        <div className="animate-fade-in-up animate-delay-2 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm dark:border-amber-500/20 dark:from-amber-500/5 dark:to-orange-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-amber-800 dark:text-amber-300">
                Licencias por Vencer
              </h3>
              <p className="text-sm text-amber-600/70 dark:text-amber-400/50">
                {expiringLicenses.length} licencia(s) vencen en menos de 30 días
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {expiringLicenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-amber-100 bg-white/70 px-4 py-3 transition-all hover:border-amber-200 hover:shadow-sm dark:border-amber-500/10 dark:bg-white/[0.03] dark:hover:border-amber-500/20"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-navy-900 dark:text-white">
                      {item.license.product.name}
                    </p>
                    <p className="text-xs text-navy-400 dark:text-white/40">
                      {item.company.name}{item.branch ? ` → ${item.branch.name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-navy-400 dark:text-white/40">
                    {renewalPeriodLabel[item.renewal || ""] || item.renewal || "Anual"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <Badge variant={item.days <= 7 ? "danger" : "warning"}>
                      {item.days}d restantes
                    </Badge>
                  </div>
                  <span className="text-xs text-navy-400 dark:text-white/40">
                    vence {formatDate(item.effectiveEnd)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-fade-in-up animate-delay-3 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-navy-800/80">
        <h3 className="text-base font-semibold text-navy-800 dark:text-white/80">
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
                className="group flex items-center gap-3 rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm font-medium text-navy-700 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/60 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
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
