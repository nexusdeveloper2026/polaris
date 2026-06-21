import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const reportType = searchParams.get("reportType");
    const status = searchParams.get("status");
    const qualification = searchParams.get("qualification");

    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = parseInt(companyId);
    if (reportType) where.reportType = reportType;
    if (status) where.status = status;
    if (qualification) where.qualification = qualification;

    const reports = await prisma.technicalReport.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, taxId: true } },
        creator: { select: { id: true, name: true, email: true } },
        visit: { select: { id: true, type: true, scheduledDate: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al obtener inspecciones: ${message}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      visitId, companyId, branchId, reportType, inspectionTypes, title, status, qualification,
      contactName, contactPhone, contactEmail, address, city, state, gmapUrl,
      connectionType, bandwidth, powerSupply, airConditioning, airConditioningDetails, physicalSecurity,
      telecomNodes, telecomServers, telecomRacks, cablingType, fiberDistanceM, networkTopology, switchRouterDetails, upsRequirements,
      currentSystems, erpUsers, erpModules, timelineExpectations, dataMigration, trainingRequirements,
      cameraCount, cameraType, recordingHours, storageRequirements, monitoringNeeds, nightVision,
      content, findings, recommendations, justification, observations,
      blueprints, photos, equipment,
    } = body;

    if (!companyId || !inspectionTypes || !Array.isArray(inspectionTypes) || inspectionTypes.length === 0) {
      return NextResponse.json({ error: "companyId e inspectionTypes son requeridos (mínimo uno)" }, { status: 400 });
    }

    const report = await prisma.technicalReport.create({
      data: {
        visitId: visitId ? parseInt(visitId) : null,
        companyId: parseInt(companyId),
        branchId: branchId ? parseInt(branchId) : null,
        reportType,
        inspectionTypes: Array.isArray(inspectionTypes) ? JSON.stringify(inspectionTypes) : inspectionTypes || null,
        title,
        status: status || "DRAFT",
        qualification: qualification || "PENDING",
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        address: address || null,
        city: city || null,
        state: state || null,
        gmapUrl: gmapUrl || null,
        connectionType: connectionType || null,
        bandwidth: bandwidth || null,
        powerSupply: powerSupply || null,
        airConditioning: airConditioning ?? false,
        airConditioningDetails: airConditioningDetails || null,
        physicalSecurity: physicalSecurity || null,
        telecomNodes: telecomNodes ? parseInt(telecomNodes) : null,
        telecomServers: telecomServers ? parseInt(telecomServers) : null,
        telecomRacks: telecomRacks ? parseInt(telecomRacks) : null,
        cablingType: cablingType || null,
        fiberDistanceM: fiberDistanceM ? parseInt(fiberDistanceM) : null,
        networkTopology: networkTopology || null,
        switchRouterDetails: switchRouterDetails || null,
        upsRequirements: upsRequirements || null,
        currentSystems: currentSystems || null,
        erpUsers: erpUsers ? parseInt(erpUsers) : null,
        erpModules: erpModules || null,
        timelineExpectations: timelineExpectations || null,
        dataMigration: dataMigration ?? false,
        trainingRequirements: trainingRequirements || null,
        cameraCount: cameraCount ? parseInt(cameraCount) : null,
        cameraType: cameraType || null,
        recordingHours: recordingHours ? parseInt(recordingHours) : null,
        storageRequirements: storageRequirements || null,
        monitoringNeeds: monitoringNeeds || null,
        nightVision: nightVision ?? false,
        content: content || "",
        findings: findings || null,
        recommendations: recommendations || null,
        justification: justification || null,
        observations: observations || null,
        blueprints: blueprints || undefined,
        photos: photos || undefined,
        equipment: Array.isArray(equipment) ? JSON.stringify(equipment) : equipment || undefined,
        createdBy: Number((session.user as Record<string, unknown>).id),
      },
      include: {
        company: { select: { id: true, name: true, taxId: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    const userId = Number((session.user as Record<string, unknown>).id);
    logAudit({ userId, action: AUDIT_ACTIONS.CREATE, entity: AUDIT_ENTITIES.TECHNICAL_REPORT, entityId: report.id, details: { title, reportType, companyId } });

    return NextResponse.json(report, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    const code = (error as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al crear inspección: ${message} [${code}]` }, { status: 500 });
  }
}
