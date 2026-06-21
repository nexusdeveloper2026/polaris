import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(roles);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const existing = await prisma.role.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: "El nombre del perfil ya existe" }, { status: 409 });
    }

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions: permissions || null,
      },
    });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.CREATE, entity: AUDIT_ENTITIES.ROLE, entityId: role.id, details: { name: role.name } });

    return NextResponse.json(role, { status: 201 });
  } catch (err: any) {
    console.error("=== ERROR CREANDO PERFIL ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al crear el perfil: ${err?.message || "Error desconocido"}${err?.code ? ` [${err.code}]` : ""}` }, { status: 500 });
  }
}
