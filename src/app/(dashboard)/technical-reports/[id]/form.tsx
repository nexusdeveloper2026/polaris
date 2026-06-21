"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Loader2, Save, ArrowLeft, Building2, Wifi, Server, Camera,
  FileText, Upload, X, Plus, Network, Shield, Cpu, MapPin, Crosshair, ExternalLink, Trash2, Pencil, Eye, Code,
} from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";

type Company = { id: number; name: string; taxId: string | null };
type Branch = { id: number; name: string };

type ReportData = {
  id?: number;
  companyId: string;
  branchId: string;
  reportType: string;
  inspectionTypes: string[];
  title: string;
  status: string;
  qualification: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  city: string;
  state: string;
  gmapUrl: string;
  connectionType: string;
  bandwidth: string;
  powerSupply: string;
  airConditioning: boolean;
  airConditioningDetails: string;
  physicalSecurity: string;
  cctvExistingSystem: string;
  cctvCameraCount: string;
  cctvCameraType: string;
  cctvCameraResolution: string;
  cctvCameraBrand: string;
  cctvCameraCondition: string;
  cctvDvrNvrBrand: string;
  cctvDvrNvrChannels: string;
  cctvStorageCapacity: string;
  cctvRetentionDays: string;
  cctvCablingType: string;
  cctvCablingLength: string;
  cctvPowerSupply: string;
  cctvMonitoringLocation: string;
  cctvAreasToCover: string;
  cctvAreasCovered: string;
  cctvBlindSpots: string;
  cctvInstallationType: string;
  cctvNightVision: boolean;
  cctvRemoteAccess: boolean;
  cctvAlarmIntegration: boolean;
  cctvAccessControl: boolean;
  cctvMountingLocations: string;
  cctvLightingConditions: string;
  cctvWeatherExposure: string;
  cctvNetworkBandwidth: string;
  cctvAdditionalNotes: string;
  swDevType: string;
  swCurrentSystem: string;
  swCurrentWebsite: string;
  swCurrentApp: string;
  swCurrentSoftware: string;
  swCurrentTech: string;
  swCurrentIssues: string;
  swRequiredType: string;
  swRequiredFeatures: string;
  swRequiredModules: string;
  swTargetUsers: string;
  swUserRoles: string;
  swIntegrationNeeds: string;
  swHostingType: string;
  swDomainStatus: string;
  swDomainName: string;
  swBudget: string;
  swTimeline: string;
  swSecurityNeeds: string;
  swMaintenanceNeeds: string;
  swTrainingNeeds: string;
  swAdditionalNotes: string;
  netCurrentTopology: string;
  netCurrentBandwidth: string;
  netCurrentIsp: string;
  netCurrentRouter: string;
  netCurrentSwitch: string;
  netCurrentFirewall: string;
  netCurrentWifiAp: string;
  netCurrentCabling: string;
  netCurrentServerRoom: string;
  netCurrentIssues: string;
  netRequiredTopology: string;
  netRequiredBandwidth: string;
  netRequiredEquipment: string;
  netRequiredCabling: string;
  netRequiredSecurity: string;
  netRequiredVpn: boolean;
  netRequiredWifi: boolean;
  netRequiredVoip: boolean;
  netRequiredBackup: boolean;
  netRequiredMonitoring: boolean;
  netWifiCoverage: string;
  netWifiZones: string;
  netVlanNeeds: string;
  netRemoteAccessNeeds: string;
  netBackupStrategy: string;
  netMaintenanceNeeds: string;
  netAdditionalNotes: string;
  supType: string;
  supRemoteHours: string;
  supOnSiteHours: string;
  supScheduleDays: string;
  supScheduleTimeStart: string;
  supScheduleTimeEnd: string;
  supResponseTime: string;
  supCurrentEquipBrand: string;
  supCurrentEquipModel: string;
  supCurrentEquipQty: string;
  supCurrentEquipCondition: string;
  supCurrentEquipWarranty: string;
  supCurrentSoftware: string;
  supCurrentIssues: string;
  supRequiredServices: string;
  supRequiredCoverage: string;
  supRequiredSlA: string;
  supRequiredTraining: boolean;
  supRequiredDocumentation: boolean;
  supRequiredInventory: boolean;
  supRequiredOnSiteVisit: boolean;
  supRequiredRemoteAccess: boolean;
  supClientExpectations: string;
  supBudgetRange: string;
  supContractDuration: string;
  supAdditionalNotes: string;
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
  equipment: {
    type: string;
    applies: boolean;
    brand: string;
    model: string;
    serialNumber: string;
    quantity: string;
    condition: string;
    status: string;
    specs: string;
    posProcessor: string;
    posRam: string;
    posStorageType: string;
    posStorageCapacity: string;
    posOs: string;
    posNotes: string;
  }[];
  blueprints: { name: string; url: string; size: number; type: string }[];
  photos: { name: string; url: string; size: number; type: string }[];
};

