import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    const where: Record<string, unknown> = {};
    if (assignmentId) where.assignmentId = parseInt(assignmentId);

    const payments = await prisma.licensePayment.findMany({
      where,
      include: {
        assignment: {
          include: {
            license: { include: { product: true } },
            company: true,
            branch: true,
          },
        },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const code = (err as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al obtener pagos: ${detail} [${code}]` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, paymentDate, paymentMethod, amount, renewalPeriod, renewalEndDate, reference, notes } = body;

    console.log("[LICENSE_PAYMENT] body:", JSON.stringify(body));

    if (!assignmentId || !paymentMethod || !amount || !renewalPeriod || !renewalEndDate) {
      return NextResponse.json({ error: "Faltan campos requeridos: assignmentId, paymentMethod, amount, renewalPeriod, renewalEndDate" }, { status: 400 });
    }

    const assignmentIdNum = parseInt(String(assignmentId));
    const userId = Number(session.user.id);
    const amountNum = parseFloat(String(amount));

    if (isNaN(userId) || isNaN(assignmentIdNum) || isNaN(amountNum)) {
      return NextResponse.json({ error: `Valores inválidos` }, { status: 400 });
    }

    const assignment = await prisma.licenseAssignment.findUnique({ where: { id: assignmentIdNum } });
    if (!assignment) {
      return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 });
    }

    const payment = await prisma.licensePayment.create({
      data: {
        assignmentId: assignmentIdNum,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod,
        amount: amountNum,
        renewalPeriod,
        renewalEndDate: new Date(renewalEndDate),
        reference: reference || null,
        notes: notes || null,
        createdBy: userId,
      },
      include: {
        assignment: { include: { license: { include: { product: true } }, company: true, branch: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.licenseAssignment.update({
      where: { id: assignmentIdNum },
      data: { renewalEndDate: new Date(renewalEndDate), status: "ACTIVE" },
    });

    await prisma.license.update({
      where: { id: assignment.licenseId },
      data: { endDate: new Date(renewalEndDate), status: "ACTIVE" },
    });

    await prisma.alert.deleteMany({
      where: {
        relatedEntityType: "license",
        relatedEntityId: assignment.licenseId,
      },
    });

    logAudit({ userId, action: AUDIT_ACTIONS.PAYMENT, entity: AUDIT_ENTITIES.LICENSE_PAYMENT, entityId: payment.id, details: { assignmentId: assignmentIdNum, amount: amountNum, paymentMethod } });

    console.log("[LICENSE_PAYMENT] created:", payment.id);
    return NextResponse.json(payment, { status: 201 });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const code = (err as { code?: string })?.code || "";
    console.error("[LICENSE_PAYMENT] ERROR:", detail, code, err);
    return NextResponse.json({ error: `Error al registrar pago: ${detail} [${code}]` }, { status: 500 });
  }
}
