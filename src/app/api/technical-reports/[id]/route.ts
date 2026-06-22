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
        branch: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
        visit: { select: { id: true, type: true, scheduledDate: true, notes: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Inspección no encontrada" }, { status: 404 });
    }

    const jsonFields = ["equipment", "blueprints", "photos", "videos", "documents"] as const;
    for (const field of jsonFields) {
      const val = report[field];
      if (typeof val === "string") {
        try { (report as Record<string, unknown>)[field] = JSON.parse(val); } catch {}
      }
    }

    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al obtener inspección: ${message}` }, { status: 500 });
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
      visitId, companyId, branchId, reportType, inspectionTypes, title, status, qualification,
      contactName, contactPhone, contactEmail, address, city, state, gmapUrl,
      connectionType, bandwidth, speedDownload, speedUpload, speedLatency, speedConnectionType, speedIsp, speedIp, powerSupply, airConditioning, airConditioningDetails, physicalSecurity,
      telecomNodes, telecomServers, telecomRacks, cablingType, fiberDistanceM, networkTopology, switchRouterDetails, upsRequirements,
      currentSystems, erpUsers, erpModules, timelineExpectations, dataMigration, trainingRequirements,
      swDevType, swDevPlatform, swDevFeatures, swDevUserRoles, swDevIntegrations, swDevHosting, swDevDomain, swDevSSL, swDevDatabase, swDevDesignReqs, swDevMobileResponsive, swDevBranding, swDevSecurityReqs, swDevAuthType, swDevVersionControl, swDevCICD, swDevTesting, swDevBudget, swDevMaintenance, swDevDocumentation, swDevAdditionalNotes,
      secExistingSystem, secType, secCameraCount, secCameraType, secCameraResolution, secCameraBrand, secCameraCondition, secDvrNvrType, secDvrNvrBrand, secStorageDays, secCablingType, secPowerSupply, secMonitoringLocation, secAreasToCover, secAreasCovered, secBlindSpots, secNightVision, secRemoteAccess, secAlarmIntegration, secAccessControl, secAdditionalNotes,
      cameraCount, cameraType, recordingHours, storageRequirements, monitoringNeeds, nightVision,
      content, findings, recommendations, justification, observations,
      blueprints, photos, videos, documents, equipment,
      technicianSignature, clientSignature,
      clientName, clientDocType, clientDocNumber, clientPosition,
      technicianSignatureLocked, clientSignatureLocked,
    } = body;

    const report = await prisma.technicalReport.update({
      where: { id: parseInt(id) },
      data: {
        ...(visitId !== undefined ? { visitId: visitId ? parseInt(visitId) : null } : {}),
        ...(companyId !== undefined ? { companyId: parseInt(companyId) } : {}),
        ...(branchId !== undefined ? { branchId: branchId ? parseInt(branchId) : null } : {}),
        ...(reportType !== undefined ? { reportType } : {}),
        ...(inspectionTypes !== undefined ? { inspectionTypes: Array.isArray(inspectionTypes) ? JSON.stringify(inspectionTypes) : inspectionTypes || null } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(qualification !== undefined ? { qualification } : {}),
        ...(contactName !== undefined ? { contactName: contactName || null } : {}),
        ...(contactPhone !== undefined ? { contactPhone: contactPhone || null } : {}),
        ...(contactEmail !== undefined ? { contactEmail: contactEmail || null } : {}),
        ...(address !== undefined ? { address: address || null } : {}),
        ...(city !== undefined ? { city: city || null } : {}),
        ...(state !== undefined ? { state: state || null } : {}),
        ...(gmapUrl !== undefined ? { gmapUrl: gmapUrl || null } : {}),
        ...(connectionType !== undefined ? { connectionType: connectionType || null } : {}),
        ...(bandwidth !== undefined ? { bandwidth: bandwidth || null } : {}),
        ...(speedDownload !== undefined ? { speedDownload: speedDownload || null } : {}),
        ...(speedUpload !== undefined ? { speedUpload: speedUpload || null } : {}),
        ...(speedLatency !== undefined ? { speedLatency: speedLatency || null } : {}),
        ...(speedConnectionType !== undefined ? { speedConnectionType: speedConnectionType || null } : {}),
        ...(speedIsp !== undefined ? { speedIsp: speedIsp || null } : {}),
        ...(speedIp !== undefined ? { speedIp: speedIp || null } : {}),
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
        ...(swDevType !== undefined ? { swDevType: swDevType || null } : {}),
        ...(swDevPlatform !== undefined ? { swDevPlatform: swDevPlatform || null } : {}),
        ...(swDevFeatures !== undefined ? { swDevFeatures: swDevFeatures || null } : {}),
        ...(swDevUserRoles !== undefined ? { swDevUserRoles: swDevUserRoles || null } : {}),
        ...(swDevIntegrations !== undefined ? { swDevIntegrations: swDevIntegrations || null } : {}),
        ...(swDevHosting !== undefined ? { swDevHosting: swDevHosting || null } : {}),
        ...(swDevDomain !== undefined ? { swDevDomain: swDevDomain || null } : {}),
        ...(swDevSSL !== undefined ? { swDevSSL: swDevSSL ?? false } : {}),
        ...(swDevDatabase !== undefined ? { swDevDatabase: swDevDatabase || null } : {}),
        ...(swDevDesignReqs !== undefined ? { swDevDesignReqs: swDevDesignReqs || null } : {}),
        ...(swDevMobileResponsive !== undefined ? { swDevMobileResponsive: swDevMobileResponsive ?? false } : {}),
        ...(swDevBranding !== undefined ? { swDevBranding: swDevBranding ?? false } : {}),
        ...(swDevSecurityReqs !== undefined ? { swDevSecurityReqs: swDevSecurityReqs || null } : {}),
        ...(swDevAuthType !== undefined ? { swDevAuthType: swDevAuthType || null } : {}),
        ...(swDevVersionControl !== undefined ? { swDevVersionControl: swDevVersionControl || null } : {}),
        ...(swDevCICD !== undefined ? { swDevCICD: swDevCICD ?? false } : {}),
        ...(swDevTesting !== undefined ? { swDevTesting: swDevTesting || null } : {}),
        ...(swDevBudget !== undefined ? { swDevBudget: swDevBudget || null } : {}),
        ...(swDevMaintenance !== undefined ? { swDevMaintenance: swDevMaintenance || null } : {}),
        ...(swDevDocumentation !== undefined ? { swDevDocumentation: swDevDocumentation || null } : {}),
        ...(swDevAdditionalNotes !== undefined ? { swDevAdditionalNotes: swDevAdditionalNotes || null } : {}),
        ...(secExistingSystem !== undefined ? { secExistingSystem: secExistingSystem || null } : {}),
        ...(secType !== undefined ? { secType: secType || null } : {}),
        ...(secCameraCount !== undefined ? { secCameraCount: secCameraCount ? parseInt(String(secCameraCount)) : null } : {}),
        ...(secCameraType !== undefined ? { secCameraType: secCameraType || null } : {}),
        ...(secCameraResolution !== undefined ? { secCameraResolution: secCameraResolution || null } : {}),
        ...(secCameraBrand !== undefined ? { secCameraBrand: secCameraBrand || null } : {}),
        ...(secCameraCondition !== undefined ? { secCameraCondition: secCameraCondition || null } : {}),
        ...(secDvrNvrType !== undefined ? { secDvrNvrType: secDvrNvrType || null } : {}),
        ...(secDvrNvrBrand !== undefined ? { secDvrNvrBrand: secDvrNvrBrand || null } : {}),
        ...(secStorageDays !== undefined ? { secStorageDays: secStorageDays ? parseInt(String(secStorageDays)) : null } : {}),
        ...(secCablingType !== undefined ? { secCablingType: secCablingType || null } : {}),
        ...(secPowerSupply !== undefined ? { secPowerSupply: secPowerSupply || null } : {}),
        ...(secMonitoringLocation !== undefined ? { secMonitoringLocation: secMonitoringLocation || null } : {}),
        ...(secAreasToCover !== undefined ? { secAreasToCover: secAreasToCover || null } : {}),
        ...(secAreasCovered !== undefined ? { secAreasCovered: secAreasCovered || null } : {}),
        ...(secBlindSpots !== undefined ? { secBlindSpots: secBlindSpots || null } : {}),
        ...(secNightVision !== undefined ? { secNightVision: secNightVision ?? false } : {}),
        ...(secRemoteAccess !== undefined ? { secRemoteAccess: secRemoteAccess ?? false } : {}),
        ...(secAlarmIntegration !== undefined ? { secAlarmIntegration: secAlarmIntegration ?? false } : {}),
        ...(secAccessControl !== undefined ? { secAccessControl: secAccessControl ?? false } : {}),
        ...(secAdditionalNotes !== undefined ? { secAdditionalNotes: secAdditionalNotes || null } : {}),
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
        ...(videos !== undefined ? { videos: videos || undefined } : {}),
        ...(documents !== undefined ? { documents: documents || undefined } : {}),
        ...(equipment !== undefined ? { equipment: equipment || undefined } : {}),
        ...(technicianSignature !== undefined ? { technicianSignature: technicianSignature || null } : {}),
        ...(clientSignature !== undefined ? { clientSignature: clientSignature || null } : {}),
        ...(clientName !== undefined ? { clientName: clientName || null } : {}),
        ...(clientDocType !== undefined ? { clientDocType: clientDocType || null } : {}),
        ...(clientDocNumber !== undefined ? { clientDocNumber: clientDocNumber || null } : {}),
        ...(clientPosition !== undefined ? { clientPosition: clientPosition || null } : {}),
        ...(technicianSignatureLocked !== undefined ? { technicianSignatureLocked: technicianSignatureLocked ?? false } : {}),
        ...(clientSignatureLocked !== undefined ? { clientSignatureLocked: clientSignatureLocked ?? false } : {}),
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
    return NextResponse.json({ error: `Error al actualizar inspección: ${message} [${code}]` }, { status: 500 });
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

    return NextResponse.json({ message: "Inspección eliminada" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    const code = (error as { code?: string })?.code || "";
    return NextResponse.json({ error: `Error al eliminar inspección: ${message} [${code}]` }, { status: 500 });
  }
}
