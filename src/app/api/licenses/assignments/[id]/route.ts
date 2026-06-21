import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = parseInt((await params).id);
    const body = await request.json();
    const { renewalPeriod, priceOverride, supportHours, trainingSessions, status } = body;

    const existing = await prisma.licenseAssignment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (renewalPeriod !== undefined) data.renewalPeriod = renewalPeriod || null;
    if (priceOverride !== undefined) data.priceOverride = priceOverride != null && priceOverride !== "" ? parseFloat(priceOverride) : null;
    if (supportHours !== undefined) data.supportHours = supportHours != null && supportHours !== "" ? parseInt(supportHours) : 0;
    if (trainingSessions !== undefined) data.trainingSessions = trainingSessions != null && trainingSessions !== "" ? parseInt(trainingSessions) : 0;
    if (status !== undefined) data.status = status;

    const assignment = await prisma.licenseAssignment.update({
      where: { id },
      data,
      include: {
        company: true,
        branch: true,
        license: { include: { product: true } },
      },
    });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.UPDATE, entity: AUDIT_ENTITIES.LICENSE_ASSIGNMENT, entityId: assignment.id, details: { licenseId: assignment.licenseId } });

    return NextResponse.json(assignment);
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const code = (err as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al actualizar asignación: ${detail} [${code}]` }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = parseInt((await params).id);
    const existing = await prisma.licenseAssignment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 });
    }

    await prisma.licenseAssignment.delete({ where: { id } });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.DELETE, entity: AUDIT_ENTITIES.LICENSE_ASSIGNMENT, entityId: id, details: { licenseId: existing.licenseId } });

    return NextResponse.json({ message: "Asignación eliminada" });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const code = (err as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al eliminar asignación: ${detail} [${code}]` }, { status: 500 });
  }
}
