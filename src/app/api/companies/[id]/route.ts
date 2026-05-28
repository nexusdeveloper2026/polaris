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

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      branches: { select: { id: true, name: true, type: true } },
      contacts: { orderBy: { isPrimary: "desc" } },
      clientProducts: {
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
      },
      licenseCompanies: {
        include: { product: true },
        orderBy: { createdAt: "desc" },
      },
      visits: {
        include: { contact: true, assignedUser: { select: { id: true, name: true } } },
        orderBy: { scheduledDate: "desc" },
      },
      _count: {
        select: {
          contacts: true,
          licenseCompanies: true,
          clientProducts: true,
          visits: true,
          supportCases: true,
        },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  return NextResponse.json(company);
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

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, taxId, address, phone, email, website, type, parentId, notes, isActive } = body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    if (taxId !== undefined) {
      const duplicate = await prisma.company.findFirst({
        where: { taxId, id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "El RNC ya existe" }, { status: 409 });
      }
    }

    if (type === "BRANCH" && parentId) {
      const parent = await prisma.company.findUnique({ where: { id: parentId } });
      if (!parent || parent.type !== "MAIN") {
        return NextResponse.json({ error: "La empresa padre debe ser de tipo MAIN" }, { status: 400 });
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(taxId !== undefined && { taxId: taxId?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(website !== undefined && { website: website?.trim() || null }),
        ...(type !== undefined && { type }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: "Error al actualizar la empresa" }, { status: 500 });
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

  const { id } = await params;

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  await prisma.company.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ message: "Empresa desactivada correctamente" });
}
