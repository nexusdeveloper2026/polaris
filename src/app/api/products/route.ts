import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateDailyPrice } from "@/lib/utils";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const products = await prisma.product.findMany({
    where: categoryId ? { categoryId: parseInt(categoryId) } : undefined,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { name, description, categoryId, type, price, cost, discountPercent, ivaPercent, paymentPeriod } = body;

  if (!name || !type || price === undefined) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const priceNum = parseFloat(price) || 0;
  const costNum = parseFloat(cost) || 0;
  const iva = parseFloat(ivaPercent) || 0;
  const period = paymentPeriod || "ONE_TIME";
  const dailyPrice = calculateDailyPrice(priceNum, period);

  const product = await prisma.product.create({
    data: {
      name,
      description,
      categoryId: categoryId ? parseInt(categoryId) : null,
      type,
      cost: costNum,
      price: priceNum,
      discountPercent: parseFloat(discountPercent) || 0,
      ivaPercent: iva,
      paymentPeriod: period,
      dailyPrice,
    },
    include: { category: true },
  });

  const userId = Number(session.user.id);
  logAudit({ userId, action: AUDIT_ACTIONS.CREATE, entity: AUDIT_ENTITIES.PRODUCT, entityId: product.id, details: { name: product.name } });

  return NextResponse.json(product, { status: 201 });
}
