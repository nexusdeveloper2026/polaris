import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const transfers = await prisma.transfer.findMany({
    include: {
      user: true,
      approvedBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(transfers);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { userId, fromLocation, toLocation, transferDate, reason } = body;

  if (!userId || !fromLocation || !toLocation || !transferDate || !reason) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const transfer = await prisma.transfer.create({
    data: {
      userId: parseInt(userId),
      fromLocation,
      toLocation,
      transferDate: new Date(transferDate),
      reason,
    },
    include: {
      user: true,
      approvedBy: true,
    },
  });

  return NextResponse.json(transfer, { status: 201 });
}
