import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
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

  try {
    const id = parseInt((await params).id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        hasCommissions: true,
        docType: true,
        docNumber: true,
        position: true,
        state: true,
        fullAddress: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error("=== ERROR OBTENIENDO USUARIO ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al obtener usuario: ${err?.message}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const id = parseInt((await params).id);
    const body = await request.json();
    const { name, email, password, roleId, isActive, hasCommissions, docType, docNumber, position, state, fullAddress } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (email && email !== existing.email) {
      const duplicate = await prisma.user.findUnique({ where: { email } });
      if (duplicate) {
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
      }
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (roleId !== undefined) data.roleId = roleId ? parseInt(roleId) : null;
    if (isActive !== undefined) data.isActive = isActive;
    if (hasCommissions !== undefined) data.hasCommissions = hasCommissions;
    if (docType !== undefined) data.docType = docType?.trim() || null;
    if (docNumber !== undefined) data.docNumber = docNumber?.trim() || null;
    if (position !== undefined) data.position = position?.trim() || null;
    if (state !== undefined) data.state = state?.trim() || null;
    if (fullAddress !== undefined) data.fullAddress = fullAddress?.trim() || null;
    if (password) data.password = await hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        hasCommissions: true,
        docType: true,
        docNumber: true,
        position: true,
        state: true,
        fullAddress: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
      },
    });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.UPDATE, entity: AUDIT_ENTITIES.USER, entityId: user.id, details: { name: user.name, email: user.email } });

    return NextResponse.json(user);
  } catch (err: any) {
    console.error("=== ERROR ACTUALIZANDO USUARIO ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al actualizar usuario: ${err?.message}` }, { status: 500 });
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

  try {
    const id = parseInt((await params).id);
    const sessionUserId = parseInt(String((session.user as any).id));

    if (id === sessionUserId) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 409 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.DELETE, entity: AUDIT_ENTITIES.USER, entityId: id, details: { name: existing.name, email: existing.email } });

    return NextResponse.json({ message: "Usuario eliminado" });
  } catch (err: any) {
    console.error("=== ERROR ELIMINANDO USUARIO ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al eliminar usuario: ${err?.message}` }, { status: 500 });
  }
}
