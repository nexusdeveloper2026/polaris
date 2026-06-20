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
    const reportType = searchParams.get("reportType");

    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = parseInt(companyId);
    if (reportType) where.reportType = reportType;

    const reports = await prisma.technicalReport.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
        visit: { select: { id: true, type: true, scheduledDate: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("=== ERROR OBTENIENDO REPORTES TÉCNICOS ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al obtener reportes técnicos: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
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
    const { visitId, companyId, reportType, title, content, findings, recommendations } = body;

    if (!companyId || !reportType || !title || !content) {
      return NextResponse.json(
        { error: "companyId, reportType, title y content son requeridos" },
        { status: 400 }
      );
    }

    const validTypes = ["ERP_INSTALLATION", "TELECOM_NETWORK", "SECURITY_CAMERAS"];
    if (!validTypes.includes(reportType)) {
      return NextResponse.json(
        { error: "Tipo de reporte inválido" },
        { status: 400 }
      );
    }

    const report = await prisma.technicalReport.create({
      data: {
        visitId: visitId ? parseInt(visitId) : null,
        companyId: parseInt(companyId),
        reportType,
        title,
        content,
        findings: findings || null,
        recommendations: recommendations || null,
        createdBy: parseInt(String((session.user as any).id)),
      },
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("=== ERROR CREANDO REPORTE TÉCNICO ===", error?.message, error?.code);
    return NextResponse.json(
      { error: `Error al crear reporte técnico: ${error?.message || "Error desconocido"}${error?.code ? ` [${error.code}]` : ""}` },
      { status: 500 }
    );
  }
}
