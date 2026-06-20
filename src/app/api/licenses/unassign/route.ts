import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { assignmentId, licenseId, companyId, branchId } = body as {
    assignmentId?: number;
    licenseId?: number;
    companyId?: number;
    branchId?: number;
  };

  if (assignmentId) {
    const parsedAssignmentId = parseInt(String(assignmentId));
    const existing = await prisma.licenseAssignment.findUnique({ where: { id: parsedAssignmentId } });
    if (!existing) {
      return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 });
    }
    await prisma.licenseAssignment.delete({ where: { id: parsedAssignmentId } });
    return NextResponse.json({ message: "Asignación eliminada" });
  }

  if (!licenseId || !companyId) {
    return NextResponse.json({ error: "Faltan campos requeridos: licenseId y companyId" }, { status: 400 });
  }

  const parsedLicenseId = parseInt(String(licenseId));
  const parsedCompanyId = parseInt(String(companyId));
  const parsedBranchId = branchId ? parseInt(String(branchId)) : null;

  const existing = await prisma.licenseAssignment.findFirst({
    where: {
      licenseId: parsedLicenseId,
      companyId: parsedCompanyId,
      branchId: parsedBranchId || null,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 });
  }

  await prisma.licenseAssignment.delete({ where: { id: existing.id } });
  return NextResponse.json({ message: "Asignación eliminada" });
}
