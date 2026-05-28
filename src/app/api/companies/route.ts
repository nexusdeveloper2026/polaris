import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const skip = (page - 1) * limit;

  const where: Prisma.CompanyWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { taxId: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type === "MAIN" || type === "BRANCH") {
    where.type = type;
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            contacts: true,
            licenseCompanies: true,
            clientProducts: true,
          },
        },
        parent: { select: { id: true, name: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({
    data: companies,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, taxId, address, phone, email, website, type, parentId, notes } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    if (taxId) {
      const existing = await prisma.company.findUnique({ where: { taxId } });
      if (existing) {
        return NextResponse.json({ error: "El RNC ya existe" }, { status: 409 });
      }
    }

    if (type === "BRANCH" && parentId) {
      const parent = await prisma.company.findUnique({ where: { id: parentId } });
      if (!parent || parent.type !== "MAIN") {
        return NextResponse.json({ error: "La empresa padre debe ser de tipo MAIN" }, { status: 400 });
      }
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        taxId: taxId?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        type: type || "MAIN",
        parentId: parentId || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear la empresa" }, { status: 500 });
  }
}
