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
import { formatDate, getSlaStatus } from "@/lib/utils";
import { CommentForm } from "./comment-form";

const priorityVariants: Record<string, "default" | "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
};

const statusVariants: Record<string, "default" | "primary" | "warning" | "success" | "danger" | "info"> = {
  OPEN: "danger",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const statusLabels: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En Progreso",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

const slaLabels: Record<string, string> = {
  vencido: "Vencido",
  por_vencer: "Por Vencer",
  dentro_plazo: "En Plazo",
  sin_sla: "Sin SLA",
};

const nextStatus: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

async function getCase(id: number) {
  return prisma.supportCase.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export default async function SupportCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const numericId = parseInt(id, 10);
  const c = await getCase(numericId);

  if (!c) notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as string;
    const sess = await auth();
    if (!sess?.user) return;

    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === "RESOLVED") {
      data.resolvedAt = new Date();
    }

    await prisma.supportCase.update({
      where: { id: numericId },
      data,
    });

    if (newStatus === "RESOLVED" || newStatus === "CLOSED") {
      await prisma.alert.deleteMany({
        where: {
          relatedEntityType: "supportCase",
          relatedEntityId: numericId,
        },
      });
    }

    redirect(`/support-cases/${id}`);
  }

  const slaStatus = getSlaStatus(c.slaDeadline);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalle del Caso</h1>
        <Button variant="outline" onClick={() => redirect("/support-cases")}>
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{c.subject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-medium">{c.company.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contacto</p>
              <p className="font-medium">{c.contact?.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Prioridad</p>
              <Badge variant={priorityVariants[c.priority]}>
                {priorityLabels[c.priority] || c.priority}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <Badge variant={statusVariants[c.status]}>
                {statusLabels[c.status] || c.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">SLA</p>
              <Badge variant={
                slaStatus === "vencido" ? "danger" :
                slaStatus === "por_vencer" ? "warning" :
                slaStatus === "dentro_plazo" ? "success" : "default"
              }>
                {slaLabels[slaStatus] || slaStatus}
                {c.slaDeadline ? ` (${formatDate(c.slaDeadline)})` : ""}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Asignado</p>
              <p className="font-medium">
                {c.assignedUser?.name || c.assignedUser?.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Creado</p>
              <p className="font-medium">{formatDate(c.createdAt)}</p>
            </div>
            {c.resolvedAt && (
              <div>
                <p className="text-sm text-gray-500">Resuelto</p>
                <p className="font-medium">{formatDate(c.resolvedAt)}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Descripción</p>
            <p className="mt-1 whitespace-pre-wrap">{c.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comentarios ({c.comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {c.comments.length === 0 ? (
            <p className="text-sm text-gray-500">Sin comentarios</p>
          ) : (
            c.comments.map((comment: { id: number; comment: string; createdAt: Date; user: { id: number; name: string | null; email: string } }) => (
              <div
                key={comment.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {comment.user.name || comment.user.email}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
              </div>
            ))
          )}

          {c.status !== "CLOSED" && (
            <CommentForm caseId={c.id} />
          )}
        </CardContent>
      </Card>

      {nextStatus[c.status]?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateStatus} className="flex gap-4">
              {nextStatus[c.status].map((ns) => (
                <Button
                  key={ns}
                  type="submit"
                  variant={ns === "CLOSED" ? "secondary" : "default"}
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
