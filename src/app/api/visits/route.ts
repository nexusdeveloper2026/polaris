import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const companyId = searchParams.get("companyId");
    const assignedTo = searchParams.get("assignedTo");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (companyId) where.companyId = companyId;
    if (assignedTo) where.assignedTo = assignedTo;

    const visits = await prisma.visit.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Error al obtener visitas" },
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
    const { companyId, contactId, type, scheduledDate, assignedTo, notes } = body;

    if (!companyId || !type || !scheduledDate) {
      return NextResponse.json(
        { error: "companyId, type y scheduledDate son requeridos" },
        { status: 400 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        companyId,
        contactId: contactId || null,
        type,
        scheduledDate: new Date(scheduledDate),
        assignedTo: assignedTo || null,
        notes: notes || null,
        status: "SCHEDULED",
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Error al crear visita" },
      { status: 500 }
    );
  }
}
