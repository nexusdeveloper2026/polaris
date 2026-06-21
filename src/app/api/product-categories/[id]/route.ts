import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const id = parseInt((await params).id);
    const body = await request.json();
    const { name, description, isActive } = body;

    const existing = await prisma.productCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.UPDATE, entity: AUDIT_ENTITIES.PRODUCT_CATEGORY, entityId: category.id, details: { name: category.name } });

    return NextResponse.json(category);
  } catch (err: any) {
    console.error("=== ERROR ACTUALIZANDO CATEGORÍA ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al actualizar categoría: ${err?.message}` }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const id = parseInt((await params).id);

    const existing = await prisma.productCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json({ error: `No se puede eliminar: la categoría tiene ${existing._count.products} producto(s) asociado(s).` }, { status: 400 });
    }

    await prisma.productCategory.delete({ where: { id } });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.DELETE, entity: AUDIT_ENTITIES.PRODUCT_CATEGORY, entityId: id, details: { name: existing.name } });

    return NextResponse.json({ message: "Categoría eliminada correctamente" });
  } catch (err: any) {
    console.error("=== ERROR ELIMINANDO CATEGORÍA ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al eliminar categoría: ${err?.message}` }, { status: 500 });
  }
}
