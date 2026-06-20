"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Info, CheckCircle2, AlertTriangle, XCircle, Bell, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Alert = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

const typeIcons: Record<string, React.ReactNode> = {
  INFO: <Info className="h-5 w-5 text-blue-500" />,
  SUCCESS: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  WARNING: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  ERROR: <XCircle className="h-5 w-5 text-red-500" />,
  LICENSE_EXPIRING: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  SUPPORT_CASE: <XCircle className="h-5 w-5 text-red-500" />,
  VISIT_SCHEDULED: <Info className="h-5 w-5 text-blue-500" />,
};

export function AlertList({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        toast.success("Alerta eliminada");
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeleting(null);
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
        toast.success("Todas marcadas como leídas");
      }
    } catch {
      toast.error("Error de conexión");
    }
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-navy-400 dark:text-white/30">
            <Bell className="h-12 w-12 mb-3" />
            <p className="text-sm">No hay alertas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`transition-all duration-300 hover:shadow-md ${alert.isRead ? "opacity-60" : ""}`}>
          <CardHeader className="flex flex-row items-start gap-3 pb-2">
            <span className="mt-0.5">{typeIcons[alert.type] || <Bell className="h-5 w-5 text-navy-400" />}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-navy-900">{alert.title}</CardTitle>
                {!alert.isRead && <Badge variant="primary">Nueva</Badge>}
              </div>
              <CardDescription className="text-xs text-navy-400">{formatDate(alert.createdAt)}</CardDescription>
            </div>
            <button
              onClick={() => handleDelete(alert.id)}
              disabled={deleting === alert.id}
              className="p-1.5 rounded-lg text-navy-400 hover:text-red-600 hover:bg-red-50 dark:text-white/40 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
              title="Eliminar alerta"
            >
              {deleting === alert.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </CardHeader>
          <CardContent className="pb-4 text-sm text-navy-600">{alert.message}</CardContent>
        </Card>
      ))}
    </div>
  );
}
