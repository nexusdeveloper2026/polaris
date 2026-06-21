"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";
import {
  Loader2, Save, ArrowLeft, Building2, Wifi, Server, Camera,
  FileText, Upload, X, Plus, Network, Shield, Cpu,
} from "lucide-react";

type Company = { id: number; name: string; taxId: string | null };

type ReportData = {
  id?: number;
  companyId: string;
  reportType: string;
  title: string;
  status: string;
  qualification: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  city: string;
  state: string;
  connectionType: string;
  bandwidth: string;
  powerSupply: string;
  airConditioning: boolean;
  airConditioningDetails: string;
  physicalSecurity: string;
  telecomNodes: string;
  telecomServers: string;
  telecomRacks: string;
  cablingType: string;
  fiberDistanceM: string;
  networkTopology: string;
  switchRouterDetails: string;
  upsRequirements: string;
  currentSystems: string;
  erpUsers: string;
  erpModules: string;
  timelineExpectations: string;
  dataMigration: boolean;
  trainingRequirements: string;
  cameraCount: string;
  cameraType: string;
  recordingHours: string;
  storageRequirements: string;
  monitoringNeeds: string;
  nightVision: boolean;
  content: string;
  findings: string;
  recommendations: string;
  justification: string;
  observations: string;
  blueprints: { name: string; url: string; size: number; type: string }[];
  photos: { name: string; url: string; size: number; type: string }[];
};

const initialData: ReportData = {
  companyId: "",
  reportType: "TELECOM_NETWORK",
  title: "",
  status: "DRAFT",
  qualification: "PENDING",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  address: "",
  city: "",
  state: "",
  connectionType: "",
  bandwidth: "",
  powerSupply: "",
  airConditioning: false,
  airConditioningDetails: "",
  physicalSecurity: "",
  telecomNodes: "",
  telecomServers: "",
  telecomRacks: "",
  cablingType: "",
  fiberDistanceM: "",
  networkTopology: "",
  switchRouterDetails: "",
  upsRequirements: "",
  currentSystems: "",
  erpUsers: "",
  erpModules: "",
  timelineExpectations: "",
  dataMigration: false,
  trainingRequirements: "",
  cameraCount: "",
  cameraType: "",
  recordingHours: "",
  storageRequirements: "",
  monitoringNeeds: "",
  nightVision: false,
  content: "",
  findings: "",
  recommendations: "",
  justification: "",
  observations: "",
  blueprints: [],
  photos: [],
};