const initialData: ReportData = {
  companyId: "",
  branchId: "",
  reportType: "",
  inspectionTypes: [],
  title: "",
  status: "DRAFT",
  qualification: "PENDING",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  address: "",
  city: "",
  state: "",
  gmapUrl: "",
  connectionType: "",
  bandwidth: "",
  powerSupply: "",
  airConditioning: false,
  airConditioningDetails: "",
  physicalSecurity: "",
  cctvExistingSystem: "",
  cctvCameraCount: "",
  cctvCameraType: "",
  cctvCameraResolution: "",
  cctvCameraBrand: "",
  cctvCameraCondition: "",
  cctvDvrNvrBrand: "",
  cctvDvrNvrChannels: "",
  cctvStorageCapacity: "",
  cctvRetentionDays: "",
  cctvCablingType: "",
  cctvCablingLength: "",
  cctvPowerSupply: "",
  cctvMonitoringLocation: "",
  cctvAreasToCover: "",
  cctvAreasCovered: "",
  cctvBlindSpots: "",
  cctvInstallationType: "",
  cctvNightVision: false,
  cctvRemoteAccess: false,
  cctvAlarmIntegration: false,
  cctvAccessControl: false,
  cctvMountingLocations: "",
  cctvLightingConditions: "",
  cctvWeatherExposure: "",
  cctvNetworkBandwidth: "",
  cctvAdditionalNotes: "",
  swDevType: "",
  swCurrentSystem: "",
  swCurrentWebsite: "",
  swCurrentApp: "",
  swCurrentSoftware: "",
  swCurrentTech: "",
  swCurrentIssues: "",
  swRequiredType: "",
  swRequiredFeatures: "",
  swRequiredModules: "",
  swTargetUsers: "",
  swUserRoles: "",
  swIntegrationNeeds: "",
  swHostingType: "",
  swDomainStatus: "",
  swDomainName: "",
  swBudget: "",
  swTimeline: "",
  swSecurityNeeds: "",
  swMaintenanceNeeds: "",
  swTrainingNeeds: "",
  swAdditionalNotes: "",
  netCurrentTopology: "",
  netCurrentBandwidth: "",
  netCurrentIsp: "",
  netCurrentRouter: "",
  netCurrentSwitch: "",
  netCurrentFirewall: "",
  netCurrentWifiAp: "",
  netCurrentCabling: "",
  netCurrentServerRoom: "",
  netCurrentIssues: "",
  netRequiredTopology: "",
  netRequiredBandwidth: "",
  netRequiredEquipment: "",
  netRequiredCabling: "",
  netRequiredSecurity: "",
  netRequiredVpn: false,
  netRequiredWifi: false,
  netRequiredVoip: false,
  netRequiredBackup: false,
  netRequiredMonitoring: false,
  netWifiCoverage: "",
  netWifiZones: "",
  netVlanNeeds: "",
  netRemoteAccessNeeds: "",
  netBackupStrategy: "",
  netMaintenanceNeeds: "",
  netAdditionalNotes: "",
  supType: "",
  supRemoteHours: "",
  supOnSiteHours: "",
  supScheduleDays: "",
  supScheduleTimeStart: "",
  supScheduleTimeEnd: "",
  supResponseTime: "",
  supCurrentEquipBrand: "",
  supCurrentEquipModel: "",
  supCurrentEquipQty: "",
  supCurrentEquipCondition: "",
  supCurrentEquipWarranty: "",
  supCurrentSoftware: "",
  supCurrentIssues: "",
  supRequiredServices: "",
  supRequiredCoverage: "",
  supRequiredSlA: "",
  supRequiredTraining: false,
  supRequiredDocumentation: false,
  supRequiredInventory: false,
  supRequiredOnSiteVisit: false,
  supRequiredRemoteAccess: false,
  supClientExpectations: "",
  supBudgetRange: "",
  supContractDuration: "",
  supAdditionalNotes: "",
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
  equipment: [],
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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companyDetails, setCompanyDetails] = useState<{ taxId: string | null; taxIdType: string | null; address: string | null; phone: string | null; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [savedEquipmentIdx, setSavedEquipmentIdx] = useState<number | null>(null);
  const [equipmentFormOpen, setEquipmentFormOpen] = useState(false);
  const [editingEquipmentIdx, setEditingEquipmentIdx] = useState<number | null>(null);
  const [newEquipment, setNewEquipment] = useState({ type: "", applies: false, brand: "", model: "", serialNumber: "", quantity: "", condition: "", status: "", specs: "", posProcessor: "", posRam: "", posStorageType: "", posStorageCapacity: "", posOs: "", posNotes: "" });
  const [speedTesting, setSpeedTesting] = useState(false);
  const [speedResult, setSpeedResult] = useState<{ download: string; upload: string; latency: string; connection: string; isp: string; ip: string } | null>(null);
  const [speedStatus, setSpeedStatus] = useState<"idle" | "success" | "error">("idle");

  async function runSpeedTest() {
    setSpeedTesting(true);
    setSpeedResult(null);
    setSpeedStatus("idle");
    try {
      const testUrl = "https://speed.cloudflare.com/__down?bytes=25000000";
      const start = performance.now();
      const res = await fetch(testUrl);
      const blob = await res.blob();
      const end = performance.now();
      const durationSec = (end - start) / 1000;
      const bitsLoaded = blob.size * 8;
      const mbps = (bitsLoaded / durationSec / 1000000).toFixed(2);
      let latency = "N/A";
      try {
        const latStart = performance.now();
        await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
        latency = Math.round(performance.now() - latStart).toString();
      } catch { latency = "N/A"; }
      const conn = (navigator as unknown as { connection?: { type?: string; effectiveType?: string } }).connection;
      const connType = conn?.type || conn?.effectiveType || "desconocido";
      const connLabel = connType === "wifi" ? "WiFi" : connType === "ethernet" ? "LAN (Cable)" : connType === "cellular" ? "Datos Móviles" : connType;
      let isp = "Desconocido";
      let ip = "N/A";
      try {
        const [traceRes, ipRes] = await Promise.all([
          fetch("https://www.cloudflare.com/cdn-cgi/trace"),
          fetch("https://api.ipify.org?format=json")
        ]);
        const traceText = await traceRes.text();
        const ipData = await ipRes.json();
        ip = ipData.ip || "N/A";
        const orgMatch = traceText.match(/org=\s*(.+)/m);
        const asnMatch = traceText.match(/asnum=\s*(.+)/m);
        isp = orgMatch?.[1]?.trim() || asnMatch?.[1]?.trim() || "Desconocido";
      } catch { /* ignore */ }
      let uploadMbps = "N/A";
      try {
        const uploadData = new Uint8Array(5000000);
        crypto.getRandomValues(uploadData);
        const upStart = performance.now();
        uploadMbps = await new Promise<string>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onload = () => {
            const upEnd = performance.now();
            const dur = (upEnd - upStart) / 1000;
            resolve(dur > 0.1 ? ((uploadData.length * 8) / dur / 1000000).toFixed(2) : "N/A");
          };
          xhr.upload.onerror = () => resolve("N/A");
          xhr.ontimeout = () => resolve("N/A");
          xhr.open("POST", "https://httpbin.org/post");
          xhr.timeout = 15000;
          xhr.send(uploadData);
        });
      } catch { uploadMbps = "N/A"; }
      setSpeedResult({ download: mbps, upload: uploadMbps, latency, connection: connLabel, isp, ip });
      const val = parseFloat(mbps);
      let auto = "";
      if (val < 1) auto = "< 1Mbps";
      else if (val < 5) auto = "1Mbps a 5Mbps";
      else if (val < 10) auto = "5Mbps a 10Mbps";
      else if (val < 50) auto = "10Mbps a 50Mbps";
      else if (val < 100) auto = "50Mbps a 100Mbps";
      else if (val < 300) auto = "100Mbps a 300Mbps";
      else auto = "> 300Mbps";
      update("bandwidth", auto);
      toast.success(`↓ ${mbps} Mbps | ↑ ${uploadMbps} Mbps | ISP: ${isp}`);
      setSpeedStatus("success");
    } catch {
      toast.error("Error al ejecutar test de velocidad");
      setSpeedStatus("error");
    } finally {
      setSpeedTesting(false);
    }
  }

  useEffect(() => {
    fetch("/api/companies?limit=200").then((r) => r.json()).then((json) => setCompanies(json.data || json));
  }, []);

  useEffect(() => {
    if (data.companyId) {
      fetch(`/api/companies/${data.companyId}/branches`)
        .then((r) => r.json())
        .then((json) => setBranches(Array.isArray(json) ? json : []))
        .catch(() => setBranches([]));
      fetch(`/api/companies/${data.companyId}`)
        .then((r) => r.json())
        .then((json) => setCompanyDetails({ taxId: json.taxId, taxIdType: json.taxIdType, address: json.address, phone: json.phone, name: json.name }))
        .catch(() => setCompanyDetails(null));
    } else {
      setBranches([]);
      setCompanyDetails(null);
    }
    if (!isEdit) setData((prev) => ({ ...prev, branchId: "" }));
  }, [data.companyId, isEdit]);

  useEffect(() => {
    if (data.branchId) {
      fetch(`/api/companies/${data.branchId}`)
        .then((r) => r.json())
        .then((json) => setCompanyDetails((prev) => prev ? { ...prev, address: json.address || prev.address, phone: json.phone || prev.phone, name: prev.name } : prev))
        .catch(() => {});
    } else if (data.companyId) {
      fetch(`/api/companies/${data.companyId}`)
        .then((r) => r.json())
        .then((json) => setCompanyDetails({ taxId: json.taxId, taxIdType: json.taxIdType, address: json.address, phone: json.phone, name: json.name }))
        .catch(() => {});
    }
  }, [data.branchId, data.companyId]);

  function update<K extends keyof ReportData>(key: K, value: ReportData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInspectionType(type: string) {
    setData((prev) => {
      const current = prev.inspectionTypes;
      const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
      return { ...prev, inspectionTypes: updated, reportType: updated[0] || "TELECOM_NETWORK" };
    });
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

  function handleGetLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada por el navegador");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const url = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
        update("gmapUrl", url);
        toast.success("Ubicación obtenida");
        setLocating(false);
      },
      () => {
        toast.error("No se pudo obtener la ubicación. Verifique los permisos del navegador.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit() {
    if (!data.companyId || data.inspectionTypes.length === 0) {
      toast.error("Seleccione empresa y al menos un tipo de inspección");
      return;
    }
    setLoading(true);
    try {
      const company = companies.find((c) => c.id === Number(data.companyId));
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
      const autoTitle = isEdit ? data.title : `Inspección - ${company?.name || "Empresa"} - ${dateStr}`;
      const payload = { ...data, inspectionTypes: data.inspectionTypes, reportType: data.inspectionTypes[0] || "TELECOM_NETWORK", branchId: data.branchId || null, title: autoTitle, status: isEdit ? data.status : "DRAFT", qualification: isEdit ? data.qualification : "PENDING" };
      const url = isEdit ? `/api/technical-reports/${existingData.id}` : "/api/technical-reports";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const report = await res.json();
        toast.success(isEdit ? "Inspección actualizada" : "Inspección creada");
        router.push(`/technical-reports/${report.id}`);
      } else {
        const err = await res.json();
        toast.error("Error al guardar inspección");
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
        title={isEdit ? "Editar Inspección" : "Nueva Inspección Técnica"}
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
      <Card className="animate-fade-in-up relative z-[50]">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={FileText} title="Información General" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Empresa *">
              <Select value={data.companyId} onChange={(e) => update("companyId", e.target.value)} className={selectClass}>
                <option value="">Seleccionar empresa</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            {branches.length > 0 && (
              <Field label="Sucursal">
                <Select value={data.branchId} onChange={(e) => update("branchId", e.target.value)} className={selectClass}>
                  <option value="">Matriz (sin sucursal)</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Select>
              </Field>
            )}
          </div>
          {companyDetails && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 rounded-xl bg-navy-50 p-4 dark:bg-white/5">
              <Field label="Identificación">
                <Input readOnly value={companyDetails.taxId ? `${companyDetails.taxIdType || "V"}-${companyDetails.taxId}` : "—"} className={inputClass + " bg-navy-100/50 dark:bg-white/10 cursor-default"} />
              </Field>
              <Field label="Dirección">
                <Input readOnly value={companyDetails.address || "—"} className={inputClass + " bg-navy-100/50 dark:bg-white/10 cursor-default"} />
              </Field>
              <Field label="Teléfono">
                <Input readOnly value={companyDetails.phone || "—"} className={inputClass + " bg-navy-100/50 dark:bg-white/10 cursor-default"} />
              </Field>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tipos de Inspección *">
              <TagInput
                options={[
                  { value: "TELECOM_NETWORK", label: "Red Telecomunicaciones" },
                  { value: "ERP_INSTALLATION", label: "Instalación ERP" },
                  { value: "SECURITY_CAMERAS", label: "Cámaras Seguridad" },
                ]}
                value={data.inspectionTypes}
                onChange={(v) => setData((prev) => ({ ...prev, inspectionTypes: v, reportType: v[0] || "" }))}
                placeholder="Seleccionar tipos..."
              />
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
            <Field label="Ubicación GPS" className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  value={data.gmapUrl}
                  readOnly
                  disabled
                  placeholder="Se genera automáticamente con el botón de obtener ubicación"
                  className={inputClass + " bg-navy-100/50 dark:bg-white/10 cursor-default"}
                />
                <Button type="button" variant="outline" onClick={handleGetLocation} disabled={locating} className="h-9 shrink-0 gap-1.5 px-3" title="Obtener ubicación actual">
                  {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}{locating ? "Obteniendo..." : "Obtener ubicación"}
                </Button>
                {data.gmapUrl && (
                  <>
                    <a href={data.gmapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 text-sm text-blue-600 transition-all hover:bg-blue-50 dark:border-white/10 dark:bg-white/5 dark:text-blue-400 dark:hover:bg-white/10">
                      <MapPin className="h-4 w-4" />Ver
                    </a>
                    <Button type="button" variant="outline" onClick={() => update("gmapUrl", "")} className="h-9 shrink-0 gap-1.5 px-3 text-red-500 hover:text-red-600" title="Limpiar ubicación">
                      <X className="h-4 w-4" />Limpiar
                    </Button>
                  </>
                )}
              </div>
            </Field>
            {data.gmapUrl && (
              <div className="md:col-span-2 mt-1 overflow-hidden rounded-xl border border-navy-200 dark:border-white/10">
                <iframe
                  src={`https://maps.google.com/maps?q=${data.gmapUrl.split("q=")[1] || ""}&z=17&output=embed`}
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card className="animate-fade-in-up animate-delay-2">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Server} title="Equipos (Cajas, Servidores, Impresoras Fiscales)" />
          {data.equipment.length === 0 && (
            <p className="text-xs text-gray-400">No hay equipos registrados. Agregue al menos uno.</p>
          )}
          {data.equipment.length > 0 && (
            <div className="space-y-2">
              {data.equipment.map((eq, idx) => {
                const typeLabels: Record<string, string> = { POS: "Caja / POS", SERVER: "Servidor", FISCAL_PRINTER: "Impresora Fiscal", SWITCH: "Switch / Router", UPS: "UPS / Regulador", OTHER: "Otro" };
                return (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {typeLabels[eq.type] || eq.type || "Sin tipo"}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{eq.quantity || "Sin nombre"}</span>
                        {eq.serialNumber && <span className="text-xs text-gray-400">SN: {eq.serialNumber}</span>}
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${eq.applies ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
                          {eq.applies ? "Aplica" : "No aplica"}
                        </span>
                      </div>
                      {(eq.posProcessor || eq.posRam || eq.posStorageType || eq.posStorageCapacity || eq.posOs) && (
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {eq.posProcessor && <span>Proc: {eq.posProcessor}</span>}
                          {eq.posRam && <span>RAM: {eq.posRam}</span>}
                          {(eq.posStorageType || eq.posStorageCapacity) && <span>Alm: {eq.posStorageType} {eq.posStorageCapacity}</span>}
                          {eq.posOs && <span>SO: {eq.posOs}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingEquipmentIdx(idx); setEquipmentFormOpen(true); }} className="h-7 w-7 p-0" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { const updated = data.equipment.filter((_, i) => i !== idx); update("equipment", updated); toast.success("Equipo eliminado"); }} className="h-7 w-7 p-0 text-red-500 hover:text-red-600" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => { setEditingEquipmentIdx(null); setEquipmentFormOpen(true); }} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />Agregar Equipo
          </Button>
        </CardContent>
      </Card>

      {/* Equipment Form Modal */}
      {equipmentFormOpen && (
        <EquipmentFormModal
          isEditing={editingEquipmentIdx !== null}
          initial={editingEquipmentIdx !== null ? data.equipment[editingEquipmentIdx] : newEquipment}
          onSave={(eq) => {
            if (editingEquipmentIdx !== null) {
              const updated = [...data.equipment];
              updated[editingEquipmentIdx] = eq;
              update("equipment", updated);
              toast.success("Equipo actualizado");
            } else {
              update("equipment", [...data.equipment, eq]);
              toast.success("Equipo agregado");
            }
            setEquipmentFormOpen(false);
          }}
          onClose={() => setEquipmentFormOpen(false)}
        />
      )}

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
              <div className="flex items-center gap-2">
                <Select value={data.bandwidth} onChange={(e) => update("bandwidth", e.target.value)} className={selectClass} disabled={!data.connectionType}>
                  <option value="">Seleccionar</option>
                  <option value="< 1Mbps">&lt; 1Mbps</option>
                  <option value="1Mbps a 5Mbps">1Mbps a 5Mbps</option>
                  <option value="5Mbps a 10Mbps">5Mbps a 10Mbps</option>
                  <option value="10Mbps a 50Mbps">10Mbps a 50Mbps</option>
                  <option value="50Mbps a 100Mbps">50Mbps a 100Mbps</option>
                  <option value="100Mbps a 300Mbps">100Mbps a 300Mbps</option>
                  <option value="> 300Mbps">&gt; 300Mbps</option>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={runSpeedTest} disabled={speedTesting || !data.connectionType} className="shrink-0 gap-1.5 whitespace-nowrap">
                  {speedTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
                  {speedTesting ? "Midiendo..." : "Test"}
                </Button>
                {speedStatus === "success" && <span className="text-xs text-green-500 font-medium">Prueba exitosa</span>}
                {speedStatus === "error" && <span className="text-xs text-red-500 font-medium">Error en la prueba</span>}
              </div>
              {speedResult && (
                <p className="mt-1 text-xs text-gray-400">Descarga: {speedResult.download} Mbps | Subida: {speedResult.upload} Mbps | Latencia: {speedResult.latency} ms | Conexión: {speedResult.connection} | ISP: {speedResult.isp} | IP: {speedResult.ip}</p>
              )}
            </Field>
            <Field label="Suministro Eléctrico">
              <Select value={data.powerSupply} onChange={(e) => update("powerSupply", e.target.value)} className={selectClass} disabled={!data.connectionType}>
                <option value="">No especificado</option>
                <option value="STABLE">Estable</option>
                <option value="UNSTABLE">Inestable</option>
                <option value="BACKUP">Con respaldo (UPS/gerador)</option>
                <option value="NONE">Sin respaldo</option>
              </Select>
            </Field>
          </div>
          <Field label="Observaciones Generales de la Infraestructura" className="w-full">
            <textarea value={data.physicalSecurity} onChange={(e) => update("physicalSecurity", e.target.value)} placeholder="Describe los detalles aquí..." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>
        </CardContent>
      </Card>

      {/* Seguridad Física - CCTV */}
      <Card className="animate-fade-in-up animate-delay-2">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Camera} title="Seguridad Física - CCTV" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Sistema CCTV Existente">
              <Select value={data.cctvExistingSystem} onChange={(e) => update("cctvExistingSystem", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="NONE">No tiene sistema</option>
                <option value="ANALOG">Analógico</option>
                <option value="IP">IP / Digital</option>
                <option value="HYBRID">Híbrido</option>
                <option value="UNKNOWN">No sabe</option>
              </Select>
            </Field>
            <Field label="Cantidad de Cámaras">
              <Input type="number" value={data.cctvCameraCount} onChange={(e) => update("cctvCameraCount", e.target.value)} placeholder="0" className={inputClass} />
            </Field>
            <Field label="Tipo de Cámaras">
              <Select value={data.cctvCameraType} onChange={(e) => update("cctvCameraType", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="DOME">Domo</option>
                <option value="BULLET">Bala</option>
                <option value="PTZ">PTZ</option>
                <option value="TURRET">Torreta</option>
                <option value="FISHEYE">Ojo de pez</option>
                <option value="MULTIPLE">Múltiples tipos</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Field label="Resolución de Cámaras">
              <Select value={data.cctvCameraResolution} onChange={(e) => update("cctvCameraResolution", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="720P">720P (HD)</option>
                <option value="1080P">1080P (Full HD)</option>
                <option value="2K">2K</option>
                <option value="4K">4K (Ultra HD)</option>
                <option value="ANALOG">Analógico (TVI/CVI/AHD)</option>
              </Select>
            </Field>
            <Field label="Marca de Cámaras">
              <Input value={data.cctvCameraBrand} onChange={(e) => update("cctvCameraBrand", e.target.value)} placeholder="Ej: Hikvision, Dahua" className={inputClass} />
            </Field>
            <Field label="Estado de Cámaras">
              <Select value={data.cctvCameraCondition} onChange={(e) => update("cctvCameraCondition", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="EXCELLENT">Excelente</option>
                <option value="GOOD">Bueno</option>
                <option value="FAIR">Regular</option>
                <option value="POOR">Malo</option>
                <option value="DAMAGED">Dañado</option>
                <option value="NONE">No tiene</option>
              </Select>
            </Field>
            <div className="flex items-end gap-3">
              <Switch id="night" checked={data.cctvNightVision} onChange={(e) => update("cctvNightVision", e.target.checked)} label="Visión Nocturna" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Field label="Marca DVR/NVR">
              <Input value={data.cctvDvrNvrBrand} onChange={(e) => update("cctvDvrNvrBrand", e.target.value)} placeholder="Ej: Hikvision, Samsung" className={inputClass} />
            </Field>
            <Field label="Canales DVR/NVR">
              <Select value={data.cctvDvrNvrChannels} onChange={(e) => update("cctvDvrNvrChannels", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="4">4 Canales</option>
                <option value="8">8 Canales</option>
                <option value="16">16 Canales</option>
                <option value="32">32 Canales</option>
                <option value="64">64 Canales</option>
              </Select>
            </Field>
            <Field label="Almacenamiento">
              <Select value={data.cctvStorageCapacity} onChange={(e) => update("cctvStorageCapacity", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="500GB">500GB</option>
                <option value="1TB">1TB</option>
                <option value="2TB">2TB</option>
                <option value="4TB">4TB</option>
                <option value="6TB">6TB</option>
                <option value="8TB">8TB</option>
                <option value="10TB">10TB+</option>
              </Select>
            </Field>
            <Field label="Retención (días)">
              <Select value={data.cctvRetentionDays} onChange={(e) => update("cctvRetentionDays", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="7">7 días</option>
                <option value="15">15 días</option>
                <option value="30">30 días</option>
                <option value="60">60 días</option>
                <option value="90">90 días</option>
                <option value="180">180 días</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Tipo de Cableado">
              <Select value={data.cctvCablingType} onChange={(e) => update("cctvCablingType", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="COAXIAL">Coaxial (RG59/RG6)</option>
                <option value="CAT5E">CAT5e</option>
                <option value="CAT6">CAT6</option>
                <option value="CAT6A">CAT6A</option>
                <option value="FIBER">Fibra Óptica</option>
                <option value="WIRELESS">Inalámbrico</option>
              </Select>
            </Field>
            <Field label="Longitud Estimada Cableado (m)">
              <Input type="number" value={data.cctvCablingLength} onChange={(e) => update("cctvCablingLength", e.target.value)} placeholder="0" className={inputClass} />
            </Field>
            <Field label="Alimentación Eléctrica">
              <Select value={data.cctvPowerSupply} onChange={(e) => update("cctvPowerSupply", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="POE">PoE (Power over Ethernet)</option>
                <option value="AC_ADAPTER">Adaptador AC</option>
                <option value="BATTERY">Batería / UPS</option>
                <option value="SOLAR">Solar</option>
                <option value="UNKNOWN">No sabe</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-end gap-3">
              <Switch id="remote" checked={data.cctvRemoteAccess} onChange={(e) => update("cctvRemoteAccess", e.target.checked)} label="Acceso Remoto" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="alarm" checked={data.cctvAlarmIntegration} onChange={(e) => update("cctvAlarmIntegration", e.target.checked)} label="Integración con Alarma" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="access" checked={data.cctvAccessControl} onChange={(e) => update("cctvAccessControl", e.target.checked)} label="Control de Acceso" />
            </div>
          </div>

          <Field label="Ubicación de Monitoreo">
            <Input value={data.cctvMonitoringLocation} onChange={(e) => update("cctvMonitoringLocation", e.target.value)} placeholder="Ej: Sala de seguridad, recepción, oficina principal" className={inputClass} />
          </Field>

          <Field label="Áreas a Cubrir" className="w-full">
            <textarea value={data.cctvAreasToCover} onChange={(e) => update("cctvAreasToCover", e.target.value)} placeholder="Ej: Estacionamiento, entrada principal, almacén, caja..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Áreas Ya Cubiertas" className="w-full">
            <textarea value={data.cctvAreasCovered} onChange={(e) => update("cctvAreasCovered", e.target.value)} placeholder="Ej: Entrada principal, pasillo norte..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Puntos Ciegos Identificados" className="w-full">
            <textarea value={data.cctvBlindSpots} onChange={(e) => update("cctvBlindSpots", e.target.value)} placeholder="Describa áreas sin cobertura o con visibilidad limitada..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Tipo de Instalación">
              <Select value={data.cctvInstallationType} onChange={(e) => update("cctvInstallationType", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="NEW">Nueva Instalación</option>
                <option value="EXPANSION">Expansión</option>
                <option value="REPLACEMENT">Reemplazo</option>
                <option value="MAINTENANCE">Mantenimiento</option>
                <option value="REPAIR">Reparación</option>
              </Select>
            </Field>
            <Field label="Condiciones de Iluminación">
              <Select value={data.cctvLightingConditions} onChange={(e) => update("cctvLightingConditions", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="BRIGHT">Buena iluminación</option>
                <option value="LOW">Poca iluminación</option>
                <option value="VARIABLE">Variable (día/noche)</option>
                <option value="DARK">Zona oscura</option>
              </Select>
            </Field>
            <Field label="Exposición al Clima">
              <Select value={data.cctvWeatherExposure} onChange={(e) => update("cctvWeatherExposure", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="INDOOR">Interior</option>
                <option value="OUTDOOR">Exterior</option>
                <option value="MIXED">Mixto</option>
                <option value="EXTREME">Extremo (lluvia, polvo, calor)</option>
              </Select>
            </Field>
          </div>

          <Field label="Lugares de Montaje" className="w-full">
            <textarea value={data.cctvMountingLocations} onChange={(e) => update("cctvMountingLocations", e.target.value)} placeholder="Ej: Paredes, techo, postes, esquinas..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Ancho de Banda de Red Requerido">
            <Select value={data.cctvNetworkBandwidth} onChange={(e) => update("cctvNetworkBandwidth", e.target.value)} className={selectClass}>
              <option value="">Seleccionar</option>
              <option value="LOW">Bajo (&lt; 10 Mbps)</option>
              <option value="MEDIUM">Medio (10-50 Mbps)</option>
              <option value="HIGH">Alto (50-100 Mbps)</option>
              <option value="VERY_HIGH">Muy alto (&gt; 100 Mbps)</option>
            </Select>
          </Field>

          <Field label="Notas Adicionales sobre Seguridad" className="w-full">
            <textarea value={data.cctvAdditionalNotes} onChange={(e) => update("cctvAdditionalNotes", e.target.value)} placeholder="Cualquier información adicional relevante sobre el sistema de seguridad..." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>
        </CardContent>
      </Card>

      {/* Desarrollo de Software */}
      <Card className="animate-fade-in-up animate-delay-2">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Code} title="Desarrollo de Software, Web o APP" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Tipo de Desarrollo Requerido">
              <Select value={data.swDevType} onChange={(e) => update("swDevType", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="WEB">Aplicación Web</option>
                <option value="MOBILE">Aplicación Móvil</option>
                <option value="DESKTOP">Aplicación de Escritorio</option>
                <option value="API">API / Backend</option>
                <option value="ECOMMERCE">E-Commerce / Tienda Online</option>
                <option value="CMS">Sistema CMS / Intranet</option>
                <option value="ERP_CUSTOM">Módulo ERP Personalizado</option>
                <option value="INTEGRATION">Integración de Sistemas</option>
                <option value="OTHER">Otro</option>
              </Select>
            </Field>
            <Field label="Sistema Actual">
              <Select value={data.swCurrentSystem} onChange={(e) => update("swCurrentSystem", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="NONE">No tiene sistema actual</option>
                <option value="LEGACY">Sistema legado / antiguo</option>
                <option value="BASIC">Sistema básico (Excel, planillas)</option>
                <option value="CUSTOM">Sistema personalizado</option>
                <option value="SAAS">Software SaaS ( Salesforce, etc.)</option>
                <option value="OPEN_SOURCE">Software de código abierto</option>
              </Select>
            </Field>
            <Field label="Tecnologías Actuales">
              <Input value={data.swCurrentTech} onChange={(e) => update("swCurrentTech", e.target.value)} placeholder="Ej: PHP, Laravel, MySQL, React" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Sitio Web Actual" className="w-full">
              <textarea value={data.swCurrentWebsite} onChange={(e) => update("swCurrentWebsite", e.target.value)} placeholder="Describa el sitio web actual, funcionalidades, tecnología utilizada..." className={textareaClass + " min-h-[80px] w-full"} />
            </Field>
            <Field label="Aplicación Móvil Actual" className="w-full">
              <textarea value={data.swCurrentApp} onChange={(e) => update("swCurrentApp", e.target.value)} placeholder="Describa la app actual, plataforma (iOS/Android), funcionalidades..." className={textareaClass + " min-h-[80px] w-full"} />
            </Field>
          </div>

          <Field label="Software Actual / Sistemas Existentes" className="w-full">
            <textarea value={data.swCurrentSoftware} onChange={(e) => update("swCurrentSoftware", e.target.value)} placeholder="Describa todos los sistemas de software que utiliza actualmente el cliente (contabilidad, inventario, RRHH, facturación, etc.)..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Problemas o Limitaciones Actuales" className="w-full">
            <textarea value={data.swCurrentIssues} onChange={(e) => update("swCurrentIssues", e.target.value)} placeholder="Describa los problemas, limitaciones o necesidades que enfrenta el cliente con sus sistemas actuales..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Tipo de Desarrollo Esperado">
              <Select value={data.swRequiredType} onChange={(e) => update("swRequiredType", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="NEW_BUILD">Desarrollo desde cero</option>
                <option value="REDESIGN">Rediseño completo</option>
                <option value="FEATURE_ADD">Agregar funcionalidades</option>
                <option value="MIGRATION">Migración de sistema</option>
                <option value="MAINTENANCE">Mantenimiento / Soporte</option>
                <option value="CONSULTING">Consultoría técnica</option>
              </Select>
            </Field>
            <Field label="Cantidad de Usuarios Esperados">
              <Input type="number" value={data.swTargetUsers} onChange={(e) => update("swTargetUsers", e.target.value)} placeholder="0" className={inputClass} />
            </Field>
            <Field label="Roles de Usuario">
              <Input value={data.swUserRoles} onChange={(e) => update("swUserRoles", e.target.value)} placeholder="Ej: Admin, Vendedor, Gerente" className={inputClass} />
            </Field>
          </div>

          <Field label="Funcionalidades Requeridas" className="w-full">
            <textarea value={data.swRequiredFeatures} onChange={(e) => update("swRequiredFeatures", e.target.value)} placeholder="Liste las funcionalidades principales que necesita: login, dashboard, reportes, facturación, inventario, notificaciones, chat, etc." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>

          <Field label="Módulos o Secciones Requeridas" className="w-full">
            <textarea value={data.swRequiredModules} onChange={(e) => update("swRequiredModules", e.target.value)} placeholder="Liste los módulos o secciones del sistema: Dashboard, Usuarios, Clientes, Productos, Ventas, Compras, Contabilidad, RRHH, etc." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Integraciones Necesarias" className="w-full">
            <textarea value={data.swIntegrationNeeds} onChange={(e) => update("swIntegrationNeeds", e.target.value)} placeholder="Ej: Pasarela de pago (PayPal, Stripe), API bancaria, WhatsApp Business, correo electrónico, GPS, etc." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Tipo de Hosting Requerido">
              <Select value={data.swHostingType} onChange={(e) => update("swHostingType", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="SHARED">Hosting Compartido</option>
                <option value="VPS">VPS / Servidor Virtual</option>
                <option value="DEDICATED">Servidor Dedicado</option>
                <option value="CLOUD">Cloud (AWS, Azure, GCP)</option>
                <option value="LOCAL">Servidor Local / On-Premise</option>
                <option value="NONE">No requiere</option>
              </Select>
            </Field>
            <Field label="Estado del Dominio">
              <Select value={data.swDomainStatus} onChange={(e) => update("swDomainStatus", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="HAS">Ya tiene dominio registrado</option>
                <option value="NEEDS">Necesita registrar dominio</option>
                <option value="TRANSFER">Necesita transferir dominio</option>
                <option value="NONE">No requiere dominio</option>
              </Select>
            </Field>
            <Field label="Nombre de Dominio">
              <Input value={data.swDomainName} onChange={(e) => update("swDomainName", e.target.value)} placeholder="Ej: mipagina.com" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Presupuesto Estimado">
              <Select value={data.swBudget} onChange={(e) => update("swBudget", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="UNDER_1000">Menos de $1,000</option>
                <option value="1000_5000">$1,000 - $5,000</option>
                <option value="5000_10000">$5,000 - $10,000</option>
                <option value="10000_25000">$10,000 - $25,000</option>
                <option value="25000_50000">$25,000 - $50,000</option>
                <option value="OVER_50000">Más de $50,000</option>
                <option value="UNDEFINED">A definir</option>
              </Select>
            </Field>
            <Field label="Tiempo Esperado de Entrega">
              <Select value={data.swTimeline} onChange={(e) => update("swTimeline", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="URGENT">Urgente (1-2 semanas)</option>
                <option value="SHORT">Corto plazo (1 mes)</option>
                <option value="MEDIUM">Medio plazo (2-3 meses)</option>
                <option value="LONG">Largo plazo (6+ meses)</option>
                <option value="FLEXIBLE">Flexible</option>
              </Select>
            </Field>
            <Field label="Necesidades de Mantenimiento">
              <Select value={data.swMaintenanceNeeds} onChange={(e) => update("swMaintenanceNeeds", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="NONE">No requiere</option>
                <option value="BASIC">Básico (actualizaciones menores)</option>
                <option value="REGULAR">Regular (soporte mensual)</option>
                <option value="COMPREHENSIVE">Integral (soporte 24/7)</option>
              </Select>
            </Field>
          </div>

          <Field label="Requisitos de Seguridad" className="w-full">
            <textarea value={data.swSecurityNeeds} onChange={(e) => update("swSecurityNeeds", e.target.value)} placeholder="Ej: Autenticación de dos factores, encriptación SSL, respaldos automáticos, control de acceso por roles, auditoría de acciones..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Necesidades de Capacitación" className="w-full">
            <textarea value={data.swTrainingNeeds} onChange={(e) => update("swTrainingNeeds", e.target.value)} placeholder="Describa si el personal requiere capacitación, tipo de capacitación, usuarios objetivo..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Notas Adicionales sobre Desarrollo" className="w-full">
            <textarea value={data.swAdditionalNotes} onChange={(e) => update("swAdditionalNotes", e.target.value)} placeholder="Cualquier información adicional relevante sobre el desarrollo de software..." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>
        </CardContent>
      </Card>

      {/* Redes de Telecomunicaciones */}
      <Card className="animate-fade-in-up animate-delay-2">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Network} title="Redes de Telecomunicaciones" />

          <p className="text-xs text-gray-400 dark:text-white/40">Situación Actual de la Red</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Topología de Red Actual">
              <Select value={data.netCurrentTopology} onChange={(e) => update("netCurrentTopology", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="STAR">Estrella</option>
                <option value="BUS">Bus</option>
                <option value="RING">Anillo</option>
                <option value="MESH">Malla</option>
                <option value="TREE">Árbol</option>
                <option value="HYBRID">Híbrida</option>
                <option value="NONE">No tiene red</option>
              </Select>
            </Field>
            <Field label="Ancho de Banda Actual">
              <Select value={data.netCurrentBandwidth} onChange={(e) => update("netCurrentBandwidth", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="< 1Mbps">&lt; 1Mbps</option>
                <option value="1-5Mbps">1-5 Mbps</option>
                <option value="5-10Mbps">5-10 Mbps</option>
                <option value="10-50Mbps">10-50 Mbps</option>
                <option value="50-100Mbps">50-100 Mbps</option>
                <option value="100-300Mbps">100-300 Mbps</option>
                <option value="300-1Gbps">300 Mbps - 1 Gbps</option>
                <option value="> 1Gbps">&gt; 1 Gbps</option>
              </Select>
            </Field>
            <Field label="ISP Actual">
              <Input value={data.netCurrentIsp} onChange={(e) => update("netCurrentIsp", e.target.value)} placeholder="Ej: CANTV, Movistar, Telcel" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Router Actual">
              <Input value={data.netCurrentRouter} onChange={(e) => update("netCurrentRouter", e.target.value)} placeholder="Marca, modelo, cantidad" className={inputClass} />
            </Field>
            <Field label="Switches Actuales">
              <Input value={data.netCurrentSwitch} onChange={(e) => update("netCurrentSwitch", e.target.value)} placeholder="Marca, modelo, puertos" className={inputClass} />
            </Field>
            <Field label="Firewall / Seguridad">
              <Input value={data.netCurrentFirewall} onChange={(e) => update("netCurrentFirewall", e.target.value)} placeholder="Marca, modelo" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Access Points WiFi Actuales">
              <Input value={data.netCurrentWifiAp} onChange={(e) => update("netCurrentWifiAp", e.target.value)} placeholder="Marca, modelo, cantidad, cobertura" className={inputClass} />
            </Field>
            <Field label="Cableado Actual">
              <Select value={data.netCurrentCabling} onChange={(e) => update("netCurrentCabling", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="CAT5">CAT5</option>
                <option value="CAT5E">CAT5e</option>
                <option value="CAT6">CAT6</option>
                <option value="CAT6A">CAT6A</option>
                <option value="CAT7">CAT7</option>
                <option value="FIBER">Fibra Óptica</option>
                <option value="MIXED">Mixto</option>
                <option value="UNKNOWN">No sabe</option>
              </Select>
            </Field>
          </div>

          <Field label="Sala de Servidores / Rack" className="w-full">
            <textarea value={data.netCurrentServerRoom} onChange={(e) => update("netCurrentServerRoom", e.target.value)} placeholder="Describa la sala de servidores, rack, estado, climatización, energía, acceso..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Problemas o Limitaciones de Red Actuales" className="w-full">
            <textarea value={data.netCurrentIssues} onChange={(e) => update("netCurrentIssues", e.target.value)} placeholder="Describa los problemas actuales: caídas, lentitud, puntos ciegos WiFi, cableado deteriorado, etc." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <div className="border-t border-gray-200 dark:border-white/[0.06] pt-4">
            <p className="text-xs text-gray-400 dark:text-white/40 mb-3">Requerimientos y Necesidades</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Topología Requerida">
              <Select value={data.netRequiredTopology} onChange={(e) => update("netRequiredTopology", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="STAR">Estrella</option>
                <option value="MESH">Malla</option>
                <option value="TREE">Árbol</option>
                <option value="HYBRID">Híbrida</option>
                <option value="NO_CHANGE">Sin cambios</option>
              </Select>
            </Field>
            <Field label="Ancho de Banda Requerido">
              <Select value={data.netRequiredBandwidth} onChange={(e) => update("netRequiredBandwidth", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="< 1Mbps">&lt; 1Mbps</option>
                <option value="1-5Mbps">1-5 Mbps</option>
                <option value="5-10Mbps">5-10 Mbps</option>
                <option value="10-50Mbps">10-50 Mbps</option>
                <option value="50-100Mbps">50-100 Mbps</option>
                <option value="100-300Mbps">100-300 Mbps</option>
                <option value="300-1Gbps">300 Mbps - 1 Gbps</option>
                <option value="> 1Gbps">&gt; 1 Gbps</option>
              </Select>
            </Field>
          </div>

          <Field label="Equipamiento Requerido" className="w-full">
            <textarea value={data.netRequiredEquipment} onChange={(e) => update("netRequiredEquipment", e.target.value)} placeholder="Ej: Router principal, switches manageables, access points WiFi 6, firewall, servidor NAS..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Cableado Requerido">
              <Select value={data.netRequiredCabling} onChange={(e) => update("netRequiredCabling", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="CAT5E">CAT5e</option>
                <option value="CAT6">CAT6</option>
                <option value="CAT6A">CAT6A</option>
                <option value="CAT7">CAT7</option>
                <option value="FIBER">Fibra Óptica</option>
                <option value="NO_CHANGE">Sin cambios</option>
              </Select>
            </Field>
            <Field label="Cobertura WiFi Requerida">
              <Select value={data.netWifiCoverage} onChange={(e) => update("netWifiCoverage", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="FULL">Cobertura total</option>
                <option value="PARTIAL">Cobertura parcial</option>
                <option value="CRITICAL">Zonas críticas</option>
                <option value="NONE">No requiere</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="flex items-end gap-3">
              <Switch id="vpn" checked={data.netRequiredVpn} onChange={(e) => update("netRequiredVpn", e.target.checked)} label="VPN / Acceso Remoto" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="wifi" checked={data.netRequiredWifi} onChange={(e) => update("netRequiredWifi", e.target.checked)} label="WiFi Nuevo" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="voip" checked={data.netRequiredVoip} onChange={(e) => update("netRequiredVoip", e.target.checked)} label="VoIP / Telefonía" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="netbackup" checked={data.netRequiredBackup} onChange={(e) => update("netRequiredBackup", e.target.checked)} label="Respaldo de Red" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="monitor" checked={data.netRequiredMonitoring} onChange={(e) => update("netRequiredMonitoring", e.target.checked)} label="Monitoreo de Red" />
            </div>
          </div>

          <Field label="Seguridad de Red Requerida" className="w-full">
            <textarea value={data.netRequiredSecurity} onChange={(e) => update("netRequiredSecurity", e.target.value)} placeholder="Ej: Firewall, IDS/IPS, filtrado de contenido, segmentación de red, control de acceso por MAC..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Zonas WiFi Requeridas" className="w-full">
            <textarea value={data.netWifiZones} onChange={(e) => update("netWifiZones", e.target.value)} placeholder="Ej: Oficina principal, almacén, área de producción, recepción, salas de reunión..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Necesidades de VLAN / Segmentación" className="w-full">
            <textarea value={data.netVlanNeeds} onChange={(e) => update("netVlanNeeds", e.target.value)} placeholder="Ej: VLAN para cámaras, VLAN para VoIP, VLAN para invitados, VLAN para administración..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Acceso Remoto / VPN Requerido" className="w-full">
            <textarea value={data.netRemoteAccessNeeds} onChange={(e) => update("netRemoteAccessNeeds", e.target.value)} placeholder="Ej: VPN site-to-site, VPN para usuarios remotos, acceso por IP pública, etc." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Estrategia de Respaldo Requerida" className="w-full">
            <textarea value={data.netBackupStrategy} onChange={(e) => update("netBackupStrategy", e.target.value)} placeholder="Ej: Respaldo a la nube, NAS local, duplicación de configuraciones de red, UPS para equipo de red..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Mantenimiento de Red Requerido">
            <Select value={data.netMaintenanceNeeds} onChange={(e) => update("netMaintenanceNeeds", e.target.value)} className={selectClass}>
              <option value="">Seleccionar</option>
              <option value="NONE">No requiere</option>
              <option value="BASIC">Básico (actualizaciones de firmware)</option>
              <option value="REGULAR">Regular (soporte mensual)</option>
              <option value="COMPREHENSIVE">Integral (soporte 24/7)</option>
            </Select>
          </Field>

          <Field label="Notas Adicionales sobre Redes" className="w-full">
            <textarea value={data.netAdditionalNotes} onChange={(e) => update("netAdditionalNotes", e.target.value)} placeholder="Cualquier información adicional relevante sobre la red de telecomunicaciones..." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>
        </CardContent>
      </Card>

      {/* Soporte Técnico */}
      <Card className="animate-fade-in-up animate-delay-2">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Shield} title="Soporte Técnico" />

          <p className="text-xs text-gray-400 dark:text-white/40">Tipo de Soporte Requerido</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Modalidad de Soporte">
              <Select value={data.supType} onChange={(e) => update("supType", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="REMOTE">Remoto</option>
                <option value="ONSITE">Presencial</option>
                <option value="HYBRID">Híbrido</option>
                <option value="NONE">No requiere</option>
              </Select>
            </Field>
            <Field label="Horas de Soporte Remoto">
              <Select value={data.supRemoteHours} onChange={(e) => update("supRemoteHours", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="8x5">8x5 (horario laboral)</option>
                <option value="12x5">12x5</option>
                <option value="16x7">16x7</option>
                <option value="24x7">24x7 (permanente)</option>
                <option value="ON_DEMAND">Bajo demanda</option>
              </Select>
            </Field>
            <Field label="Horas de Soporte Presencial">
              <Select value={data.supOnSiteHours} onChange={(e) => update("supOnSiteHours", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="8x5">8x5 (horario laboral)</option>
                <option value="12x5">12x5</option>
                <option value="16x7">16x7</option>
                <option value="24x7">24x7 (permanente)</option>
                <option value="ON_DEMAND">Bajo demanda</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Field label="Días de Servicio">
              <Select value={data.supScheduleDays} onChange={(e) => update("supScheduleDays", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="WEEKDAYS">Lunes a Viernes</option>
                <option value="MON_SAT">Lunes a Sábado</option>
                <option value="DAILY">Todos los días</option>
                <option value="WEEKENDS">Fines de semana</option>
              </Select>
            </Field>
            <Field label="Hora Inicio">
              <Input type="time" value={data.supScheduleTimeStart} onChange={(e) => update("supScheduleTimeStart", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Hora Fin">
              <Input type="time" value={data.supScheduleTimeEnd} onChange={(e) => update("supScheduleTimeEnd", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Tiempo de Respuesta">
              <Select value={data.supResponseTime} onChange={(e) => update("supResponseTime", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="1H">1 hora</option>
                <option value="2H">2 horas</option>
                <option value="4H">4 horas</option>
                <option value="8H">8 horas (1 día)</option>
                <option value="24H">24 horas</option>
                <option value="48H">48 horas</option>
              </Select>
            </Field>
          </div>

          <div className="border-t border-gray-200 dark:border-white/[0.06] pt-4">
            <p className="text-xs text-gray-400 dark:text-white/40 mb-3">Registro de Equipos del Cliente</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Marca(s) de Equipos">
              <Input value={data.supCurrentEquipBrand} onChange={(e) => update("supCurrentEquipBrand", e.target.value)} placeholder="Ej: Dell, HP, Lenovo" className={inputClass} />
            </Field>
            <Field label="Modelo(s) de Equipos">
              <Input value={data.supCurrentEquipModel} onChange={(e) => update("supCurrentEquipModel", e.target.value)} placeholder="Ej: OptiPlex 7090, ProBook 450" className={inputClass} />
            </Field>
            <Field label="Cantidad de Equipos">
              <Input type="number" value={data.supCurrentEquipQty} onChange={(e) => update("supCurrentEquipQty", e.target.value)} placeholder="0" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Estado de los Equipos">
              <Select value={data.supCurrentEquipCondition} onChange={(e) => update("supCurrentEquipCondition", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="EXCELLENT">Excelente</option>
                <option value="GOOD">Bueno</option>
                <option value="FAIR">Regular</option>
                <option value="POOR">Malo</option>
                <option value="MIXED">Mixto</option>
              </Select>
            </Field>
            <Field label="Garantía de los Equipos">
              <Select value={data.supCurrentEquipWarranty} onChange={(e) => update("supCurrentEquipWarranty", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="ACTIVE">Garantía activa</option>
                <option value="EXPIRED">Garantía vencida</option>
                <option value="MIXED">Algunos con garantía</option>
                <option value="NONE">Sin garantía</option>
                <option value="UNKNOWN">No sabe</option>
              </Select>
            </Field>
          </div>

          <Field label="Software / Sistemas Instalados" className="w-full">
            <textarea value={data.supCurrentSoftware} onChange={(e) => update("supCurrentSoftware", e.target.value)} placeholder="Ej: Windows 10/11, Office 365, antivirus, sistemas propios, etc." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <Field label="Problemas Actuales de los Equipos" className="w-full">
            <textarea value={data.supCurrentIssues} onChange={(e) => update("supCurrentIssues", e.target.value)} placeholder="Describa los problemas actuales: lentitud, virus, pantallazos azules, fallas de hardware, etc." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <div className="border-t border-gray-200 dark:border-white/[0.06] pt-4">
            <p className="text-xs text-gray-400 dark:text-white/40 mb-3">Requerimientos del Cliente</p>
          </div>

          <Field label="Servicios de Soporte Requeridos" className="w-full">
            <textarea value={data.supRequiredServices} onChange={(e) => update("supRequiredServices", e.target.value)} placeholder="Ej: Instalación de software, configuración de redes, reparación de hardware, limpieza de equipos, migración de datos, etc." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Cobertura Geográfica">
              <Input value={data.supRequiredCoverage} onChange={(e) => update("supRequiredCoverage", e.target.value)} placeholder="Ej: Caracas, Valencia, Maracaibo" className={inputClass} />
            </Field>
            <Field label="Nivel de Servicio (SLA)">
              <Select value={data.supRequiredSlA} onChange={(e) => update("supRequiredSlA", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="BASIC">Básico</option>
                <option value="STANDARD">Estándar</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Empresarial</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="flex items-end gap-3">
              <Switch id="training" checked={data.supRequiredTraining} onChange={(e) => update("supRequiredTraining", e.target.checked)} label="Capacitación" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="docs" checked={data.supRequiredDocumentation} onChange={(e) => update("supRequiredDocumentation", e.target.checked)} label="Documentación" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="inventory" checked={data.supRequiredInventory} onChange={(e) => update("supRequiredInventory", e.target.checked)} label="Inventario" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="onsitevisit" checked={data.supRequiredOnSiteVisit} onChange={(e) => update("supRequiredOnSiteVisit", e.target.checked)} label="Visita Presencial" />
            </div>
            <div className="flex items-end gap-3">
              <Switch id="remoteaccess" checked={data.supRequiredRemoteAccess} onChange={(e) => update("supRequiredRemoteAccess", e.target.checked)} label="Acceso Remoto" />
            </div>
          </div>

          <Field label="Expectativas del Cliente" className="w-full">
            <textarea value={data.supClientExpectations} onChange={(e) => update("supClientExpectations", e.target.value)} placeholder="Describa las expectativas del cliente respecto al soporte técnico..." className={textareaClass + " min-h-[80px] w-full"} />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Presupuesto Mensual Estimado">
              <Select value={data.supBudgetRange} onChange={(e) => update("supBudgetRange", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="UNDER_100">Menos de $100</option>
                <option value="100_300">$100 - $300</option>
                <option value="300_500">$300 - $500</option>
                <option value="500_1000">$500 - $1,000</option>
                <option value="1000_2500">$1,000 - $2,500</option>
                <option value="OVER_2500">Más de $2,500</option>
                <option value="UNDEFINED">A definir</option>
              </Select>
            </Field>
            <Field label="Duración del Contrato">
              <Select value={data.supContractDuration} onChange={(e) => update("supContractDuration", e.target.value)} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="1_MONTH">1 mes</option>
                <option value="3_MONTHS">3 meses</option>
                <option value="6_MONTHS">6 meses</option>
                <option value="1_YEAR">1 año</option>
                <option value="INDEFINITE">Indefinido</option>
                <option value="PER_PROJECT">Por proyecto</option>
              </Select>
            </Field>
          </div>

          <Field label="Notas Adicionales sobre Soporte" className="w-full">
            <textarea value={data.supAdditionalNotes} onChange={(e) => update("supAdditionalNotes", e.target.value)} placeholder="Cualquier información adicional relevante sobre el soporte técnico..." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>
        </CardContent>
      </Card>

      {/* Telecom Network - Conditional */}
      {data.inspectionTypes.includes("TELECOM_NETWORK") && (
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
      {data.inspectionTypes.includes("ERP_INSTALLATION") && (
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
                <Switch id="migration" checked={data.dataMigration} onChange={(e) => update("dataMigration", e.target.checked)} label="Requiere Migración de Datos" />
              </div>
            </div>
            <Field label="Requisitos de Capacitación">
              <textarea value={data.trainingRequirements} onChange={(e) => update("trainingRequirements", e.target.value)} placeholder="Áreas, usuarios, horarios..." className={textareaClass} />
            </Field>
          </CardContent>
        </Card>
      )}

      {/* Security Cameras - Conditional */}
      {data.inspectionTypes.includes("SECURITY_CAMERAS") && (
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
                <Switch id="night" checked={data.nightVision} onChange={(e) => update("nightVision", e.target.checked)} label="Visión Nocturna" />
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
          <Field label="Descripción de la Inspección">
            <textarea value={data.content} onChange={(e) => update("content", e.target.value)} placeholder="Descripción general de la inspección..." className={textareaClass + " min-h-[120px]"} />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Hallazgos">
              <textarea value={data.findings} onChange={(e) => update("findings", e.target.value)} placeholder="Observaciones de la inspección..." className={textareaClass} />
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
          {isEdit ? "Actualizar Inspección" : "Crear Inspección"}
        </Button>
      </div>
    </div>
  );
}

const defaultEq = { type: "", applies: false, brand: "", model: "", serialNumber: "", quantity: "", condition: "", status: "", specs: "", posProcessor: "", posRam: "", posStorageType: "", posStorageCapacity: "", posOs: "", posNotes: "" };

function EquipmentFormModal({ isEditing, initial, onSave, onClose }: { isEditing: boolean; initial: Record<string, unknown>; onSave: (eq: typeof defaultEq) => void; onClose: () => void }) {
  const [eq, setEq] = useState({ ...defaultEq, ...initial, applies: "applies" in initial ? !!initial.applies : false });
  const [typeSelected, setTypeSelected] = useState(isEditing || !!initial.type);
  const selectClass = "h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white";
  const inputClass = "h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30";
  const textareaClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30";

  function updateField(key: string, value: string | boolean) {
    setEq((prev) => ({ ...prev, [key]: value }));
  }

  const typeLabels: Record<string, string> = { POS: "Caja / POS", SERVER: "Servidor", FISCAL_PRINTER: "Impresora Fiscal", SWITCH: "Switch / Router", UPS: "UPS / Regulador", OTHER: "Otro" };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? "Editar Equipo" : "Nuevo Equipo"}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Tipo de Equipo *</label>
            <Select value={eq.type} onChange={(e) => { updateField("type", e.target.value); setTypeSelected(!!e.target.value); }} className={selectClass}>
              <option value="">Seleccionar</option>
              <option value="POS">Caja / POS</option>
              <option value="SERVER">Servidor</option>
              <option value="FISCAL_PRINTER">Impresora Fiscal</option>
              <option value="SWITCH">Switch / Router</option>
              <option value="UPS">UPS / Regulador</option>
              <option value="OTHER">Otro</option>
            </Select>
          </div>

          {typeSelected && (<>
            <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Especificaciones {typeLabels[eq.type] || ""}</p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Nombre de Equipo</label>
                  <Input type="text" value={eq.quantity} onChange={(e) => updateField("quantity", e.target.value)} placeholder="Ej: CAJA 1" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Marca</label>
                  <Input value={eq.brand} onChange={(e) => updateField("brand", e.target.value)} placeholder="Ej: Epson, Bixolon" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Modelo</label>
                  <Input value={eq.model} onChange={(e) => updateField("model", e.target.value)} placeholder="Modelo del equipo" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Nro. Serie</label>
                  <Input value={eq.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} placeholder="Número de serie" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Estado Físico</label>
                  <Select value={eq.condition} onChange={(e) => updateField("condition", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="EXCELLENT">Excelente</option>
                    <option value="GOOD">Bueno</option>
                    <option value="FAIR">Regular</option>
                    <option value="POOR">Malo</option>
                    <option value="DAMAGED">Dañado</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Estado Operativo</label>
                  <Select value={eq.status} onChange={(e) => updateField("status", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="WORKING">Funcionando</option>
                    <option value="NEEDS_REPAIR">Requiere reparación</option>
                    <option value="NEEDS_REPLACEMENT">Requiere reemplazo</option>
                    <option value="OFFLINE">Fuera de servicio</option>
                  </Select>
                </div>
              </div>

              {(eq.type === "POS" || eq.type === "SERVER") && (
                <div className="space-y-3 rounded-xl border border-blue-300 bg-blue-100/50 p-4 dark:border-blue-700 dark:bg-blue-800/30">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Detalles del Equipo</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Procesador</label>
                      <Input value={eq.posProcessor} onChange={(e) => updateField("posProcessor", e.target.value)} placeholder="Ej: Intel Core i5" className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Memoria RAM</label>
                      <Select value={eq.posRam} onChange={(e) => updateField("posRam", e.target.value)} className={selectClass}>
                        <option value="">Seleccionar</option>
                        <option value="< 1GB">&lt; 1GB</option>
                        <option value="1GB">1GB</option>
                        <option value="2GB">2GB</option>
                        <option value="4GB">4GB</option>
                        <option value="6GB">6GB</option>
                        <option value="8GB">8GB</option>
                        <option value="10GB">10GB</option>
                        <option value="12GB">12GB</option>
                        <option value="16GB">16GB</option>
                        <option value="24GB">24GB</option>
                        <option value="32GB">32GB</option>
                        <option value="64GB">64GB</option>
                        <option value="+64GB">+64GB</option>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Tipo Almacenamiento</label>
                      <Select value={eq.posStorageType} onChange={(e) => updateField("posStorageType", e.target.value)} className={selectClass}>
                        <option value="">Seleccionar</option>
                        <option value="HDD">HDD</option>
                        <option value="SSD">SSD</option>
                        <option value="NVMe">NVMe</option>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Capacidad Almacenamiento</label>
                      <Select value={eq.posStorageCapacity} onChange={(e) => updateField("posStorageCapacity", e.target.value)} className={selectClass}>
                        <option value="">Seleccionar</option>
                        <option value="32GB">32GB</option>
                        <option value="64GB">64GB</option>
                        <option value="128GB">128GB</option>
                        <option value="256GB">256GB</option>
                        <option value="512GB">512GB</option>
                        <option value="1TB">1TB</option>
                        <option value="2TB">2TB</option>
                        <option value="4TB">4TB</option>
                        <option value="6TB">6TB</option>
                        <option value="8TB">8TB</option>
                        <option value="10TB">10TB</option>
                        <option value="12TB">12TB</option>
                        <option value="16TB">16TB</option>
                        <option value="20TB">20TB</option>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Sistema Operativo</label>
                      <Select value={eq.posOs} onChange={(e) => updateField("posOs", e.target.value)} className={selectClass}>
                        <option value="">Seleccionar</option>
                        <option value="Windows 7">Windows 7</option>
                        <option value="Windows 8">Windows 8</option>
                        <option value="Windows 8.1">Windows 8.1</option>
                        <option value="Windows 10">Windows 10</option>
                        <option value="Windows 10 Pro">Windows 10 Pro</option>
                        <option value="Windows 10 Enterprise">Windows 10 Enterprise</option>
                        <option value="Windows 11">Windows 11</option>
                        <option value="Windows 11 Pro">Windows 11 Pro</option>
                        <option value="Windows 11 Enterprise">Windows 11 Enterprise</option>
                        <option value="Windows Server 2012">Windows Server 2012</option>
                        <option value="Windows Server 2016">Windows Server 2016</option>
                        <option value="Windows Server 2019">Windows Server 2019</option>
                        <option value="Windows Server 2022">Windows Server 2022</option>
                        <option value="Linux">Linux</option>
                        <option value="macOS">macOS</option>
                        <option value="Chrome OS">Chrome OS</option>
                        <option value="FreeDOS">FreeDOS</option>
                        <option value="Otro">Otro</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/50">Observaciones del Equipo</label>
                    <textarea value={eq.posNotes} onChange={(e) => updateField("posNotes", e.target.value)} placeholder="Notas adicionales sobre el equipo POS..." className={textareaClass + " min-h-[100px]"} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <span className="text-sm font-medium text-gray-700 dark:text-white">¿El equipo {typeLabels[eq.type] || ""} aplica para la instalación?</span>
              <Switch checked={eq.applies} onChange={(e) => updateField("applies", e.target.checked)} />
            </div>
          </>)}
        </div>
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-gray-900">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={() => {
            if (!eq.type) { toast.error("Seleccione el tipo de equipo"); return; }
            onSave(eq);
          }} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />{isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
