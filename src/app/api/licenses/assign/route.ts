import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { licenseId: licenseIdRaw, assignments, renewalPeriod } = body as {
    licenseId: number;
    assignments: {
      companyId: number;
      branchId?: number;
      priceOverride?: number | null;
      supportHours?: number | null;
      trainingSessions?: number | null;
    }[];
    renewalPeriod?: string;
  };

  if (!licenseIdRaw || !assignments || assignments.length === 0) {
    return NextResponse.json({ error: "Faltan campos requeridos: licenseId y al menos una asignación" }, { status: 400 });
  }

  const licenseId = parseInt(String(licenseIdRaw));
  const license = await prisma.license.findUnique({ where: { id: licenseId } });
  if (!license) {
    return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  }

  const created = [];
  const skipped = [];

  for (const assignment of assignments) {
    const companyId = parseInt(String(assignment.companyId));
    const branchId = assignment.branchId ? parseInt(String(assignment.branchId)) : null;

    const existing = await prisma.licenseAssignment.findFirst({
      where: {
        licenseId,
        companyId,
        branchId: branchId || null,
      },
    });

    if (existing) {
      skipped.push({ companyId, branchId: branchId || null, reason: "Ya asignada" });
      continue;
    }

    const newAssignment = await prisma.licenseAssignment.create({
      data: {
        licenseId,
        companyId,
        branchId: branchId || null,
        status: "ACTIVE",
        renewalPeriod: (renewalPeriod as never) || null,
        priceOverride: assignment.priceOverride != null ? assignment.priceOverride : null,
        supportHours: assignment.supportHours != null ? assignment.supportHours : 0,
        trainingSessions: assignment.trainingSessions != null ? assignment.trainingSessions : 0,
      },
      include: {
        company: true,
        branch: true,
        license: true,
      },
    });

    created.push(newAssignment);
  }

  const userId = Number(session.user.id);
  for (const a of created) {
    logAudit({ userId, action: AUDIT_ACTIONS.ASSIGN, entity: AUDIT_ENTITIES.LICENSE_ASSIGNMENT, entityId: a.id, details: { licenseId, companyId: a.companyId } });
  }

  return NextResponse.json({
    created: created.length,
    skipped: skipped.length,
    skippedDetails: skipped,
    assignments: created,
  }, { status: 201 });
}