function SectionTitle({ icon: Icon, title }: { icon: typeof FileText; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-navy-100 pb-2 dark:border-white/[0.06]">
      <Icon className="h-4 w-4 text-blue-500" />
      <h3 className="text-sm font-semibold text-navy-900 dark:text-white">{title}</h3>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function TechnicalReportForm({ existingData }: { existingData?: ReportData & { id: number } }) {
  const router = useRouter();
  const isEdit = !!existingData;
  const [data, setData] = useState<ReportData>(existingData || initialData);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/companies?limit=200").then((r) => r.json()).then((json) => setCompanies(json.data || json));
  }, []);

  function update<K extends keyof ReportData>(key: K, value: ReportData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(files: FileList | null, field: "blueprints" | "photos") {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { files: uploaded } = await res.json();
        update(field, [...(data[field] as { name: string; url: string; size: number; type: string }[]), ...uploaded]);
        toast.success(`${files.length} archivo(s) subido(s)`);
      } else {
        toast.error("Error al subir archivos");
      }
    } finally {
      setUploading(false);
    }
  }

  function removeFile(field: "blueprints" | "photos", index: number) {
    update(field, (data[field] as { name: string; url: string; size: number; type: string }[]).filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!data.companyId || !data.title || !data.reportType) {
      toast.error("Empresa, título y tipo son requeridos");
      return;
    }
    setLoading(true);
    try {
      const url = isEdit ? `/api/technical-reports/${existingData.id}` : "/api/technical-reports";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const report = await res.json();
        toast.success(isEdit ? "Informe actualizado" : "Informe creado");
        router.push(`/technical-reports/${report.id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al guardar");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "h-9 rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white";
  const selectClass = "h-9 rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white";
  const textareaClass = "rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white min-h-[80px] resize-y";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar Informe" : "Nuevo Informe Técnico"}
        subtitle="Levantamiento de información en campo"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdit ? "Actualizar" : "Crear Informe"}
            </Button>
          </div>
        }
      />

      {/* Basic Info */}
      <Card className="animate-fade-in-up">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={FileText} title="Información General" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Empresa *">
              <Select value={data.companyId} onChange={(e) => update("companyId", e.target.value)} className={selectClass}>
                <option value="">Seleccionar empresa</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Tipo de Informe *">
              <Select value={data.reportType} onChange={(e) => update("reportType", e.target.value)} className={selectClass}>
                <option value="TELECOM_NETWORK">Red Telecomunicaciones</option>
                <option value="ERP_INSTALLATION">Instalación ERP</option>
                <option value="SECURITY_CAMERAS">Cámaras Seguridad</option>
              </Select>
            </Field>
            <Field label="Título *">
              <Input value={data.title} onChange={(e) => update("title", e.target.value)} placeholder="Ej: Visita técnica - Empresa XYZ" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Estado">
              <Select value={data.status} onChange={(e) => update("status", e.target.value)} className={selectClass}>
                <option value="DRAFT">Borrador</option>
                <option value="SUBMITTED">Enviado</option>
                <option value="UNDER_REVIEW">En Revisión</option>
                <option value="APPROVED">Aprobado</option>
                <option value="REJECTED">Rechazado</option>
              </Select>
            </Field>
            <Field label="Cualificación">
              <Select value={data.qualification} onChange={(e) => update("qualification", e.target.value)} className={selectClass}>
                <option value="PENDING">Pendiente</option>
                <option value="APPLIES">Aplica para instalación</option>
                <option value="DOES_NOT_APPLY">No aplica para instalación</option>
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Location */}
      <Card className="animate-fade-in-up animate-delay-1">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Building2} title="Contacto y Ubicación" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Nombre del Contacto">
              <Input value={data.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Nombre completo" className={inputClass} />
            </Field>
            <Field label="Teléfono">
              <Input value={data.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="0414-1234567" className={inputClass} />
            </Field>
            <Field label="Email">
              <Input value={data.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="contacto@empresa.com" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Dirección" className="md:col-span-2">
              <Input value={data.address} onChange={(e) => update("address", e.target.value)} placeholder="Calle, número, urbanización" className={inputClass} />
            </Field>
            <Field label="Ciudad">
              <Input value={data.city} onChange={(e) => update("city", e.target.value)} placeholder="Ciudad" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Estado">
              <Input value={data.state} onChange={(e) => update("state", e.target.value)} placeholder="Estado" className={inputClass} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure */}
      <Card className="animate-fade-in-up animate-delay-2">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Wifi} title="Infraestructura General" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Tipo de Conexión">
              <Select value={data.connectionType} onChange={(e) => update("connectionType", e.target.value)} className={selectClass}>
                <option value="">No especificado</option>
                <option value="FIBER">Fibra Óptica</option>
                <option value="COAXIAL">Coaxial</option>
                <option value="DSL">DSL</option>
                <option value="SATELLITE">Satelital</option>
                <option value="MICROWAVE">Microondas</option>
                <option value="OTHER">Otro</option>
              </Select>
            </Field>
            <Field label="Ancho de Banda">
              <Input value={data.bandwidth} onChange={(e) => update("bandwidth", e.target.value)} placeholder="Ej: 100 Mbps" className={inputClass} />
            </Field>
            <Field label="Suministro Eléctrico">
              <Select value={data.powerSupply} onChange={(e) => update("powerSupply", e.target.value)} className={selectClass}>
                <option value="">No especificado</option>
                <option value="STABLE">Estable</option>
                <option value="UNSTABLE">Inestable</option>
                <option value="BACKUP">Con respaldo (UPS/gerador)</option>
                <option value="NONE">Sin respaldo</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="ac" checked={data.airConditioning} onChange={(e) => update("airConditioning", e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="ac" className="text-sm text-navy-700 dark:text-white/70">Aire Acondicionado</label>
            </div>
            {data.airConditioning && (
              <Field label="Detalles AC">
                <Input value={data.airConditioningDetails} onChange={(e) => update("airConditioningDetails", e.target.value)} placeholder="BTU, marca, estado" className={inputClass} />
              </Field>
            )}
          </div>
          <Field label="Seguridad Física">
            <textarea value={data.physicalSecurity} onChange={(e) => update("physicalSecurity", e.target.value)} placeholder="Control de acceso, vigilancia, cerraduras..." className={textareaClass} />
          </Field>
        </CardContent>
      </Card>

      {/* Telecom Network - Conditional */}
      {data.reportType === "TELECOM_NETWORK" && (
        <Card className="animate-fade-in-up animate-delay-3">
          <CardContent className="space-y-4 py-5">
            <SectionTitle icon={Network} title="Red de Telecomunicaciones" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Field label="Nodos">
                <Input type="number" value={data.telecomNodes} onChange={(e) => update("telecomNodes", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Servidores">
                <Input type="number" value={data.telecomServers} onChange={(e) => update("telecomServers", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Racks">
                <Input type="number" value={data.telecomRacks} onChange={(e) => update("telecomRacks", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Distancia Fibra (m)">
                <Input type="number" value={data.fiberDistanceM} onChange={(e) => update("fiberDistanceM", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Tipo de Cableado">
                <Select value={data.cablingType} onChange={(e) => update("cablingType", e.target.value)} className={selectClass}>
                  <option value="">No especificado</option>
                  <option value="CAT5">CAT5</option>
                  <option value="CAT6">CAT6</option>
                  <option value="CAT6A">CAT6A</option>
                  <option value="FIBER_OPTIC">Fibra Óptica</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </Field>
              <Field label="Topología de Red">
                <Select value={data.networkTopology} onChange={(e) => update("networkTopology", e.target.value)} className={selectClass}>
                  <option value="">No especificado</option>
                  <option value="STAR">Estrella</option>
                  <option value="RING">Anillo</option>
                  <option value="MESH">Malla</option>
                  <option value="TREE">Árbol</option>
                  <option value="HYBRID">Híbrida</option>
                </Select>
              </Field>
            </div>
            <Field label="Detalles Switch/Router">
              <textarea value={data.switchRouterDetails} onChange={(e) => update("switchRouterDetails", e.target.value)} placeholder="Modelos, puertos, configuración..." className={textareaClass} />
            </Field>
            <Field label="Requisitos UPS">
              <textarea value={data.upsRequirements} onChange={(e) => update("upsRequirements", e.target.value)} placeholder="Capacidad, autonomía, marca..." className={textareaClass} />
            </Field>
          </CardContent>
        </Card>
      )}

      {/* ERP Installation - Conditional */}
      {data.reportType === "ERP_INSTALLATION" && (
        <Card className="animate-fade-in-up animate-delay-3">
          <CardContent className="space-y-4 py-5">
            <SectionTitle icon={Server} title="Instalación ERP" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Sistemas Actuales">
                <textarea value={data.currentSystems} onChange={(e) => update("currentSystems", e.target.value)} placeholder="Software actual, planillas, contabilidad..." className={textareaClass} />
              </Field>
              <Field label="Módulos Necesarios">
                <textarea value={data.erpModules} onChange={(e) => update("erpModules", e.target.value)} placeholder="Inventario, contabilidad, RRHH, ventas..." className={textareaClass} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Cantidad de Usuarios">
                <Input type="number" value={data.erpUsers} onChange={(e) => update("erpUsers", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Expectativa de Tiempo">
                <Input value={data.timelineExpectations} onChange={(e) => update("timelineExpectations", e.target.value)} placeholder="Ej: 3 meses" className={inputClass} />
              </Field>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="migration" checked={data.dataMigration} onChange={(e) => update("dataMigration", e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="migration" className="text-sm text-navy-700 dark:text-white/70">Requiere Migración de Datos</label>
              </div>
            </div>
            <Field label="Requisitos de Capacitación">
              <textarea value={data.trainingRequirements} onChange={(e) => update("trainingRequirements", e.target.value)} placeholder="Áreas, usuarios, horarios..." className={textareaClass} />
            </Field>
          </CardContent>
        </Card>
      )}

      {/* Security Cameras - Conditional */}
      {data.reportType === "SECURITY_CAMERAS" && (
        <Card className="animate-fade-in-up animate-delay-3">
          <CardContent className="space-y-4 py-5">
            <SectionTitle icon={Camera} title="Cámaras de Seguridad" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Field label="Cantidad de Cámaras">
                <Input type="number" value={data.cameraCount} onChange={(e) => update("cameraCount", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Tipo de Cámara">
                <Select value={data.cameraType} onChange={(e) => update("cameraType", e.target.value)} className={selectClass}>
                  <option value="">No especificado</option>
                  <option value="DOME">Domo</option>
                  <option value="BULLET">Bala</option>
                  <option value="PTZ">PTZ</option>
                  <option value="TURRET">Torreta</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </Field>
              <Field label="Horas de Grabación">
                <Input type="number" value={data.recordingHours} onChange={(e) => update("recordingHours", e.target.value)} placeholder="24" className={inputClass} />
              </Field>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="night" checked={data.nightVision} onChange={(e) => update("nightVision", e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="night" className="text-sm text-navy-700 dark:text-white/70">Visión Nocturna</label>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Requisitos de Almacenamiento">
                <textarea value={data.storageRequirements} onChange={(e) => update("storageRequirements", e.target.value)} placeholder="TB necesarios, tipo de grabación..." className={textareaClass} />
              </Field>
              <Field label="Necesidades de Monitoreo">
                <textarea value={data.monitoringNeeds} onChange={(e) => update("monitoringNeeds", e.target.value)} placeholder="Monitoreo remoto, central, móvil..." className={textareaClass} />
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description & Findings */}
      <Card className="animate-fade-in-up animate-delay-4">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Cpu} title="Descripción y Hallazgos" />
          <Field label="Descripción del Informe">
            <textarea value={data.content} onChange={(e) => update("content", e.target.value)} placeholder="Descripción general del levantamiento..." className={textareaClass + " min-h-[120px]"} />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Hallazgos">
              <textarea value={data.findings} onChange={(e) => update("findings", e.target.value)} placeholder="Observaciones del levantamiento..." className={textareaClass} />
            </Field>
            <Field label="Recomendaciones">
              <textarea value={data.recommendations} onChange={(e) => update("recommendations", e.target.value)} placeholder="Recomendaciones técnicas..." className={textareaClass} />
            </Field>
          </div>
          <Field label="Justificación (No Aplica)">
            <textarea value={data.justification} onChange={(e) => update("justification", e.target.value)} placeholder="Si no aplica, indicar por qué..." className={textareaClass} />
          </Field>
          <Field label="Observaciones Adicionales">
            <textarea value={data.observations} onChange={(e) => update("observations", e.target.value)} placeholder="Notas adicionales..." className={textareaClass} />
          </Field>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card className="animate-fade-in-up animate-delay-5">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Upload} title="Archivos Adjuntos" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-2">Planos y Diagramas</label>
              <div className="rounded-xl border-2 border-dashed border-navy-200 p-4 text-center transition-colors hover:border-blue-400 dark:border-white/10">
                <Upload className="mx-auto h-8 w-8 text-navy-300 dark:text-white/20" />
                <p className="mt-1 text-xs text-navy-400 dark:text-white/30">Arrastra o selecciona archivos</p>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf" onChange={(e) => handleUpload(e.target.files, "blueprints")} className="absolute inset-0 cursor-pointer opacity-0" />
                <Button variant="outline" size="sm" className="mt-2" onClick={() => document.querySelector<HTMLInputElement>('[data-upload="blueprints"]')?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}Seleccionar
                </Button>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf" data-upload="blueprints" onChange={(e) => handleUpload(e.target.files, "blueprints")} className="hidden" />
              </div>
              {data.blueprints.length > 0 && (
                <div className="mt-2 space-y-1">
                  {data.blueprints.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-1.5 dark:bg-white/5">
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline dark:text-blue-400 truncate max-w-[200px]">{f.name}</a>
                      <button onClick={() => removeFile("blueprints", i)} className="ml-2 text-navy-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-2">Fotos del Sitio</label>
              <div className="rounded-xl border-2 border-dashed border-navy-200 p-4 text-center transition-colors hover:border-blue-400 dark:border-white/10">
                <Upload className="mx-auto h-8 w-8 text-navy-300 dark:text-white/20" />
                <p className="mt-1 text-xs text-navy-400 dark:text-white/30">Arrastra o selecciona imágenes</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => document.querySelector<HTMLInputElement>('[data-upload="photos"]')?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}Seleccionar
                </Button>
                <input type="file" multiple accept="image/*" data-upload="photos" onChange={(e) => handleUpload(e.target.files, "photos")} className="hidden" />
              </div>
              {data.photos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {data.photos.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-1.5 dark:bg-white/5">
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline dark:text-blue-400 truncate max-w-[200px]">{f.name}</a>
                      <button onClick={() => removeFile("photos", i)} className="ml-2 text-navy-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isEdit ? "Actualizar Informe" : "Crear Informe"}
        </Button>
      </div>
    </div>
  );
}
