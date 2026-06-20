import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const roleId = searchParams.get("roleId") || "";
  const isActive = searchParams.get("isActive") || "";
  const state = searchParams.get("state") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (roleId) {
    where.roleId = parseInt(roleId);
  }

  if (isActive === "true") {
    where.isActive = true;
  } else if (isActive === "false") {
    where.isActive = false;
  }

  if (state) {
    where.state = state;
  }

  const users = await prisma.user.findMany({
    where,
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, email, password, roleId, hasCommissions, docType, docNumber, position, state, fullAddress } = body;

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
        roleId: roleId ? parseInt(roleId) : null,
        hasCommissions: hasCommissions ?? false,
        docType: docType?.trim() || null,
        docNumber: docNumber?.trim() || null,
        position: position?.trim() || null,
        state: state?.trim() || null,
        fullAddress: fullAddress?.trim() || null,
      },
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
        role: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    console.error("=== ERROR CREANDO USUARIO ===", err?.message, err?.code);
    return NextResponse.json({ error: `Error al crear usuario: ${err?.message || "Error desconocido"}${err?.code ? ` [${err.code}]` : ""}` }, { status: 500 });
  }
}
