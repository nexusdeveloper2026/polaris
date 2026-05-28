import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;

    const sheets = await prisma.implementationSheet.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sheets);
  } catch (error) {
    console.error("Error fetching implementation sheets:", error);
    return NextResponse.json(
      { error: "Error al obtener hojas de implementación" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, financialData, products, contractTerms, notes } = body;

    if (!companyId || !financialData || !products) {
      return NextResponse.json(
        { error: "companyId, financialData y products son requeridos" },
        { status: 400 }
      );
    }

    const sheet = await prisma.implementationSheet.create({
      data: {
        companyId,
        financialData,
        products,
        contractTerms: contractTerms || undefined,
        notes: notes || null,
        createdBy: (session.user as any).id,
      },
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(sheet, { status: 201 });
  } catch (error) {
    console.error("Error creating implementation sheet:", error);
    return NextResponse.json(
      { error: "Error al crear hoja de implementación" },
      { status: 500 }
    );
  }
}
