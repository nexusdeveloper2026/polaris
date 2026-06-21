import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateLicenseKey } from "@/lib/utils";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const licenseType = searchParams.get("licenseType");
  const search = searchParams.get("search");
  const expiringSoon = searchParams.get("expiringSoon");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (licenseType) where.licenseType = licenseType;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { licenseKey: { contains: search, mode: "insensitive" } },
      { licenseId: { contains: search, mode: "insensitive" } },
      { vendor: { contains: search, mode: "insensitive" } },
      { product: { name: { contains: search, mode: "insensitive" } } },
      { assignments: { some: { company: { name: { contains: search, mode: "insensitive" } } } } },
    ];
  }
  if (expiringSoon === "true") {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    where.endDate = { lte: thirtyDays };
    where.status = "ACTIVE";
  }

  const licenses = await prisma.license.findMany({
    where,
    include: {
      product: { include: { category: true } },
      assignments: {
        include: {
          company: true,
          branch: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(licenses);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const {
    productId, startDate, endDate, maxUsers, notes,
    licenseId, name, costUSD, supportHours, freeDays,
    discountPercent, allowedTechnicalVisits,
    additionalTechHourValue, additionalTrainingPerPerson,
    licenseType, version, edition, maxActivations, autoRenew, renewalDate,
    renewalPeriod,
    purchaseDate, vendor, purchaseOrderNumber,
  } = body;

  if (!productId || !startDate || !endDate) {
    return NextResponse.json({ error: "Faltan campos requeridos: productId, startDate, endDate" }, { status: 400 });
  }

  if (licenseId) {
    const existing = await prisma.license.findUnique({ where: { licenseId } });
    if (existing) {
      return NextResponse.json({ error: "El ID de licencia ya existe" }, { status: 409 });
    }
  }

  const license = await prisma.license.create({
    data: {
      productId: parseInt(productId),
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
      licenseType: licenseType || "SUBSCRIPTION",
      version: version || null,
      edition: edition || null,
      maxActivations: maxActivations ? parseInt(maxActivations) : 1,
      usedActivations: 0,
      autoRenew: autoRenew || false,
      renewalDate: renewalDate ? new Date(renewalDate) : null,
      renewalPeriod: renewalPeriod || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      vendor: vendor || null,
      purchaseOrderNumber: purchaseOrderNumber || null,
    },
    include: {
      product: true,
      assignments: { include: { company: true, branch: true } },
    },
  });

  const userId = Number(session.user.id);
  logAudit({ userId, action: AUDIT_ACTIONS.CREATE, entity: AUDIT_ENTITIES.LICENSE, entityId: license.id, details: { name: license.name } });

  return NextResponse.json(license, { status: 201 });
}
