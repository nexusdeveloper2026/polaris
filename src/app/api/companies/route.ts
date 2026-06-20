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
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const salesRepId = searchParams.get("salesRepId") || "";
  const economicActivity = searchParams.get("economicActivity") || "";
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

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  if (salesRepId) {
    where.salesRepId = parseInt(salesRepId);
  }

  if (economicActivity) {
    where.economicActivity = economicActivity;
  }

  if (type === "BRANCH") {
    where.type = "BRANCH";
  } else if (type === "MAIN") {
    where.type = "MAIN";
  } else if (!economicActivity) {
    where.type = "MAIN";
  }

  const isMixedQuery = !type && !!economicActivity;

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
        salesRep: { select: { name: true, email: true } },
        branches: {
          orderBy: { name: "asc" },
          include: {
            salesRep: { select: { name: true, email: true } },
            _count: {
              select: {
                contacts: true,
                licenseCompanies: true,
                clientProducts: true,
              },
            },
          },
        },
      },
    }),
    prisma.company.count({ where }),
  ]);

  const deduped = isMixedQuery
    ? companies.filter((c) => c.type !== "BRANCH" || !companies.some((p) => p.id === c.parentId))
    : companies;

  const availableActivitiesRaw = await prisma.company.findMany({
    where: { economicActivity: { not: null } },
    select: { economicActivity: true },
    distinct: ["economicActivity"],
  });
  const availableActivities = availableActivitiesRaw
    .map((c) => c.economicActivity)
    .filter((a): a is string => a !== null)
    .sort();

  return NextResponse.json({
    data: deduped,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    availableActivities,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, taxIdType, taxId, address, state, municipality, parish, localidad, phone, email, website, type, parentId, notes, salesRepId, economicActivity } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const parsedParentId = parentId !== undefined && parentId !== null ? parseInt(parentId) : null;
    const parsedSalesRepId = salesRepId !== undefined && salesRepId !== null ? parseInt(salesRepId) : null;

    if (taxId) {
      if (type === "BRANCH" && parsedParentId) {
        const parent = await prisma.company.findUnique({ where: { id: parsedParentId } });
        if (!parent) {
          return NextResponse.json({ error: "Empresa principal no encontrada" }, { status: 400 });
        }
        const duplicate = await prisma.company.findFirst({
          where: { taxId, id: { not: parsedParentId }, type: "MAIN" },
        });
        if (duplicate && duplicate.id !== parsedParentId) {
          return NextResponse.json({ error: "El Nro. de Identificación ya existe en otra empresa principal" }, { status: 409 });
        }
      } else {
        const existing = await prisma.company.findFirst({
          where: { taxId, type: "MAIN" },
        });
        if (existing) {
          return NextResponse.json({ error: "El Nro. de Identificación ya existe en otra empresa principal" }, { status: 409 });
        }
      }
    }

    if (type === "BRANCH" && parsedParentId) {
      const parent = await prisma.company.findUnique({ where: { id: parsedParentId } });
      if (!parent || parent.type !== "MAIN") {
        return NextResponse.json({ error: "La empresa padre debe ser de tipo MAIN" }, { status: 400 });
      }
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        taxIdType: taxIdType || "V",
        taxId: taxId?.trim() || null,
        address: address?.trim() || null,
        state: state?.trim() || null,
        municipality: municipality?.trim() || null,
        parish: parish?.trim() || null,
        localidad: localidad?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        type: type || "MAIN",
        parentId: parsedParentId,
        notes: notes?.trim() || null,
        salesRepId: parsedSalesRepId,
        economicActivity: economicActivity?.trim() || null,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (err: any) {
    console.error("=== ERROR CREANDO EMPRESA ===");
    console.error("Mensaje:", err?.message);
    console.error("Código:", err?.code);
    console.error("Meta:", JSON.stringify(err?.meta, null, 2));
    console.error("Stack:", err?.stack);
    const detail = err?.message || "Error desconocido del servidor";
    const prismaCode = err?.code ? ` [${err.code}]` : "";
    return NextResponse.json({ error: `Error al crear la empresa: ${detail}${prismaCode}` }, { status: 500 });
  }
}
