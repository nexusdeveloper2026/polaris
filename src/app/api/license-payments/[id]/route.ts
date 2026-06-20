import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const paymentId = parseInt(id);
    if (isNaN(paymentId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const existing = await prisma.licensePayment.findUnique({ where: { id: paymentId } });
    if (!existing) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { paymentDate, paymentMethod, amount, renewalPeriod, renewalEndDate, reference, notes } = body;

    const amountNum = amount != null ? parseFloat(String(amount)) : undefined;
    if (amountNum != null && isNaN(amountNum)) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const updated = await prisma.licensePayment.update({
      where: { id: paymentId },
      data: {
        ...(paymentDate && { paymentDate: new Date(paymentDate) }),
        ...(paymentMethod && { paymentMethod }),
        ...(amountNum != null && { amount: amountNum }),
        ...(renewalPeriod && { renewalPeriod }),
        ...(renewalEndDate && { renewalEndDate: new Date(renewalEndDate) }),
        ...(reference !== undefined && { reference: reference || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: {
        assignment: { include: { license: { include: { product: true } }, company: true, branch: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    if (renewalEndDate) {
      const endDate = new Date(renewalEndDate);

      await prisma.licenseAssignment.update({
        where: { id: existing.assignmentId },
        data: { renewalEndDate: endDate, status: "ACTIVE" },
      });

      const assignment = await prisma.licenseAssignment.findUnique({
        where: { id: existing.assignmentId },
        select: { licenseId: true },
      });

      if (assignment) {
        await prisma.license.update({
          where: { id: assignment.licenseId },
          data: { endDate: endDate, status: "ACTIVE" },
        });
      }
    }

    console.log("[LICENSE_PAYMENT] updated:", paymentId);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const code = (err as { code?: string })?.code || "";
    console.error("[LICENSE_PAYMENT] PATCH ERROR:", detail, code);
    return NextResponse.json({ error: `Error al actualizar pago: ${detail} [${code}]` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const paymentId = parseInt(id);
    if (isNaN(paymentId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const existing = await prisma.licensePayment.findUnique({ where: { id: paymentId } });
    if (!existing) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    await prisma.licensePayment.delete({ where: { id: paymentId } });

    console.log("[LICENSE_PAYMENT] deleted:", paymentId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const code = (err as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al eliminar pago: ${detail} [${code}]` }, { status: 500 });
  }
}
