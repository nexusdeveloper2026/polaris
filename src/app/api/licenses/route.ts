import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateLicenseKey } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const status = searchParams.get("status");

  const licenses = await prisma.license.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: { company: true, product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(licenses);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { companyId, productId, startDate, endDate, maxUsers, notes } = body;

  if (!companyId || !productId || !startDate || !endDate) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const license = await prisma.license.create({
    data: {
      companyId,
      productId,
      licenseKey: generateLicenseKey(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxUsers: maxUsers ? parseInt(maxUsers) : 1,
      notes,
    },
    include: { company: true, product: true },
  });

  return NextResponse.json(license, { status: 201 });
}
