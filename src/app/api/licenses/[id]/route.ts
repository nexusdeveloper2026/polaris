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

  const id = parseInt((await params).id);
  const license = await prisma.license.findUnique({
    where: { id },
    include: {
      product: { include: { category: true } },
      assignments: {
        include: {
          company: true,
          branch: true,
        },
      },
    },
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

  const id = parseInt((await params).id);
  const existing = await prisma.license.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const {
    productId, startDate, endDate, maxUsers, status, notes,
    licenseId, name, costUSD, supportHours, freeDays,
    discountPercent, allowedTechnicalVisits,
    additionalTechHourValue, additionalTrainingPerPerson,
    licenseType, version, edition, maxActivations, usedActivations,
    autoRenew, renewalDate, renewalPeriod, lastActivatedAt, lastUsedAt,
    purchaseDate, vendor, purchaseOrderNumber,
  } = body;

  if (licenseId && licenseId !== existing.licenseId) {
    const dup = await prisma.license.findUnique({ where: { licenseId } });
    if (dup) {
      return NextResponse.json({ error: "El ID de licencia ya existe" }, { status: 409 });
    }
  }

  const data: Record<string, unknown> = {};
  if (productId !== undefined) data.productId = parseInt(productId);
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
  if (licenseType !== undefined) data.licenseType = licenseType;
  if (version !== undefined) data.version = version || null;
  if (edition !== undefined) data.edition = edition || null;
  if (maxActivations !== undefined) data.maxActivations = parseInt(maxActivations);
  if (usedActivations !== undefined) data.usedActivations = parseInt(usedActivations);
  if (autoRenew !== undefined) data.autoRenew = autoRenew;
  if (renewalDate !== undefined) data.renewalDate = renewalDate ? new Date(renewalDate) : null;
  if (renewalPeriod !== undefined) data.renewalPeriod = renewalPeriod || null;
  if (lastActivatedAt !== undefined) data.lastActivatedAt = lastActivatedAt ? new Date(lastActivatedAt) : null;
  if (lastUsedAt !== undefined) data.lastUsedAt = lastUsedAt ? new Date(lastUsedAt) : null;
  if (purchaseDate !== undefined) data.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
  if (vendor !== undefined) data.vendor = vendor || null;
  if (purchaseOrderNumber !== undefined) data.purchaseOrderNumber = purchaseOrderNumber || null;

  const license = await prisma.license.update({
    where: { id },
    data,
    include: {
      product: true,
      assignments: { include: { company: true, branch: true } },
    },
  });

  return NextResponse.json(license);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = parseInt((await params).id);
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "El campo status es requerido" }, { status: 400 });
    }

    const validStatuses = ["ACTIVE", "EXPIRED", "SUSPENDED", "CANCELLED", "PENDING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Status inválido: ${status}. Valores permitidos: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const existing = await prisma.license.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
    }

    const license = await prisma.license.update({
      where: { id },
      data: { status },
      include: {
        product: true,
        assignments: { include: { company: true, branch: true } },
      },
    });

    return NextResponse.json(license);
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const code = (err as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al cambiar estado: ${detail} [${code}]` }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = parseInt((await params).id);
  const existing = await prisma.license.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  }

  await prisma.license.delete({ where: { id } });
  return NextResponse.json({ message: "Licencia eliminada" });
}
