import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { caseId, comment } = body;

    if (!caseId || !comment) {
      return NextResponse.json(
        { error: "caseId y comment son requeridos" },
        { status: 400 }
      );
    }

    const parsedCaseId = parseInt(caseId);

    const existing = await prisma.supportCase.findUnique({
      where: { id: parsedCaseId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    const userId = parseInt(String(session.user.id));

    const created = await prisma.supportCaseComment.create({
      data: {
        caseId: parsedCaseId,
        userId,
        comment,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("=== ERROR CREANDO COMENTARIO ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al crear comentario: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
      { status: 500 }
    );
  }
}
