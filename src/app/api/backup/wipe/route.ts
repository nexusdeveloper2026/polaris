import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    if (body.confirm !== "ELIMINAR_TODO") {
      return NextResponse.json({ error: "Confirmación requerida" }, { status: 400 });
    }

    const adminEmail = "admin@admin.com";
    const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!adminUser) {
      return NextResponse.json({ error: "Usuario admin no encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.alert.deleteMany();
      await tx.technicalReport.deleteMany();
      await tx.implementationSheet.deleteMany();
      await tx.supportCaseComment.deleteMany();
      await tx.supportCase.deleteMany();
      await tx.transfer.deleteMany();
      await tx.visit.deleteMany();
      await tx.licensePayment.deleteMany();
      await tx.licenseAssignment.deleteMany();
      await tx.license.deleteMany();
      await tx.clientProduct.deleteMany();
      await tx.contact.deleteMany();
      await tx.product.deleteMany();
      await tx.productCategory.deleteMany();
      await tx.company.deleteMany();
      await tx.session.deleteMany();
      await tx.account.deleteMany();
      await tx.user.deleteMany({ where: { email: { not: adminEmail } } });
    });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.WIPE, entity: AUDIT_ENTITIES.BACKUP });

    console.log("[WIPE] Database wiped, admin preserved:", adminEmail);
    return NextResponse.json({
      message: "Base de datos eliminada. Solo se conservó el usuario admin.",
      preserved: adminEmail,
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const code = (err as { code?: string })?.code || "";
    console.error("[WIPE] ERROR:", detail, code);
    return NextResponse.json({ error: `Error al eliminar datos: ${detail} [${code}]` }, { status: 500 });
  }
}
