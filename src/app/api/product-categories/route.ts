import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const categories = await prisma.productCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const existing = await prisma.productCategory.findFirst({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    }

    const category = await prisma.productCategory.create({
      data: { name: name.trim(), description: description?.trim() || null },
    });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.CREATE, entity: AUDIT_ENTITIES.PRODUCT_CATEGORY, entityId: category.id, details: { name: category.name } });

    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    console.error("=== ERROR CREANDO CATEGORÍA ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al crear categoría: ${err?.message || "Error desconocido"}${err?.code ? ` [${err.code}]` : ""}` }, { status: 500 });
  }
}
