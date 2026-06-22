import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number((session.user as Record<string, unknown>).id) },
    select: { name: true, docType: true, docNumber: true, email: true },
  });

  return NextResponse.json(user);
}
