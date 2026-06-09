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
    const unreadOnly = searchParams.get("unreadOnly");

    const where: Record<string, unknown> = { userId: (session.user as any).id };
    if (unreadOnly === "true") where.isRead = false;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
  } catch (error: any) {
    console.error("=== ERROR OBTENIENDO ALERTAS ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al obtener alertas: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
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
    const { type, title, message, relatedEntityType, relatedEntityId, userId } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "type, title y message son requeridos" },
        { status: 400 }
      );
    }

    const alert = await prisma.alert.create({
      data: {
        type,
        title,
        message,
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
        userId: userId || (session.user as any).id,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    console.error("=== ERROR CREANDO ALERTA ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al crear alerta: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const userId = (session.user as any).id;

    if (body.markAll) {
      await prisma.alert.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "Todas las alertas marcadas como leídas" });
    }

    if (!body.id) {
      return NextResponse.json(
        { error: "id es requerido" },
        { status: 400 }
      );
    }

    const alert = await prisma.alert.updateMany({
      where: { id: body.id, userId },
      data: { isRead: true },
    });

    if (alert.count === 0) {
      return NextResponse.json(
        { error: "Alerta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Alerta marcada como leída" });
  } catch (error: any) {
    console.error("=== ERROR ACTUALIZANDO ALERTA ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al actualizar alerta: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
      { status: 500 }
    );
  }
}
