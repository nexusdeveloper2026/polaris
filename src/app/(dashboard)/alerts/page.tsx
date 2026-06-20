import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { AlertList } from "@/components/alert-list";

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

  const serializedAlerts = alerts.map((a) => ({
    ...a,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas"
        subtitle="Notificaciones y alertas del sistema"
      />

      <AlertList initialAlerts={serializedAlerts as any} />
    </div>
  );
}
