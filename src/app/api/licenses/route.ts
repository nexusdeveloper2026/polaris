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
    include: { company: true, product: true, branch: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(licenses);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const {
    companyId, branchId, productId, startDate, endDate, maxUsers, notes,
    licenseId, name, costUSD, supportHours, freeDays,
    discountPercent, allowedTechnicalVisits,
    additionalTechHourValue, additionalTrainingPerPerson,
  } = body;

  if (!companyId || !productId || !startDate || !endDate) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (licenseId) {
    const existing = await prisma.license.findUnique({ where: { licenseId } });
    if (existing) {
      return NextResponse.json({ error: "El ID de licencia ya existe" }, { status: 409 });
    }
  }

  const license = await prisma.license.create({
    data: {
      companyId,
      branchId: branchId || null,
      productId,
      licenseKey: generateLicenseKey(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxUsers: maxUsers ? parseInt(maxUsers) : 1,
      notes,
      licenseId: licenseId || null,
      name: name || null,
      costUSD: costUSD ? parseFloat(costUSD) : null,
      supportHours: supportHours ? parseInt(supportHours) : 0,
      freeDays: freeDays ? parseInt(freeDays) : 0,
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      allowedTechnicalVisits: allowedTechnicalVisits ? parseInt(allowedTechnicalVisits) : 0,
      additionalTechHourValue: additionalTechHourValue ? parseFloat(additionalTechHourValue) : null,
      additionalTrainingPerPerson: additionalTrainingPerPerson ? parseFloat(additionalTrainingPerPerson) : null,
    },
    include: { company: true, product: true, branch: true },
  });

  return NextResponse.json(license, { status: 201 });
}
