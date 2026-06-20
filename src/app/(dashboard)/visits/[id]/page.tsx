import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  DEMO: "Demo",
  INFO_GATHERING: "Información",
  INSTALLATION: "Instalación",
  INDUCTION: "Inducción",
  REINDUCTION: "Reinducción",
  POST_SALE: "Post Venta",
  TECHNICAL: "Técnica",
};

const statusVariants: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  SCHEDULED: "warning",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Programada",
  IN_PROGRESS: "En Curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const nextStatus: Record<string, string[]> = {
  SCHEDULED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

async function getVisit(id: number) {
  return prisma.visit.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });
}

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const numericId = parseInt(id, 10);
  const visit = await getVisit(numericId);

  if (!visit) notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as string;
    const sess = await auth();
    if (!sess?.user) return;

    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === "COMPLETED") {
      data.completedDate = new Date();
    }

    await prisma.visit.update({
      where: { id: numericId },
      data,
    });
    redirect(`/visits/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalle de Visita</h1>
        <Button variant="outline" onClick={() => redirect("/visits")}>
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-medium">{visit.company.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contacto</p>
              <p className="font-medium">
                {visit.contact?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo</p>
              <Badge>{typeLabels[visit.type] || visit.type}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <Badge variant={statusVariants[visit.status]}>
                {statusLabels[visit.status] || visit.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Programada</p>
              <p className="font-medium">{formatDate(visit.scheduledDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Completada</p>
              <p className="font-medium">
                {visit.completedDate ? formatDate(visit.completedDate) : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Asignado</p>
              <p className="font-medium">
                {visit.assignedUser?.name || visit.assignedUser?.email || "—"}
              </p>
            </div>
          </div>
          {visit.notes && (
            <div>
              <p className="text-sm text-gray-500">Notas</p>
              <p className="mt-1 whitespace-pre-wrap">{visit.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {nextStatus[visit.status]?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateStatus} className="flex gap-4">
              <input type="hidden" name="status" value="" />
              {nextStatus[visit.status].map((ns) => (
                <Button
                  key={ns}
                  type="submit"
                  variant={ns === "CANCELLED" ? "destructive" : "default"}
                  name="status"
                  value={ns}
                >
                  {statusLabels[ns] || ns}
                </Button>
              ))}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
