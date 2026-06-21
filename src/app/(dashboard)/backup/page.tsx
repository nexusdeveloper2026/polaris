"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";
import {
  Download, Upload, Trash2, Loader2, Database, Shield,
  AlertTriangle, X, HardDrive, RotateCcw
} from "lucide-react";

export default function BackupPage() {
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleBackup() {
    setLoadingBackup(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Error al generar backup");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexus-polaris-${new Date().toISOString().split("T")[0]}.backup`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup descargado correctamente");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error: ${msg}`);
    } finally {
      setLoadingBackup(false);
    }
  }

  async function handleRestore() {
    if (!selectedFile) {
      toast.error("Selecciona un archivo .backup");
      return;
    }
    setLoadingRestore(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast.success("Base de datos restaurada correctamente");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        window.location.reload();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Error al restaurar");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error: ${msg}`);
    } finally {
      setLoadingRestore(false);
    }
  }

  async function handleWipe() {
    if (wipeConfirm !== "ELIMINAR_TODO") return;
    setWiping(true);
    try {
      const res = await fetch("/api/backup/wipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "ELIMINAR_TODO" }),
      });
      if (res.ok) {
        toast.success("Base de datos eliminada. Solo se conservó admin@admin.com");
        setShowWipeModal(false);
        setWipeConfirm("");
        window.location.reload();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Error al eliminar");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error: ${msg}`);
    } finally {
      setWiping(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup y Mantenimiento"
        subtitle="Exportar, restaurar y gestión de la base de datos"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Backup Card */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Crear Backup</CardTitle>
                <p className="text-xs text-navy-400 dark:text-white/40">Exportar base de datos completa</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-navy-600 dark:text-white/60">
              Genera un archivo <code className="font-mono text-xs bg-navy-100 px-1 rounded dark:bg-white/10">.backup</code> con
              pg_dump que contiene la base de datos completa y puede restaurarse con psql.
            </p>
            <Button onClick={handleBackup} disabled={loadingBackup} className="w-full gap-2">
              {loadingBackup ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {loadingBackup ? "Generando backup..." : "Descargar Backup"}
            </Button>
          </CardContent>
        </Card>

        {/* Restore Card */}
        <Card className="animate-fade-in-up border-amber-100 dark:border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <RotateCcw className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Restaurar Backup</CardTitle>
                <p className="text-xs text-navy-400 dark:text-white/40">Reemplazar BD con archivo .backup</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Esto reemplazará TODA la base de datos actual con el contenido del archivo.
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".backup,.sql,.dump"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full gap-2 border-amber-200 hover:bg-amber-50 dark:border-amber-500/30 dark:hover:bg-amber-500/5"
            >
              <Upload className="h-4 w-4" />
              Seleccionar Archivo
            </Button>
            {selectedFile && (
              <p className="text-xs text-navy-500 dark:text-white/50 text-center">
                {selectedFile.name}
              </p>
            )}
            <Button
              onClick={handleRestore}
              disabled={loadingRestore || !selectedFile}
              className="w-full gap-2"
            >
              {loadingRestore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {loadingRestore ? "Restaurando..." : "Restaurar"}
            </Button>
          </CardContent>
        </Card>

        {/* Wipe Card */}
        <Card className="animate-fade-in-up border-red-100 dark:border-red-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-700 dark:text-red-400">Limpiar BD</CardTitle>
                <p className="text-xs text-navy-400 dark:text-white/40">Eliminar todos los datos</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400">
                  Elimina todos los datos excepto el usuario admin@admin.com. Irreversible.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowWipeModal(true)}
              className="w-full gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar Datos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wipe Confirmation Modal */}
      {showWipeModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowWipeModal(false); setWipeConfirm(""); }} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-500/30 dark:bg-navy-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Eliminar Base de Datos</h3>
                  <p className="text-sm text-navy-400 dark:text-white/40">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button onClick={() => { setShowWipeModal(false); setWipeConfirm(""); }} className="text-navy-400 hover:text-navy-600 dark:text-white/40 dark:hover:text-white/60">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/5">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Se eliminarán:</p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  <li>• Todas las empresas y contactos</li>
                  <li>• Todos los productos y categorías</li>
                  <li>• Todas las licencias y asignaciones</li>
                  <li>• Todos los usuarios (excepto admin@admin.com)</li>
                  <li>• Todos los casos de soporte y comentarios</li>
                  <li>• Todas las visitas y traslados</li>
                  <li>• Todos los reportes y fichas</li>
                  <li>• Todas las alertas</li>
                </ul>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Se conservará:</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  • Usuario admin@admin.com<br />
                  • Roles del sistema
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">
                  Escribe <span className="font-bold text-red-600">ELIMINAR_TODO</span> para confirmar:
                </label>
                <Input
                  value={wipeConfirm}
                  onChange={(e) => setWipeConfirm(e.target.value)}
                  className="h-9 text-sm border-red-200 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/30"
                  placeholder="ELIMINAR_TODO"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => { setShowWipeModal(false); setWipeConfirm(""); }} className="h-9">
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleWipe}
                disabled={wiping || wipeConfirm !== "ELIMINAR_TODO"}
                className="h-9 gap-1.5"
              >
                {wiping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {wiping ? "Eliminando..." : "Eliminar Todo"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
