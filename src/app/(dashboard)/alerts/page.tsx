import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const typeIcons: Record<string, string> = {
  INFO: "ℹ️",
  SUCCESS: "✅",
  WARNING: "⚠️",
  ERROR: "❌",
};

async function getAlerts(userId: string, searchParams: { unreadOnly?: string }) {
  const where: Record<string, unknown> = { userId };
  if (searchParams.unreadOnly === "true") where.isRead = false;

  return prisma.alert.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ unreadOnly?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const userId = (session.user as any).id;
  const alerts = await getAlerts(userId, params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alertas</h1>
        <form method="POST" action="/api/alerts">
          <input type="hidden" name="_method" value="PATCH" />
          <Button type="submit" variant="outline">
            Marcar todas como leídas
          </Button>
        </form>
      </div>

      <form className="flex gap-4" method="GET">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="unreadOnly"
            value="true"
            defaultChecked={params.unreadOnly === "true"}
          />
          Solo no leídas
        </label>
        <Button type="submit" variant="outline" size="sm">
          Filtrar
        </Button>
      </form>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay alertas
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: { id: string; type: string; title: string; message: string; isRead: boolean; createdAt: Date }) => (
            <Card key={alert.id} className={alert.isRead ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <span className="text-xl">
                  {typeIcons[alert.type] || "🔔"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{alert.title}</CardTitle>
                    {!alert.isRead && (
                      <Badge variant="primary">Nueva</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {formatDate(alert.createdAt)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-4 text-sm text-gray-700">
                {alert.message}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
