import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      hasCommissions: true,
      roleId: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, email, password, roleId, hasCommissions } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y password son requeridos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        roleId: roleId || null,
        hasCommissions: hasCommissions ?? false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        hasCommissions: true,
        roleId: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    console.error("=== ERROR CREANDO USUARIO ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al crear usuario: ${err?.message || "Error desconocido"}${err?.code ? ` [${err.code}]` : ""}` }, { status: 500 });
  }
}
