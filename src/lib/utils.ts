import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
  }).format(new Date(date));
}

export function formatCurrency(amount: number | string | { toNumber: () => number }): string {
  const value = typeof amount === "object" && "toNumber" in amount ? amount.toNumber() : Number(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function getSlaStatus(deadline: Date | null | undefined): string {
  if (!deadline) return "sin_sla";
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff < 0) return "vencido";
  if (diff < 3600000 * 4) return "por_vencer";
  return "dentro_plazo";
}

export const PERIOD_DAYS: Record<string, number> = {
  ONE_TIME: 0,
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
  BIMONTHLY: 60,
  QUARTERLY: 90,
  SEMI_ANNUAL: 180,
  ANNUAL: 365,
  OTHER: 30,
};

export function calculateDailyPrice(price: number, paymentPeriod: string): number {
  const days = PERIOD_DAYS[paymentPeriod] || 30;
  return days > 0 ? price / days : 0;
}

export function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let seg = "";
    for (let i = 0; i < 4; i++) {
      seg += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(seg);
  }
  return segments.join("-");
}
