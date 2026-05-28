import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const license = await prisma.license.findUnique({
    where: { id },
    include: { company: true, branch: true, product: { include: { category: true } } },
  });

  if (!license) {
    return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  }

  return NextResponse.json(license);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.license.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const {
    companyId, branchId, productId, startDate, endDate, maxUsers, status, notes,
    licenseId, name, costUSD, supportHours, freeDays,
    discountPercent, allowedTechnicalVisits,
    additionalTechHourValue, additionalTrainingPerPerson,
  } = body;

  if (licenseId && licenseId !== existing.licenseId) {
    const dup = await prisma.license.findUnique({ where: { licenseId } });
    if (dup) {
      return NextResponse.json({ error: "El ID de licencia ya existe" }, { status: 409 });
    }
  }

  const data: Record<string, unknown> = {};
  if (companyId !== undefined) data.companyId = companyId;
  if (branchId !== undefined) data.branchId = branchId || null;
  if (productId !== undefined) data.productId = productId;
  if (startDate !== undefined) data.startDate = new Date(startDate);
  if (endDate !== undefined) data.endDate = new Date(endDate);
  if (maxUsers !== undefined) data.maxUsers = parseInt(maxUsers);
  if (status !== undefined) data.status = status;
  if (notes !== undefined) data.notes = notes;
  if (licenseId !== undefined) data.licenseId = licenseId || null;
  if (name !== undefined) data.name = name || null;
  if (costUSD !== undefined) data.costUSD = costUSD ? parseFloat(costUSD) : null;
  if (supportHours !== undefined) data.supportHours = parseInt(supportHours);
  if (freeDays !== undefined) data.freeDays = parseInt(freeDays);
  if (discountPercent !== undefined) data.discountPercent = discountPercent ? parseFloat(discountPercent) : null;
  if (allowedTechnicalVisits !== undefined) data.allowedTechnicalVisits = parseInt(allowedTechnicalVisits);
  if (additionalTechHourValue !== undefined) data.additionalTechHourValue = additionalTechHourValue ? parseFloat(additionalTechHourValue) : null;
  if (additionalTrainingPerPerson !== undefined) data.additionalTrainingPerPerson = additionalTrainingPerPerson ? parseFloat(additionalTrainingPerPerson) : null;

  const license = await prisma.license.update({
    where: { id },
    data,
    include: { company: true, product: true, branch: true },
  });

  return NextResponse.json(license);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const existing = await prisma.license.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  }

  const license = await prisma.license.update({
    where: { id },
    data: { status },
    include: { company: true, product: true, branch: true },
  });

  return NextResponse.json(license);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.license.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  }

  await prisma.license.delete({ where: { id } });
  return NextResponse.json({ message: "Licencia eliminada" });
}
