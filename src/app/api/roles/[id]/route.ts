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
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!role) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json(role);
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

  try {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, permissions } = body;

    if (name) {
      const duplicate = await prisma.role.findFirst({
        where: { name: name.trim(), id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "El nombre del perfil ya existe" }, { status: 409 });
      }
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(permissions !== undefined && { permissions }),
      },
    });

    return NextResponse.json(role);
  } catch (err: any) {
    console.error("=== ERROR ACTUALIZANDO PERFIL ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al actualizar el perfil: ${err?.message || "Error desconocido"}${err?.code ? ` [${err.code}]` : ""}` }, { status: 500 });
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

  try {
    const existing = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    if (existing._count.users > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un perfil con usuarios asignados" },
        { status: 409 }
      );
    }

    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ message: "Perfil eliminado" });
  } catch (err: any) {
    console.error("=== ERROR ELIMINANDO PERFIL ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al eliminar el perfil: ${err?.message || "Error desconocido"}${err?.code ? ` [${err.code}]` : ""}` }, { status: 500 });
  }
}
