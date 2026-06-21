import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = parseInt(companyId);

    const sheets = await prisma.implementationSheet.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sheets);
  } catch (error: any) {
    console.error("=== ERROR OBTENIENDO HOJAS DE IMPLEMENTACIÓN ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al obtener hojas de implementación: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, financialData, products, contractTerms, notes } = body;

    if (!companyId || !financialData || !products) {
      return NextResponse.json(
        { error: "companyId, financialData y products son requeridos" },
        { status: 400 }
      );
    }

    const sheet = await prisma.implementationSheet.create({
      data: {
        companyId: parseInt(companyId),
        financialData,
        products,
        contractTerms: contractTerms || undefined,
        notes: notes || null,
        createdBy: parseInt(String((session.user as any).id)),
      },
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    const userId = Number((session.user as any).id);
    logAudit({ userId, action: AUDIT_ACTIONS.CREATE, entity: AUDIT_ENTITIES.IMPLEMENTATION_SHEET, entityId: sheet.id });

    return NextResponse.json(sheet, { status: 201 });
  } catch (error: any) {
    console.error("=== ERROR CREANDO HOJA DE IMPLEMENTACIÓN ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al crear hoja de implementación: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
      { status: 500 }
    );
  }
}
