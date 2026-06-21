import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateDailyPrice } from "@/lib/utils";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const id = parseInt((await params).id);

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const id = parseInt((await params).id);
  const body = await request.json();
  const { name, description, categoryId, type, price, cost, isActive, discountPercent, ivaPercent, paymentPeriod } = body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
      ...(type !== undefined && { type }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(cost !== undefined && { cost: parseFloat(cost) || 0 }),
      ...(discountPercent !== undefined && { discountPercent: parseFloat(discountPercent) || 0 }),
      ...(ivaPercent !== undefined && { ivaPercent: parseFloat(ivaPercent) || 0 }),
      ...(isActive !== undefined && { isActive }),
      ...(paymentPeriod !== undefined && {
        paymentPeriod,
        dailyPrice: calculateDailyPrice(parseFloat(String(price ?? existing.price)) || 0, paymentPeriod),
      }),
    },
    include: { category: true },
  });

  const userId = Number(session.user.id);
  logAudit({ userId, action: AUDIT_ACTIONS.UPDATE, entity: AUDIT_ENTITIES.PRODUCT, entityId: product.id, details: { name: product.name } });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const id = parseInt((await params).id);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  const userId = Number(session.user.id);
  logAudit({ userId, action: AUDIT_ACTIONS.DELETE, entity: AUDIT_ENTITIES.PRODUCT, entityId: id, details: { name: existing.name } });

  return NextResponse.json({ message: "Producto desactivado correctamente" });
}
