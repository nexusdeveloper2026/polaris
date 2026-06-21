import { prisma } from "./db";

interface AuditLogParams {
  userId: number;
  action: string;
  entity: string;
  entityId?: number;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyJson = any;

export async function logAudit(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        ...(params.entityId != null ? { entityId: params.entityId } : {}),
        ...(params.details != null ? { details: params.details as AnyJson } : {}),
        ...(params.ipAddress != null ? { ipAddress: params.ipAddress } : {}),
        ...(params.userAgent != null ? { userAgent: params.userAgent } : {}),
      },
    });
  } catch (err) {
    console.error("[AUDIT] Error logging:", err);
  }
}

export const AUDIT_ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",
  ASSIGN: "ASSIGN",
  UNASSIGN: "UNASSIGN",
  PAYMENT: "PAYMENT",
  STATUS_CHANGE: "STATUS_CHANGE",
  WIPE: "WIPE",
  RESTORE: "RESTORE",
  BACKUP: "BACKUP",
} as const;

export const AUDIT_ENTITIES = {
  USER: "user",
  COMPANY: "company",
  PRODUCT: "product",
  PRODUCT_CATEGORY: "productCategory",
  LICENSE: "license",
  LICENSE_ASSIGNMENT: "licenseAssignment",
  LICENSE_PAYMENT: "licensePayment",
  VISIT: "visit",
  SUPPORT_CASE: "supportCase",
  TRANSFER: "transfer",
  ALERT: "alert",
  TECHNICAL_REPORT: "technicalReport",
  IMPLEMENTATION_SHEET: "implementationSheet",
  ROLE: "role",
  CONTACT: "contact",
  AUTH: "auth",
  BACKUP: "backup",
} as const;
