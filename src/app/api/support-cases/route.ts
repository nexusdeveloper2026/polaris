import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

const slaHours: Record<string, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 8,
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const companyId = searchParams.get("companyId");
    const assignedTo = searchParams.get("assignedTo");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (companyId) where.companyId = parseInt(companyId);
    if (assignedTo) where.assignedTo = parseInt(assignedTo);

    const cases = await prisma.supportCase.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cases);
  } catch (error: any) {
    console.error("=== ERROR OBTENIENDO CASOS ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al obtener casos: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
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
    const {
      companyId,
      contactId,
      subject,
      description,
      priority,
      assignedTo,
    } = body;

    if (!companyId || !subject || !description) {
      return NextResponse.json(
        { error: "companyId, subject y description son requeridos" },
        { status: 400 }
      );
    }

    const p = priority || "LOW";
    const hours = slaHours[p] || 72;
    const slaDeadline = new Date(Date.now() + hours * 3600000);

    const supportCase = await prisma.supportCase.create({
      data: {
        companyId: parseInt(companyId),
        contactId: contactId ? parseInt(contactId) : null,
        subject,
        description,
        priority: p,
        status: "OPEN",
        slaDeadline,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.CREATE, entity: AUDIT_ENTITIES.SUPPORT_CASE, entityId: supportCase.id });

    return NextResponse.json(supportCase, { status: 201 });
  } catch (error: any) {
    console.error("=== ERROR CREANDO CASO ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al crear caso: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
      { status: 500 }
    );
  }
}
