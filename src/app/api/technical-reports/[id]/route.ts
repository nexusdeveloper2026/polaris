import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const report = await prisma.technicalReport.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: { select: { id: true, name: true, taxId: true, taxIdType: true, address: true, phone: true, email: true, state: true, municipality: true } },
        creator: { select: { id: true, name: true, email: true } },
        visit: { select: { id: true, type: true, scheduledDate: true, notes: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Informe no encontrado" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al obtener informe: ${message}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      visitId, companyId, reportType, title, status, qualification,
      contactName, contactPhone, contactEmail, address, city, state,
      connectionType, bandwidth, powerSupply, airConditioning, airConditioningDetails, physicalSecurity,
      telecomNodes, telecomServers, telecomRacks, cablingType, fiberDistanceM, networkTopology, switchRouterDetails, upsRequirements,
      currentSystems, erpUsers, erpModules, timelineExpectations, dataMigration, trainingRequirements,
      cameraCount, cameraType, recordingHours, storageRequirements, monitoringNeeds, nightVision,
      content, findings, recommendations, justification, observations,
      blueprints, photos,
    } = body;

    const report = await prisma.technicalReport.update({
      where: { id: parseInt(id) },
      data: {
        ...(visitId !== undefined ? { visitId: visitId ? parseInt(visitId) : null } : {}),
        ...(companyId !== undefined ? { companyId: parseInt(companyId) } : {}),
        ...(reportType !== undefined ? { reportType } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(qualification !== undefined ? { qualification } : {}),
        ...(contactName !== undefined ? { contactName: contactName || null } : {}),
        ...(contactPhone !== undefined ? { contactPhone: contactPhone || null } : {}),
        ...(contactEmail !== undefined ? { contactEmail: contactEmail || null } : {}),
        ...(address !== undefined ? { address: address || null } : {}),
        ...(city !== undefined ? { city: city || null } : {}),
        ...(state !== undefined ? { state: state || null } : {}),
        ...(connectionType !== undefined ? { connectionType: connectionType || null } : {}),
        ...(bandwidth !== undefined ? { bandwidth: bandwidth || null } : {}),
        ...(powerSupply !== undefined ? { powerSupply: powerSupply || null } : {}),
        ...(airConditioning !== undefined ? { airConditioning: airConditioning ?? false } : {}),
        ...(airConditioningDetails !== undefined ? { airConditioningDetails: airConditioningDetails || null } : {}),
        ...(physicalSecurity !== undefined ? { physicalSecurity: physicalSecurity || null } : {}),
        ...(telecomNodes !== undefined ? { telecomNodes: telecomNodes ? parseInt(String(telecomNodes)) : null } : {}),
        ...(telecomServers !== undefined ? { telecomServers: telecomServers ? parseInt(String(telecomServers)) : null } : {}),
        ...(telecomRacks !== undefined ? { telecomRacks: telecomRacks ? parseInt(String(telecomRacks)) : null } : {}),
        ...(cablingType !== undefined ? { cablingType: cablingType || null } : {}),
        ...(fiberDistanceM !== undefined ? { fiberDistanceM: fiberDistanceM ? parseInt(String(fiberDistanceM)) : null } : {}),
        ...(networkTopology !== undefined ? { networkTopology: networkTopology || null } : {}),
        ...(switchRouterDetails !== undefined ? { switchRouterDetails: switchRouterDetails || null } : {}),
        ...(upsRequirements !== undefined ? { upsRequirements: upsRequirements || null } : {}),
        ...(currentSystems !== undefined ? { currentSystems: currentSystems || null } : {}),
        ...(erpUsers !== undefined ? { erpUsers: erpUsers ? parseInt(String(erpUsers)) : null } : {}),
        ...(erpModules !== undefined ? { erpModules: erpModules || null } : {}),
        ...(timelineExpectations !== undefined ? { timelineExpectations: timelineExpectations || null } : {}),
        ...(dataMigration !== undefined ? { dataMigration: dataMigration ?? false } : {}),
        ...(trainingRequirements !== undefined ? { trainingRequirements: trainingRequirements || null } : {}),
        ...(cameraCount !== undefined ? { cameraCount: cameraCount ? parseInt(String(cameraCount)) : null } : {}),
        ...(cameraType !== undefined ? { cameraType: cameraType || null } : {}),
        ...(recordingHours !== undefined ? { recordingHours: recordingHours ? parseInt(String(recordingHours)) : null } : {}),
        ...(storageRequirements !== undefined ? { storageRequirements: storageRequirements || null } : {}),
        ...(monitoringNeeds !== undefined ? { monitoringNeeds: monitoringNeeds || null } : {}),
        ...(nightVision !== undefined ? { nightVision: nightVision ?? false } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(findings !== undefined ? { findings: findings || null } : {}),
        ...(recommendations !== undefined ? { recommendations: recommendations || null } : {}),
        ...(justification !== undefined ? { justification: justification || null } : {}),
        ...(observations !== undefined ? { observations: observations || null } : {}),
        ...(blueprints !== undefined ? { blueprints: blueprints || undefined } : {}),
        ...(photos !== undefined ? { photos: photos || undefined } : {}),
      },
      include: {
        company: { select: { id: true, name: true, taxId: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    const userId = Number((session.user as Record<string, unknown>).id);
    logAudit({ userId, action: AUDIT_ACTIONS.UPDATE, entity: AUDIT_ENTITIES.TECHNICAL_REPORT, entityId: report.id, details: { title: report.title, status } });

    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    const code = (error as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al actualizar informe: ${message} [${code}]` }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const report = await prisma.technicalReport.delete({
      where: { id: parseInt(id) },
    });

    const userId = Number((session.user as Record<string, unknown>).id);
    logAudit({ userId, action: AUDIT_ACTIONS.DELETE, entity: AUDIT_ENTITIES.TECHNICAL_REPORT, entityId: report.id, details: { title: report.title } });

    return NextResponse.json({ message: "Informe eliminado" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    const code = (error as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al eliminar informe: ${message} [${code}]` }, { status: 500 });
  }
}
