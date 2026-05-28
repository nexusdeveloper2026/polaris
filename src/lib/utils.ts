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
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
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
