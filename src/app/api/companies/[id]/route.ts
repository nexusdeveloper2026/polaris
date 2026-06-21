import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = parseInt((await params).id);

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
        include: { license: { include: { product: true } }, branch: true },
        orderBy: { assignedAt: "desc" },
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

  const id = parseInt((await params).id);

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, taxIdType, taxId, address, state, municipality, parish, localidad, phone, email, website, type, parentId, notes, isActive, salesRepId, economicActivity } = body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const parsedParentId = parentId !== undefined && parentId !== null ? parseInt(parentId) : undefined;

    if (taxId !== undefined) {
      const currentCompany = await prisma.company.findUnique({ where: { id } });
      if (type === "BRANCH" || currentCompany?.type === "BRANCH") {
        const effectiveParentId = parsedParentId !== undefined ? parsedParentId : currentCompany?.parentId;
        if (effectiveParentId && effectiveParentId !== id) {
          const duplicate = await prisma.company.findFirst({
            where: { taxId, type: "MAIN", id: { not: effectiveParentId } },
          });
          if (duplicate) {
            return NextResponse.json({ error: "El Nro. de Identificación ya existe en otra empresa principal" }, { status: 409 });
          }
        }
      } else {
        const duplicate = await prisma.company.findFirst({
          where: { taxId, type: "MAIN", id: { not: id } },
        });
        if (duplicate) {
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

    const parsedSalesRepId = salesRepId !== undefined && salesRepId !== null ? parseInt(salesRepId) : undefined;

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(taxIdType !== undefined && { taxIdType }),
        ...(taxId !== undefined && { taxId: taxId?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(state !== undefined && { state: state?.trim() || null }),
        ...(municipality !== undefined && { municipality: municipality?.trim() || null }),
        ...(parish !== undefined && { parish: parish?.trim() || null }),
        ...(localidad !== undefined && { localidad: localidad?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(website !== undefined && { website: website?.trim() || null }),
        ...(type !== undefined && { type }),
        ...(parsedParentId !== undefined && { parentId: parsedParentId || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
        ...(parsedSalesRepId !== undefined && { salesRepId: parsedSalesRepId || null }),
        ...(economicActivity !== undefined && { economicActivity: economicActivity?.trim() || null }),
      },
    });

    if (existing.type === "MAIN" && (taxIdType !== undefined || taxId !== undefined)) {
      await prisma.company.updateMany({
        where: { parentId: id },
        data: {
          ...(taxIdType !== undefined && { taxIdType }),
          ...(taxId !== undefined && { taxId: taxId?.trim() || null }),
        },
      });
    }

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.UPDATE, entity: AUDIT_ENTITIES.COMPANY, entityId: company.id, details: { name: company.name } });

    return NextResponse.json(company);
  } catch (err: any) {
    console.error("=== ERROR ACTUALIZANDO EMPRESA ===");
    console.error("Mensaje:", err?.message);
    console.error("Código:", err?.code);
    console.error("Meta:", JSON.stringify(err?.meta, null, 2));
    console.error("Stack:", err?.stack);
    const detail = err?.message || "Error desconocido del servidor";
    const prismaCode = err?.code ? ` [${err.code}]` : "";
    return NextResponse.json({ error: `Error al actualizar la empresa: ${detail}${prismaCode}` }, { status: 500 });
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

  const existing = await prisma.company.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          branches: true,
          contacts: true,
          licenseCompanies: true,
          clientProducts: true,
          visits: true,
          supportCases: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  if (existing.type === "MAIN" && existing._count.branches > 0) {
    return NextResponse.json(
      { error: "Esta empresa no puede ser eliminada por tener sucursales asociadas" },
      { status: 400 }
    );
  }

  const relations = existing._count.contacts + existing._count.licenseCompanies + existing._count.clientProducts + existing._count.visits + existing._count.supportCases;
  if (relations > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: la empresa tiene ${relations} registro(s) asociado(s). Elimina primero los contactos, licencias, productos, visitas o casos de soporte.` },
      { status: 400 }
    );
  }

  await prisma.company.delete({ where: { id } });

  const userId = Number(session.user.id);
  logAudit({ userId, action: AUDIT_ACTIONS.DELETE, entity: AUDIT_ENTITIES.COMPANY, entityId: id, details: { name: existing.name } });

  return NextResponse.json({ message: "Empresa eliminada correctamente" });
}
