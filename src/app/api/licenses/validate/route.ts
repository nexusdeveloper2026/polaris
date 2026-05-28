import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { licenseKey } = await request.json();

  if (!licenseKey) {
    return NextResponse.json({ error: "licenseKey es requerido" }, { status: 400 });
  }

  const license = await prisma.license.findUnique({
    where: { licenseKey },
    include: { company: true, product: true },
  });

  if (!license) {
    return NextResponse.json({ valid: false, message: "Licencia no encontrada" });
  }

  if (license.status !== "ACTIVE") {
    return NextResponse.json({ valid: false, message: "Licencia no está activa" });
  }

  if (new Date() > license.endDate) {
    return NextResponse.json({ valid: false, message: "Licencia expirada" });
  }

  return NextResponse.json({ valid: true, license });
}
