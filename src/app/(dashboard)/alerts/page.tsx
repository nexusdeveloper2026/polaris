import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { Info, CheckCircle2, AlertTriangle, XCircle, Bell } from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  INFO: <Info className="h-5 w-5 text-blue-500" />,
  SUCCESS: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  WARNING: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  ERROR: <XCircle className="h-5 w-5 text-red-500" />,
};

async function getAlerts(userId: number, searchParams: { unreadOnly?: string }) {
  const where: Record<string, unknown> = { userId };
  if (searchParams.unreadOnly === "true") where.isRead = false;
  return prisma.alert.findMany({ where, orderBy: { createdAt: "desc" } });
}

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ unreadOnly?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const userId = Number((session.user as any).id);
  const alerts = await getAlerts(userId, params);

  const checkboxClass = "h-4 w-4 rounded border-navy-300 text-blue-600 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas"
        subtitle="Notificaciones y alertas del sistema"
        actions={
          <form method="POST" action="/api/alerts">
            <input type="hidden" name="_method" value="PATCH" />
            <Button type="submit" variant="outline">Marcar todas como leídas</Button>
          </form>
        }
      />

      <div className="animate-fade-in-up animate-delay-1 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
        <form className="flex items-center gap-4" method="GET">
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input type="checkbox" name="unreadOnly" value="true" defaultChecked={params.unreadOnly === "true"} className={checkboxClass} />
            Solo no leídas
          </label>
          <Button type="submit" variant="outline" size="sm">Filtrar</Button>
        </form>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={<Bell className="h-12 w-12" />} message="No hay alertas" />
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up animate-delay-1 space-y-3">
          {alerts.map((alert: { id: number; type: string; title: string; message: string; isRead: boolean; createdAt: Date }) => (
            <Card key={alert.id} className={`transition-all duration-300 hover:shadow-md ${alert.isRead ? "opacity-60" : ""}`}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <span className="mt-0.5">{typeIcons[alert.type] || <Bell className="h-5 w-5 text-navy-400" />}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold text-navy-900">{alert.title}</CardTitle>
                    {!alert.isRead && <Badge variant="primary">Nueva</Badge>}
                  </div>
                  <CardDescription className="text-xs text-navy-400">{formatDate(alert.createdAt)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-4 text-sm text-navy-600">{alert.message}</CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
