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
import { ConfirmDialog } from "@/components/ui/modal";
import {
  Loader2, Save, ArrowLeft, Building2, Wifi, Server, Camera,
  FileText, Upload, X, Plus, Network, Shield, Cpu, MapPin, Crosshair, ExternalLink, Trash2, Pencil, Eye, Code,
  CheckCircle2, AlertTriangle, XCircle, Lock,
} from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";
import { SignaturePad } from "@/components/ui/signature-pad";

type Company = { id: number; name: string; taxId: string | null };
type Branch = { id: number; name: string };

export type ReportData = {
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
  speedDownload: string;
  speedUpload: string;
  speedLatency: string;
  speedConnectionType: string;
  speedIsp: string;
  speedIp: string;
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
  swDevType: string;
  swDevPlatform: string;
  swDevFeatures: string;
  swDevUserRoles: string;
  swDevIntegrations: string;
  swDevHosting: string;
  swDevDomain: string;
  swDevSSL: boolean;
  swDevDatabase: string;
  swDevDesignReqs: string;
  swDevMobileResponsive: boolean;
  swDevBranding: boolean;
  swDevSecurityReqs: string;
  swDevAuthType: string;
  swDevVersionControl: string;
  swDevCICD: boolean;
  swDevTesting: string;
  swDevBudget: string;
  swDevMaintenance: string;
  swDevDocumentation: string;
  swDevAdditionalNotes: string;
  secExistingSystem: string;
  secType: string;
  secCameraCount: string;
  secCameraType: string;
  secCameraResolution: string;
  secCameraBrand: string;
  secCameraCondition: string;
  secDvrNvrType: string;
  secDvrNvrBrand: string;
  secStorageDays: string;
  secCablingType: string;
  secPowerSupply: string;
  secMonitoringLocation: string;
  secAreasToCover: string;
  secAreasCovered: string;
  secBlindSpots: string;
  secNightVision: boolean;
  secRemoteAccess: boolean;
  secAlarmIntegration: boolean;
  secAccessControl: boolean;
  secAdditionalNotes: string;
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
  videos: { name: string; url: string; size: number; type: string }[];
  documents: { name: string; url: string; size: number; type: string }[];
  technicianSignature: string | null;
  clientSignature: string | null;
  clientName: string;
  clientDocType: string;
  clientDocNumber: string;
  clientPosition: string;
  technicianSignatureLocked: boolean;
  clientSignatureLocked: boolean;
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
  speedDownload: "",
  speedUpload: "",
  speedLatency: "",
  speedConnectionType: "",
  speedIsp: "",
  speedIp: "",
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
  swDevType: "",
  swDevPlatform: "",
  swDevFeatures: "",
  swDevUserRoles: "",
  swDevIntegrations: "",
  swDevHosting: "",
  swDevDomain: "",
  swDevSSL: false,
  swDevDatabase: "",
  swDevDesignReqs: "",
  swDevMobileResponsive: false,
  swDevBranding: false,
  swDevSecurityReqs: "",
  swDevAuthType: "",
  swDevVersionControl: "",
  swDevCICD: false,
  swDevTesting: "",
  swDevBudget: "",
  swDevMaintenance: "",
  swDevDocumentation: "",
  swDevAdditionalNotes: "",
  secExistingSystem: "",
  secType: "",
  secCameraCount: "",
  secCameraType: "",
  secCameraResolution: "",
  secCameraBrand: "",
  secCameraCondition: "",
  secDvrNvrType: "",
  secDvrNvrBrand: "",
  secStorageDays: "",
  secCablingType: "",
  secPowerSupply: "",
  secMonitoringLocation: "",
  secAreasToCover: "",
  secAreasCovered: "",
  secBlindSpots: "",
  secNightVision: false,
  secRemoteAccess: false,
  secAlarmIntegration: false,
  secAccessControl: false,
  secAdditionalNotes: "",
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
  videos: [],
  documents: [],
  technicianSignature: null,
  clientSignature: null,
  clientName: "",
  clientDocType: "V",
  clientDocNumber: "",
  clientPosition: "",
  technicianSignatureLocked: false,
  clientSignatureLocked: false,
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

export default function TechnicalReportForm({ existingData, readOnly = false }: { existingData?: ReportData & { id: number }; readOnly?: boolean }) {
  const router = useRouter();
  const isEdit = !!existingData;
  const isFinalized = readOnly || (existingData?.status === "SUBMITTED");
  const [data, setData] = useState<ReportData>(existingData || initialData);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companyDetails, setCompanyDetails] = useState<{ taxId: string | null; taxIdType: string | null; address: string | null; phone: string | null; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lockedTec, setLockedTec] = useState(existingData?.technicianSignatureLocked ?? false);
  const [lockedClient, setLockedClient] = useState(existingData?.clientSignatureLocked ?? false);
  const [loggedUser, setLoggedUser] = useState<{ name: string | null; docType: string | null; docNumber: string | null } | null>(null);
  const [locating, setLocating] = useState(false);
  const [savedEquipmentIdx, setSavedEquipmentIdx] = useState<number | null>(null);
  const [equipmentFormOpen, setEquipmentFormOpen] = useState(false);
  const [editingEquipmentIdx, setEditingEquipmentIdx] = useState<number | null>(null);
  const [newEquipment, setNewEquipment] = useState({ type: "", applies: false, brand: "", model: "", serialNumber: "", quantity: "", condition: "", status: "", specs: "", posProcessor: "", posRam: "", posStorageType: "", posStorageCapacity: "", posOs: "", posNotes: "" });
  const [speedTesting, setSpeedTesting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [speedResult, setSpeedResult] = useState<{ download: string; upload: string; latency: string; connection: string; isp: string; ip: string } | null>(
    existingData?.speedDownload ? { download: existingData.speedDownload, upload: existingData.speedUpload || "N/A", latency: existingData.speedLatency || "", connection: existingData.speedConnectionType || "", isp: existingData.speedIsp || "", ip: existingData.speedIp || "" } : null
  );
  const [speedStatus, setSpeedStatus] = useState<"idle" | "success" | "error">("idle");

  type DiagnosticResult = { status: "APPLIES" | "DOES_NOT_APPLY" | "APPLIES_WITH_OBSERVATIONS"; sections: { name: string; status: "OK" | "WARNING" | "CRITICAL"; message: string }[] };
  function computeDiagnostic(): DiagnosticResult {
    const sections: DiagnosticResult["sections"] = [];
    const hasInspectionTypes = data.inspectionTypes.length > 0;
    const hasCompany = !!data.companyId;
    const hasContact = !!(data.contactName && data.contactPhone);
    if (!hasCompany) sections.push({ name: "Empresa", status: "CRITICAL", message: "No se ha seleccionado empresa" });
    if (!hasContact) sections.push({ name: "Contacto", status: "WARNING", message: "Falta información de contacto" });
    if (!hasInspectionTypes) sections.push({ name: "Tipos de Inspección", status: "CRITICAL", message: "No se han seleccionado tipos de inspección" });
    const hasEquipment = data.equipment.length > 0;
    const eqApplies = data.equipment.filter(e => e.applies);
    const eqNotApplies = data.equipment.filter(e => !e.applies);
    const eqLabel = (e: typeof data.equipment[0]) => e.brand ? `${e.type} (${e.brand})` : e.type;
    if (!hasEquipment) sections.push({ name: "Equipos", status: "WARNING", message: "No hay equipos registrados" });
    else if (eqApplies.length === 0) {
      const names = data.equipment.map(eqLabel).join(", ");
      sections.push({ name: "Equipos", status: "CRITICAL", message: `Ninguno aplica: ${names}` });
    }
    else if (eqNotApplies.length > 0) {
      const notNames = eqNotApplies.map(eqLabel).join(", ");
      sections.push({ name: "Equipos", status: "WARNING", message: `${eqApplies.length} de ${data.equipment.length} aplican. No aplican: ${notNames}` });
    }
    else sections.push({ name: "Equipos", status: "OK", message: `Todos los ${eqApplies.length} equipos aplican` });
    if (!data.connectionType) sections.push({ name: "Infraestructura", status: "WARNING", message: "No se ha especificado tipo de conexión" });
    else sections.push({ name: "Infraestructura", status: "OK", message: "Infraestructura documentada" });
    if (!data.bandwidth) sections.push({ name: "Ancho de Banda", status: "WARNING", message: "No se ha medido el ancho de banda" });
    else sections.push({ name: "Ancho de Banda", status: "OK", message: `Ancho de banda: ${data.bandwidth}` });
    if (data.inspectionTypes.includes("TELECOM_NETWORK")) {
      if (!data.netCurrentTopology) sections.push({ name: "Red de Telecomunicaciones", status: "WARNING", message: "Topología de red no especificada" });
      else sections.push({ name: "Red de Telecomunicaciones", status: "OK", message: "Red documentada" });
    }
    if (data.inspectionTypes.includes("SOFTWARE_DEV")) {
      if (!data.swDevType) sections.push({ name: "Software / Desarrollo", status: "WARNING", message: "Tipo de desarrollo no especificado" });
      else sections.push({ name: "Software / Desarrollo", status: "OK", message: "Requerimientos documentados" });
    }
    if (data.inspectionTypes.includes("SECURITY_ELECTRONIC")) {
      const hasCctv = !!data.cctvExistingSystem;
      if (!hasCctv) sections.push({ name: "Seguridad Física / CCTV", status: "WARNING", message: "Sistema CCTV no especificado" });
      else sections.push({ name: "Seguridad Física / CCTV", status: "OK", message: "Sistema CCTV documentado" });
    }
    if (!data.supType) sections.push({ name: "Soporte Técnico", status: "WARNING", message: "Tipo de soporte no especificado" });
    else sections.push({ name: "Soporte Técnico", status: "OK", message: "Soporte técnico documentado" });
    const criticals = sections.filter(s => s.status === "CRITICAL").length;
    const warnings = sections.filter(s => s.status === "WARNING").length;
    let status: DiagnosticResult["status"] = "APPLIES";
    if (criticals > 0) status = "DOES_NOT_APPLY";
    else if (warnings > 2) status = "APPLIES_WITH_OBSERVATIONS";
    return { status, sections };
  }

  const diagnostic = computeDiagnostic();

  const types = data.inspectionTypes;
  const hasType = (t: string) => types.includes("ALL") || types.includes(t);
  const showGeneral = types.length > 0;
  const showEquipment = types.length > 0;
  const showInfrastructure = types.length > 0 && !(types.length === 1 && types[0] === "TECH_SUPPORT");
  const showSoftwareDev = hasType("SOFTWARE_DEV");
  const showTelecom = hasType("TELECOM_NETWORK");
  const showSoporte = hasType("TECH_SUPPORT");
  const showSecurity = hasType("SECURITY_ELECTRONIC");
  const showDescription = types.length > 0;
  const showDiagnostic = types.length > 0;
  const showFiles = types.length > 0;
  const showSignatures = types.length > 0;

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
      setData((prev) => ({ ...prev, speedDownload: mbps, speedUpload: uploadMbps, speedLatency: latency, speedConnectionType: connLabel, speedIsp: isp, speedIp: ip }));
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
    fetch("/api/auth/me").then((r) => r.json()).then((json) => {
      if (json && !json.error) setLoggedUser({ name: json.name || null, docType: json.docType || null, docNumber: json.docNumber || null });
    }).catch(() => {});
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

  const ALL_TYPES = ["SOFTWARE_DEV", "TELECOM_NETWORK", "SECURITY_ELECTRONIC", "TECH_SUPPORT", "OTHER"];

  function toggleInspectionType(type: string) {
    setData((prev) => {
      const current = prev.inspectionTypes;
      let updated: string[];
      if (type === "ALL") {
        updated = current.includes("ALL") ? [] : ["ALL", ...ALL_TYPES];
      } else {
        updated = current.includes(type) ? current.filter((t) => t !== type && t !== "ALL") : [...current.filter((t) => t !== "ALL"), type];
        if (updated.length === ALL_TYPES.length) updated = ["ALL", ...ALL_TYPES];
      }
      return { ...prev, inspectionTypes: updated, reportType: updated[0] || "TELECOM_NETWORK" };
    });
  }

  async function handleUpload(files: FileList | null, field: "blueprints" | "photos" | "videos" | "documents") {
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

  function removeFile(field: "blueprints" | "photos" | "videos" | "documents", index: number) {
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

  function buildPayload(statusOverride?: string) {
    const company = companies.find((c) => c.id === Number(data.companyId));
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
    const autoTitle = isEdit ? data.title : `Inspección - ${company?.name || "Empresa"} - ${dateStr}`;
    return {
      ...data,
      inspectionTypes: data.inspectionTypes,
      reportType: (data.inspectionTypes.includes("ALL") ? "OTHER" : data.inspectionTypes[0]) || "OTHER",
      branchId: data.branchId || null,
      title: autoTitle,
      status: statusOverride || (isEdit ? data.status : "DRAFT"),
      qualification: isEdit ? data.qualification : "PENDING",
    };
  }

  async function saveReport(payload: Record<string, unknown>, isDraft = false) {
    setLoading(true);
    try {
      const url = isEdit ? `/api/technical-reports/${existingData.id}` : "/api/technical-reports";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        const report = await res.json();
        toast.success(isDraft ? "Borrador guardado" : (isEdit ? "Inspección actualizada" : "Inspección creada"));
        router.push(`/technical-reports/${report.id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al guardar inspección");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/technical-reports/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Inspección eliminada");
        router.push("/technical-reports");
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al eliminar");
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function handleDraft() {
    if (!data.companyId || data.inspectionTypes.length === 0) {
      toast.error("Seleccione empresa y al menos un tipo de inspección");
      return;
    }
    saveReport(buildPayload("DRAFT"), true);
  }

  function getMissingFields(): string[] {
    const missing: string[] = [];
    const types = data.inspectionTypes;
    const hasType = (t: string) => types.includes("ALL") || types.includes(t);
    const showInfrastructure = types.length > 0 && !(types.length === 1 && types[0] === "TECH_SUPPORT");

    const req = (label: string, val: unknown) => { if (!val || (typeof val === "string" && !val.trim())) missing.push(label); };

    req("Nombre del Contacto", data.contactName);
    req("Teléfono del Contacto", data.contactPhone);
    req("Ubicación GPS", data.gmapUrl);

    if (data.equipment.length === 0) missing.push("Al menos un equipo registrado");
    else {
      const noAplica = data.equipment.filter((e) => !e.applies);
      if (noAplica.length === data.equipment.length) missing.push("Al menos un equipo debe aplicar");
    }

    if (showInfrastructure) {
      req("Tipo de Conexión", data.connectionType);
      req("Ancho de Banda", data.bandwidth);
      req("Suministro Eléctrico", data.powerSupply);
      req("Observaciones de Infraestructura", data.physicalSecurity);
    }

    if (hasType("SOFTWARE_DEV")) {
      req("Tipo de Desarrollo", data.swDevType);
      req("Plataforma", data.swDevPlatform);
      req("Funcionalidades Requeridas", data.swDevFeatures);
      req("Roles de Usuario", data.swDevUserRoles);
      req("Tipo de Hosting", data.swDevHosting);
      req("Base de Datos", data.swDevDatabase);
      req("Requisitos de Diseño", data.swDevDesignReqs);
      req("Requisitos de Seguridad", data.swDevSecurityReqs);
      req("Presupuesto Estimado (SW)", data.swDevBudget);
      req("Mantenimiento", data.swDevMaintenance);
      req("Documentación", data.swDevDocumentation);
    }

    if (hasType("TELECOM_NETWORK")) {
      req("Detalles Switch/Router", data.switchRouterDetails);
      req("Requisitos UPS", data.upsRequirements);
    }

    if (hasType("TECH_SUPPORT")) {
      req("Tipo de Soporte", data.supType);
      req("Servicios Requeridos", data.supRequiredServices);
      req("Expectativas del Cliente", data.supClientExpectations);
      req("Rango de Presupuesto", data.supBudgetRange);
      req("Duración del Contrato", data.supContractDuration);
    }

    if (hasType("SECURITY_ELECTRONIC")) {
      req("Sistema Existente", data.secExistingSystem);
      req("Tipo de Seguridad", data.secType);
      req("Áreas a Cubrir", data.secAreasToCover);
      req("Ubicación de Monitoreo", data.secMonitoringLocation);
    }

    req("Descripción / Contenido", data.content);
    req("Hallazgos", data.findings);
    req("Recomendaciones", data.recommendations);

    req("Nombre del Cliente", data.clientName);
    req("Cédula del Cliente", data.clientDocNumber);
    req("Cargo del Cliente", data.clientPosition);
    if (!data.technicianSignature) missing.push("Firma del Técnico");
    if (!data.clientSignature) missing.push("Firma del Cliente");

    return missing;
  }

  function handleSubmit() {
    if (!data.companyId || data.inspectionTypes.length === 0) {
      toast.error("Seleccione empresa y al menos un tipo de inspección");
      return;
    }
    const missing = getMissingFields();
    if (missing.length > 0) {
      toast.error(`Faltan ${missing.length} campo(s) obligatorio(s):`, { duration: 8000 });
      missing.forEach((f) => toast.warning(f, { duration: 6000 }));
      return;
    }
    saveReport(buildPayload("SUBMITTED"));
  }

  const inputClass = "h-9 rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white";
  const selectClass = "h-9 rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white";
  const textareaClass = "rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white min-h-[80px] resize-y";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isFinalized ? "Inspección Finalizada" : (isEdit ? "Editar Inspección" : "Nueva Inspección Técnica")}
        subtitle="Levantamiento de información en campo"
        actions={
          isFinalized ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
              <Button variant="outline" onClick={handleDraft} disabled={loading} className="gap-1.5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Borrador
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isEdit ? "Actualizar" : "Crear Informe"}
              </Button>
            </div>
          )
        }
      />

      {isFinalized && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
          <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Esta inspección está finalizada. Solo puede visualizar o eliminar.</p>
        </div>
      )}

      <div className={isFinalized ? "pointer-events-none select-none opacity-80" : ""}>

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
            {data.companyId && (
              <Field label="Sucursal">
                <Select value={data.branchId} onChange={(e) => update("branchId", e.target.value)} className={selectClass} disabled={branches.length === 0}>
                  {branches.length > 0 ? (
                    <>
                      <option value="">Matriz (sin sucursal)</option>
                      {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </>
                  ) : (
                    <option value="">No hay sucursales</option>
                  )}
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
                  { value: "ALL", label: "Todos" },
                  { value: "SOFTWARE_DEV", label: "Software, Desarrollo Web o APP" },
                  { value: "TELECOM_NETWORK", label: "Red de Telecomunicaciones" },
                  { value: "SECURITY_ELECTRONIC", label: "Seguridad Electrónica" },
                  { value: "TECH_SUPPORT", label: "Soporte Técnico" },
                  { value: "OTHER", label: "Otro" },
                ]}
                value={data.inspectionTypes}
                onChange={(v) => setData((prev) => ({ ...prev, inspectionTypes: v, reportType: v[0] || "" }))}
                placeholder="Seleccionar tipos..."
              />
            </Field>
          </div>
          {data.inspectionTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-navy-400 dark:text-white/30 mr-1">Secciones:</span>
              {[
                { show: showGeneral, label: "Contacto" },
                { show: showEquipment, label: "Equipos" },
                { show: showInfrastructure, label: "Infraestructura" },
                { show: showSoftwareDev, label: "Software/Desarrollo" },
                { show: showTelecom, label: "Red Telecomunicaciones" },
                { show: showSecurity, label: "Seguridad Electrónica" },
                { show: showSoporte, label: "Soporte Técnico" },
                { show: showDescription, label: "Descripción" },
                { show: showDiagnostic, label: "Diagnóstico" },
                { show: showFiles, label: "Archivos" },
                { show: showSignatures, label: "Firmas" },
              ].filter(s => s.show).map(s => (
                <span key={s.label} className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{s.label}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact & Location */}
      {showGeneral && (
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
      )}

      {/* Equipment */}
      {showEquipment && (
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
      )}

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
          inspectionTypes={data.inspectionTypes}
        />
      )}

      {/* Infrastructure */}
      {showInfrastructure && (
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
      )}

      {/* Soporte Técnico */}
      {showSoporte && (
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
      )}

      {/* Seguridad Electrónica - Conditional */}
      {showSecurity && (
        <Card className="animate-fade-in-up animate-delay-3">
          <CardContent className="space-y-4 py-5">
            <SectionTitle icon={Shield} title="Seguridad Electrónica" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Sistema Actual">
                <Select value={data.secExistingSystem} onChange={(e) => update("secExistingSystem", e.target.value)} className={selectClass}>
                  <option value="">Seleccionar</option>
                  <option value="NONE">No tiene sistema</option>
                  <option value="ANALOG">Analógico</option>
                  <option value="IP">IP / Digital</option>
                  <option value="HYBRID">Híbrido</option>
                  <option value="UNKNOWN">No sabe</option>
                </Select>
              </Field>
              <Field label="Tipo de Seguridad">
                <Select value={data.secType} onChange={(e) => update("secType", e.target.value)} className={selectClass}>
                  <option value="">Seleccionar</option>
                  <option value="CCTV">CCTV / Videovigilancia</option>
                  <option value="ALARMS">Sistemas de Alarma</option>
                  <option value="ACCESS_CONTROL">Control de Acceso</option>
                  <option value="COMBINED">Combinado (CCTV + Alarma + Acceso)</option>
                  <option value="FIRE">Detección de Incendios</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </Field>
              <Field label="Ubicación del Monitoreo">
                <Input value={data.secMonitoringLocation} onChange={(e) => update("secMonitoringLocation", e.target.value)} placeholder="Ej: Recepción, Sala de control..." className={inputClass} />
              </Field>
            </div>

            {/* Cámaras */}
            <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-xs font-semibold text-blue-600 dark:text-blue-400">Cámaras</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Field label="Cantidad de Cámaras">
                  <Input type="number" value={data.secCameraCount} onChange={(e) => update("secCameraCount", e.target.value)} placeholder="0" className={inputClass} />
                </Field>
                <Field label="Tipo de Cámara">
                  <Select value={data.secCameraType} onChange={(e) => update("secCameraType", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="DOME">Domo</option>
                    <option value="BULLET">Bala</option>
                    <option value="PTZ">PTZ</option>
                    <option value="TURRET">Torreta</option>
                    <option value="FISHEYE">Ojo de Pez</option>
                    <option value="OTHER">Otro</option>
                  </Select>
                </Field>
                <Field label="Resolución">
                  <Select value={data.secCameraResolution} onChange={(e) => update("secCameraResolution", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="720P">720P</option>
                    <option value="1080P">1080P Full HD</option>
                    <option value="2K">2K / 4MP</option>
                    <option value="4K">4K / 8MP</option>
                    <option value="ANALOG">Analógico</option>
                  </Select>
                </Field>
                <Field label="Marca">
                  <Input value={data.secCameraBrand} onChange={(e) => update("secCameraBrand", e.target.value)} placeholder="Ej: Hikvision, Dahua..." className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Estado Físico">
                  <Select value={data.secCameraCondition} onChange={(e) => update("secCameraCondition", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="EXCELLENT">Excelente</option>
                    <option value="GOOD">Bueno</option>
                    <option value="FAIR">Regular</option>
                    <option value="POOR">Malo</option>
                    <option value="NOT_WORKING">No funciona</option>
                  </Select>
                </Field>
                <div className="flex items-center gap-3 pt-5">
                  <Switch id="secNight" checked={data.secNightVision} onChange={(e) => update("secNightVision", e.target.checked)} label="Visión Nocturna" />
                </div>
                <Field label="Almacenamiento (días)">
                  <Input type="number" value={data.secStorageDays} onChange={(e) => update("secStorageDays", e.target.value)} placeholder="30" className={inputClass} />
                </Field>
              </div>
            </div>

            {/* DVR/NVR y Cableado */}
            <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-xs font-semibold text-blue-600 dark:text-blue-400">DVR/NVR y Cableado</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Field label="Tipo DVR/NVR">
                  <Select value={data.secDvrNvrType} onChange={(e) => update("secDvrNvrType", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="DVR">DVR (Analógico)</option>
                    <option value="NVR">NVR (IP)</option>
                    <option value="XVR">XVR (Híbrido)</option>
                    <option value="NONE">No tiene</option>
                  </Select>
                </Field>
                <Field label="Marca DVR/NVR">
                  <Input value={data.secDvrNvrBrand} onChange={(e) => update("secDvrNvrBrand", e.target.value)} placeholder="Marca" className={inputClass} />
                </Field>
                <Field label="Tipo de Cableado">
                  <Select value={data.secCablingType} onChange={(e) => update("secCablingType", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="COAXIAL">Coaxial</option>
                    <option value="UTP">UTP / Cat5e / Cat6</option>
                    <option value="FIBER">Fibra Óptica</option>
                    <option value="WIRELESS">Inalámbrico</option>
                    <option value="MIXED">Mixto</option>
                  </Select>
                </Field>
                <Field label="Fuente de Alimentación">
                  <Select value={data.secPowerSupply} onChange={(e) => update("secPowerSupply", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="POE">PoE</option>
                    <option value="ADAPTER">Adaptador / Fuente externa</option>
                    <option value="UPS">UPS dedicado</option>
                    <option value="BATTERY">Batería</option>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Cobertura */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Áreas por Cubrir">
                <textarea value={data.secAreasToCover} onChange={(e) => update("secAreasToCover", e.target.value)} placeholder="Entradas, estacionamiento, almacén, caja..." className={textareaClass + " min-h-[80px]"} />
              </Field>
              <Field label="Áreas Cubiertas">
                <textarea value={data.secAreasCovered} onChange={(e) => update("secAreasCovered", e.target.value)} placeholder="Áreas que ya tienen cobertura..." className={textareaClass + " min-h-[80px]"} />
              </Field>
              <Field label="Puntos Ciegos">
                <textarea value={data.secBlindSpots} onChange={(e) => update("secBlindSpots", e.target.value)} placeholder="Zonas sin cobertura actualmente..." className={textareaClass + " min-h-[80px]"} />
              </Field>
            </div>

            {/* Integraciones */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 pt-5">
                <Switch id="secRemote" checked={data.secRemoteAccess} onChange={(e) => update("secRemoteAccess", e.target.checked)} label="Acceso Remoto" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch id="secAlarm" checked={data.secAlarmIntegration} onChange={(e) => update("secAlarmIntegration", e.target.checked)} label="Integración con Alarma" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch id="secAccess" checked={data.secAccessControl} onChange={(e) => update("secAccessControl", e.target.checked)} label="Control de Acceso" />
              </div>
            </div>

            <Field label="Notas Adicionales" className="w-full">
              <textarea value={data.secAdditionalNotes} onChange={(e) => update("secAdditionalNotes", e.target.value)} placeholder="Cualquier información adicional sobre seguridad electrónica..." className={textareaClass + " min-h-[80px] w-full"} />
            </Field>
          </CardContent>
        </Card>
      )}

      {/* Telecom Network - Conditional */}
      {showTelecom && (
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
            <Field label="Detalles Switch/Router" className="w-full">
              <textarea value={data.switchRouterDetails} onChange={(e) => update("switchRouterDetails", e.target.value)} placeholder="Modelos, puertos, configuración..." className={textareaClass + " min-h-[100px] w-full"} />
            </Field>
            <Field label="Requisitos UPS" className="w-full">
              <textarea value={data.upsRequirements} onChange={(e) => update("upsRequirements", e.target.value)} placeholder="Capacidad, autonomía, marca..." className={textareaClass + " min-h-[100px] w-full"} />
            </Field>
          </CardContent>
        </Card>
      )}

      {/* Software Dev - Conditional */}
      {showSoftwareDev && (
        <Card className="animate-fade-in-up animate-delay-3">
          <CardContent className="space-y-4 py-5">
            <SectionTitle icon={Code} title="Desarrollo de Software, Web o APP" />

            {/* Tipo de Proyecto */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Tipo de Proyecto *">
                <Select value={data.swDevType} onChange={(e) => update("swDevType", e.target.value)} className={selectClass}>
                  <option value="">Seleccionar</option>
                  <option value="WEB">Sitio Web</option>
                  <option value="WEB_APP">Aplicación Web</option>
                  <option value="MOBILE_IOS">App Móvil iOS</option>
                  <option value="MOBILE_ANDROID">App Móvil Android</option>
                  <option value="MOBILE_BOTH">App Móvil (iOS + Android)</option>
                  <option value="DESKTOP">Aplicación de Escritorio</option>
                  <option value="API">API / Servicio</option>
                  <option value="FULL_SYSTEM">Sistema Completo</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </Field>
              <Field label="Plataforma / Tecnología">
                <Select value={data.swDevPlatform} onChange={(e) => update("swDevPlatform", e.target.value)} className={selectClass}>
                  <option value="">Seleccionar</option>
                  <option value="REACT">React / Next.js</option>
                  <option value="VUE">Vue.js / Nuxt</option>
                  <option value="ANGULAR">Angular</option>
                  <option value="FLUTTER">Flutter</option>
                  <option value="REACT_NATIVE">React Native</option>
                  <option value="NODE">Node.js</option>
                  <option value="PHP">PHP / Laravel</option>
                  <option value="PYTHON">Python / Django / Flask</option>
                  <option value="DOTNET">.NET / C#</option>
                  <option value="JAVA">Java / Spring</option>
                  <option value="WORDPRESS">WordPress</option>
                  <option value="SHOPIFY">Shopify</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </Field>
              <Field label="Cantidad de Usuarios">
                <Input type="number" value={data.erpUsers} onChange={(e) => update("erpUsers", e.target.value)} placeholder="0" className={inputClass} />
              </Field>
            </div>

            {/* Requerimientos Funcionales */}
            <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-xs font-semibold text-blue-600 dark:text-blue-400">Requerimientos Funcionales</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Sistemas Actuales">
                  <textarea value={data.currentSystems} onChange={(e) => update("currentSystems", e.target.value)} placeholder="Software actual, plataformas, tecnologías en uso..." className={textareaClass + " min-h-[80px]"} />
                </Field>
                <Field label="Módulos / Funcionalidades Necesarias">
                  <textarea value={data.swDevFeatures} onChange={(e) => update("swDevFeatures", e.target.value)} placeholder="Módulos, funcionalidades, features requeridas..." className={textareaClass + " min-h-[80px]"} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Roles de Usuario">
                  <textarea value={data.swDevUserRoles} onChange={(e) => update("swDevUserRoles", e.target.value)} placeholder="Admin, usuario, cliente, vendedor..." className={textareaClass} />
                </Field>
                <Field label="Integraciones Requeridas">
                  <textarea value={data.swDevIntegrations} onChange={(e) => update("swDevIntegrations", e.target.value)} placeholder="APIs, pasarelas de pago, ERPs, CRMs..." className={textareaClass} />
                </Field>
              </div>
            </div>

            {/* Infraestructura Técnica */}
            <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-xs font-semibold text-blue-600 dark:text-blue-400">Infraestructura Técnica</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Tipo de Hosting">
                  <Select value={data.swDevHosting} onChange={(e) => update("swDevHosting", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="CLOUD_AWS">AWS</option>
                    <option value="CLOUD_AZURE">Azure</option>
                    <option value="CLOUD_GCP">Google Cloud</option>
                    <option value="CLOUD_OTHER">Otro Cloud</option>
                    <option value="ON_PREMISE">On-Premise</option>
                    <option value="SHARED">Hosting Compartido</option>
                    <option value="VPS">VPS</option>
                    <option value="DEDICATED">Servidor Dedicado</option>
                    <option value="HYBRID">Híbrido</option>
                  </Select>
                </Field>
                <Field label="Base de Datos">
                  <Select value={data.swDevDatabase} onChange={(e) => update("swDevDatabase", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="POSTGRESQL">PostgreSQL</option>
                    <option value="MYSQL">MySQL</option>
                    <option value="MONGODB">MongoDB</option>
                    <option value="SQLSERVER">SQL Server</option>
                    <option value="ORACLE">Oracle</option>
                    <option value="FIREBASE">Firebase</option>
                    <option value="REDIS">Redis</option>
                    <option value="OTHER">Otra</option>
                  </Select>
                </Field>
                <Field label="Dominio">
                  <Input value={data.swDevDomain} onChange={(e) => update("swDevDomain", e.target.value)} placeholder="ej: miempresa.com" className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 pt-5">
                  <Switch id="ssl" checked={data.swDevSSL} onChange={(e) => update("swDevSSL", e.target.checked)} label="Certificado SSL" />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch id="responsive" checked={data.swDevMobileResponsive} onChange={(e) => update("swDevMobileResponsive", e.target.checked)} label="Diseño Responsive" />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch id="branding" checked={data.swDevBranding} onChange={(e) => update("swDevBranding", e.target.checked)} label="Requiere Branding" />
                </div>
              </div>
            </div>

            {/* Diseño y Seguridad */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Requisitos de Diseño / UI-UX">
                <textarea value={data.swDevDesignReqs} onChange={(e) => update("swDevDesignReqs", e.target.value)} placeholder="Estilo visual, colores, wireframes, prototipos..." className={textareaClass + " min-h-[80px]"} />
              </Field>
              <Field label="Requisitos de Seguridad">
                <textarea value={data.swDevSecurityReqs} onChange={(e) => update("swDevSecurityReqs", e.target.value)} placeholder="Autenticación, autorización, encriptación, GDPR..." className={textareaClass + " min-h-[80px]"} />
              </Field>
            </div>

            {/* Desarrollo y Calidad */}
            <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-xs font-semibold text-blue-600 dark:text-blue-400">Desarrollo y Calidad</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Autenticación">
                  <Select value={data.swDevAuthType} onChange={(e) => update("swDevAuthType", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="EMAIL">Email / Contraseña</option>
                    <option value="GOOGLE">Google OAuth</option>
                    <option value="FACEBOOK">Facebook Login</option>
                    <option value="SSO">SSO / Active Directory</option>
                    <option value="2FA">2FA / MFA</option>
                    <option value="BIOMETRIC">Biométrico</option>
                    <option value="MULTIPLE">Múltiples métodos</option>
                  </Select>
                </Field>
                <Field label="Control de Versiones">
                  <Select value={data.swDevVersionControl} onChange={(e) => update("swDevVersionControl", e.target.value)} className={selectClass}>
                    <option value="">Seleccionar</option>
                    <option value="GIT">Git</option>
                    <option value="GITHUB">GitHub</option>
                    <option value="GITLAB">GitLab</option>
                    <option value="BITBUCKET">Bitbucket</option>
                    <option value="SVN">SVN</option>
                  </Select>
                </Field>
                <div className="flex items-center gap-3 pt-5">
                  <Switch id="cicd" checked={data.swDevCICD} onChange={(e) => update("swDevCICD", e.target.checked)} label="CI/CD Automatizado" />
                </div>
              </div>
              <Field label="Tipos de Testing">
                <textarea value={data.swDevTesting} onChange={(e) => update("swDevTesting", e.target.value)} placeholder="Unitario, integración, E2E, load testing, QA manual..." className={textareaClass} />
              </Field>
            </div>

            {/* Presupuesto, Tiempo y Soporte */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Presupuesto Estimado">
                <Input value={data.swDevBudget} onChange={(e) => update("swDevBudget", e.target.value)} placeholder="Ej: $5,000 - $10,000" className={inputClass} />
              </Field>
              <Field label="Tiempo Estimado">
                <Input value={data.timelineExpectations} onChange={(e) => update("timelineExpectations", e.target.value)} placeholder="Ej: 3 meses" className={inputClass} />
              </Field>
              <div className="flex items-center gap-3 pt-5">
                <Switch id="migration" checked={data.dataMigration} onChange={(e) => update("dataMigration", e.target.checked)} label="Requiere Migración de Datos" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Soporte y Mantenimiento">
                <textarea value={data.swDevMaintenance} onChange={(e) => update("swDevMaintenance", e.target.value)} placeholder="SLA, tiempo de respuesta, canales de soporte..." className={textareaClass} />
              </Field>
              <Field label="Documentación Requerida">
                <textarea value={data.swDevDocumentation} onChange={(e) => update("swDevDocumentation", e.target.value)} placeholder="Técnica, usuario, API, manuales..." className={textareaClass} />
              </Field>
              <Field label="Capacitación">
                <textarea value={data.trainingRequirements} onChange={(e) => update("trainingRequirements", e.target.value)} placeholder="Áreas, usuarios, horarios..." className={textareaClass} />
              </Field>
            </div>

            <Field label="Notas Adicionales" className="w-full">
              <textarea value={data.swDevAdditionalNotes} onChange={(e) => update("swDevAdditionalNotes", e.target.value)} placeholder="Cualquier información adicional relevante..." className={textareaClass + " min-h-[80px] w-full"} />
            </Field>
          </CardContent>
        </Card>
      )}

      {/* Description & Findings */}
      {showDescription && (
      <Card className="animate-fade-in-up animate-delay-4">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Cpu} title="Descripción y Hallazgos" />
          <Field label="Descripción de la Inspección" className="w-full">
            <textarea value={data.content} onChange={(e) => update("content", e.target.value)} placeholder="Descripción general de la inspección..." className={textareaClass + " min-h-[120px] w-full"} />
          </Field>
          <Field label="Hallazgos" className="w-full">
            <textarea value={data.findings} onChange={(e) => update("findings", e.target.value)} placeholder="Observaciones de la inspección..." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>
          <Field label="Recomendaciones" className="w-full">
            <textarea value={data.recommendations} onChange={(e) => update("recommendations", e.target.value)} placeholder="Recomendaciones técnicas..." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>
          <Field label="Observaciones Adicionales" className="w-full">
            <textarea value={data.observations} onChange={(e) => update("observations", e.target.value)} placeholder="Notas adicionales..." className={textareaClass + " min-h-[100px] w-full"} />
          </Field>
        </CardContent>
      </Card>
      )}

      {/* Diagnóstico de Viabilidad */}
      {showDiagnostic && (
      <Card className="animate-fade-in-up animate-delay-6">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={CheckCircle2} title="Diagnóstico de Viabilidad" />
          <div className={`rounded-xl border p-4 ${
            diagnostic.status === "APPLIES" ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20" :
            diagnostic.status === "DOES_NOT_APPLY" ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20" :
            "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
          }`}>
            <div className="flex items-center gap-3">
              {diagnostic.status === "APPLIES" && <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />}
              {diagnostic.status === "DOES_NOT_APPLY" && <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />}
              {diagnostic.status === "APPLIES_WITH_OBSERVATIONS" && <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
              <div>
                <p className="text-lg font-bold text-navy-800 dark:text-white">
                  {diagnostic.status === "APPLIES" && "APLICA"}
                  {diagnostic.status === "DOES_NOT_APPLY" && "NO APLICA"}
                  {diagnostic.status === "APPLIES_WITH_OBSERVATIONS" && "APLICA CON OBSERVACIONES"}
                </p>
                <p className="text-xs text-navy-500 dark:text-white/50">
                  Escaneo automático de la inspección técnica
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-navy-100 dark:border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50 dark:border-white/10 dark:bg-white/5">
                  <th className="px-4 py-2 text-left font-medium text-navy-600 dark:text-white/70">Sección</th>
                  <th className="px-4 py-2 text-center font-medium text-navy-600 dark:text-white/70">Estado</th>
                  <th className="px-4 py-2 text-left font-medium text-navy-600 dark:text-white/70">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {diagnostic.sections.map((s, i) => (
                  <tr key={i} className="border-b border-navy-50 dark:border-white/5 last:border-0">
                    <td className="px-4 py-2 font-medium text-navy-700 dark:text-white/80">{s.name}</td>
                    <td className="px-4 py-2 text-center">
                      {s.status === "OK" && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="h-3 w-3" /> OK</span>}
                      {s.status === "WARNING" && <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><AlertTriangle className="h-3 w-3" /> Alerta</span>}
                      {s.status === "CRITICAL" && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="h-3 w-3" /> Crítico</span>}
                    </td>
                    <td className="px-4 py-2 text-navy-600 dark:text-white/60">{s.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Archivos Adjuntos */}
      {showFiles && (
      <Card className="animate-fade-in-up animate-delay-5">
        <CardContent className="space-y-4 py-5">
          <SectionTitle icon={Upload} title="Archivos Adjuntos" />

          {/* Fotos */}
          <div>
            <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-2">Fotos del Sitio</label>
            <div className="rounded-xl border-2 border-dashed border-navy-200 p-4 text-center transition-colors hover:border-blue-400 dark:border-white/10">
              <Upload className="mx-auto h-8 w-8 text-navy-300 dark:text-white/20" />
              <p className="mt-1 text-xs text-navy-400 dark:text-white/30">Imágenes (JPG, PNG, WebP)</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => document.querySelector<HTMLInputElement>('[data-upload="photos"]')?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}Seleccionar
              </Button>
              <input type="file" multiple accept="image/*" data-upload="photos" onChange={(e) => handleUpload(e.target.files, "photos")} className="hidden" />
            </div>
            {data.photos.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {data.photos.map((f, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-lg border border-navy-100 dark:border-white/10">
                    <img src={f.url} alt={f.name} className="h-24 w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />
                    <button onClick={() => removeFile("photos", i)} className="absolute right-1 top-1 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"><X className="h-3 w-3" /></button>
                    <p className="truncate px-1.5 py-0.5 text-[10px] text-navy-500 dark:text-white/40">{f.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos */}
          <div>
            <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-2">Videos</label>
            <div className="rounded-xl border-2 border-dashed border-navy-200 p-4 text-center transition-colors hover:border-blue-400 dark:border-white/10">
              <Upload className="mx-auto h-8 w-8 text-navy-300 dark:text-white/20" />
              <p className="mt-1 text-xs text-navy-400 dark:text-white/30">Videos (MP4, MOV, AVI, WebM)</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => document.querySelector<HTMLInputElement>('[data-upload="videos"]')?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}Seleccionar
              </Button>
              <input type="file" multiple accept="video/mp4,video/quicktime,video/x-msvideo,video/webm" data-upload="videos" onChange={(e) => handleUpload(e.target.files, "videos")} className="hidden" />
            </div>
            {data.videos.length > 0 && (
              <div className="mt-2 space-y-1">
                {data.videos.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-1.5 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                      <Camera className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-xs text-navy-600 dark:text-white/60 truncate max-w-[250px]">{f.name}</span>
                      <span className="text-[10px] text-navy-400 dark:text-white/30">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-blue-500"><Eye className="h-3 w-3" /></a>
                      <button onClick={() => removeFile("videos", i)} className="text-navy-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documentos */}
          <div>
            <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-2">Documentos (PDF, Excel, Word)</label>
            <div className="rounded-xl border-2 border-dashed border-navy-200 p-4 text-center transition-colors hover:border-blue-400 dark:border-white/10">
              <Upload className="mx-auto h-8 w-8 text-navy-300 dark:text-white/20" />
              <p className="mt-1 text-xs text-navy-400 dark:text-white/30">PDF, DOCX, XLSX, CSV</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => document.querySelector<HTMLInputElement>('[data-upload="documents"]')?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}Seleccionar
              </Button>
              <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" data-upload="documents" onChange={(e) => handleUpload(e.target.files, "documents")} className="hidden" />
            </div>
            {data.documents.length > 0 && (
              <div className="mt-2 space-y-1">
                {data.documents.map((f, i) => {
                  const isPdf = f.type.includes("pdf");
                  const isExcel = f.type.includes("sheet") || f.type.includes("excel") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls");
                  return (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-1.5 dark:bg-white/5">
                      <div className="flex items-center gap-2">
                        <FileText className={`h-3.5 w-3.5 ${isPdf ? "text-red-500" : isExcel ? "text-green-500" : "text-blue-500"}`} />
                        <span className="text-xs text-navy-600 dark:text-white/60 truncate max-w-[250px]">{f.name}</span>
                        <span className="text-[10px] text-navy-400 dark:text-white/30">({(f.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-blue-500"><Eye className="h-3 w-3" /></a>
                        <button onClick={() => removeFile("documents", i)} className="text-navy-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Planos */}
          <div>
            <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-2">Planos y Diagramas</label>
            <div className="rounded-xl border-2 border-dashed border-navy-200 p-4 text-center transition-colors hover:border-blue-400 dark:border-white/10">
              <Upload className="mx-auto h-8 w-8 text-navy-300 dark:text-white/20" />
              <p className="mt-1 text-xs text-navy-400 dark:text-white/30">PDF, DWG, DXF, imágenes</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => document.querySelector<HTMLInputElement>('[data-upload="blueprints"]')?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}Seleccionar
              </Button>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf" data-upload="blueprints" onChange={(e) => handleUpload(e.target.files, "blueprints")} className="hidden" />
            </div>
            {data.blueprints.length > 0 && (
              <div className="mt-2 space-y-1">
                {data.blueprints.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-1.5 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs text-navy-600 dark:text-white/60 truncate max-w-[250px]">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-blue-500"><Eye className="h-3 w-3" /></a>
                      <button onClick={() => removeFile("blueprints", i)} className="text-navy-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </CardContent>
      </Card>
      )}

      {/* Firmas */}
      {showSignatures && (
      <Card className="animate-fade-in-up animate-delay-7">
        <CardContent className="space-y-6 py-5">
          <SectionTitle icon={Pencil} title="Firmas" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Firma del Técnico */}
            {lockedTec ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-navy-700 dark:text-white/80">Firma del Técnico</label>
                    {loggedUser && <p className="text-xs text-navy-500 dark:text-white/40">{loggedUser.name || "Sin nombre"}{loggedUser.docType && loggedUser.docNumber ? ` — ${loggedUser.docType}-${loggedUser.docNumber}` : ""}</p>}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"><Lock className="h-3 w-3" />Aceptada</span>
                </div>
                <div className="rounded-xl border-2 border-green-400 dark:border-green-600 bg-white dark:bg-white/[0.02] p-2">
                  <img src={data.technicianSignature || ""} alt="Firma del técnico" className="w-full h-auto max-h-40 object-contain" />
                </div>
                <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Firma aceptada y bloqueada — Solo consulta</p>
              </div>
            ) : (
              <SignaturePad
                label="Firma del Técnico"
                value={data.technicianSignature}
                onChange={(v) => update("technicianSignature", v)}
                locked={lockedTec}
                onLock={() => { if (!lockedTec) { setLockedTec(true); update("technicianSignatureLocked", true); } }}
                subtitle={loggedUser ? `${loggedUser.name || "Sin nombre"}${loggedUser.docType && loggedUser.docNumber ? ` — ${loggedUser.docType}-${loggedUser.docNumber}` : ""}` : undefined}
              />
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Nombre Completo *">
                  <Input value={data.clientName} onChange={(e) => update("clientName", e.target.value)} placeholder="Nombre del cliente" className={inputClass} disabled={lockedClient} />
                </Field>
                <Field label="Cédula de Identidad">
                  <div className="flex gap-2">
                    <Select value={data.clientDocType} onChange={(e) => update("clientDocType", e.target.value)} className="w-20" disabled={lockedClient}>
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="J">J</option>
                      <option value="G">G</option>
                    </Select>
                    <Input value={data.clientDocNumber} onChange={(e) => update("clientDocNumber", e.target.value)} placeholder="12345678" className={inputClass} disabled={lockedClient} />
                  </div>
                </Field>
                <Field label="Cargo">
                  <Input value={data.clientPosition} onChange={(e) => update("clientPosition", e.target.value)} placeholder="Gerente, Coordinador..." className={inputClass} disabled={lockedClient} />
                </Field>
              </div>
              {/* Firma del Cliente */}
              {lockedClient ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-navy-700 dark:text-white/80">Firma del Cliente</label>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"><Lock className="h-3 w-3" />Aceptada</span>
                  </div>
                  <div className="rounded-xl border-2 border-green-400 dark:border-green-600 bg-white dark:bg-white/[0.02] p-2">
                    <img src={data.clientSignature || ""} alt="Firma del cliente" className="w-full h-auto max-h-40 object-contain" />
                  </div>
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Firma aceptada y bloqueada — Solo consulta</p>
                </div>
              ) : (
                <SignaturePad
                  label="Firma del Cliente"
                  value={data.clientSignature}
                  onChange={(v) => update("clientSignature", v)}
                  locked={lockedClient}
                onLock={() => {
                  if (!lockedClient) {
                    if (!data.clientName?.trim()) { toast.error("Ingrese el nombre completo del cliente"); return; }
                    if (!data.clientDocNumber?.trim()) { toast.error("Ingrese la cédula de identidad del cliente"); return; }
                    if (!data.clientPosition?.trim()) { toast.error("Ingrese el cargo del cliente"); return; }
                    if (!data.clientSignature) { toast.error("Dibuje la firma del cliente primero"); return; }
                    setLockedClient(true);
                    update("clientSignatureLocked", true);
                  }
                }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      </div>

      {/* Submit - outside pointer-events-none wrapper */}
      {isFinalized ? (
        <div className="flex justify-between items-center pb-8">
          <Button variant="destructive" onClick={() => { if (existingData?.id) setDeleteId(existingData.id); }} disabled={loading} className="gap-1.5">
            <Trash2 className="h-4 w-4" />Eliminar
          </Button>
          <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
        </div>
      ) : (
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Cancelar</Button>
          <Button variant="outline" onClick={handleDraft} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Borrador
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEdit ? "Actualizar Inspección" : "Crear Inspección"}
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Inspección"
        message="¿Estás seguro de eliminar esta inspección técnica? Esta acción no se puede deshacer."
        confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
        loading={deleting}
      />
    </div>
  );
}

const defaultEq = { type: "", applies: false, brand: "", model: "", serialNumber: "", quantity: "", condition: "", status: "", specs: "", posProcessor: "", posRam: "", posStorageType: "", posStorageCapacity: "", posOs: "", posNotes: "" };

function EquipmentFormModal({ isEditing, initial, onSave, onClose, inspectionTypes }: { isEditing: boolean; initial: Record<string, unknown>; onSave: (eq: typeof defaultEq) => void; onClose: () => void; inspectionTypes: string[] }) {
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
              {inspectionTypes.includes("SOFTWARE_DEV") ? (
                <>
                  <option value="POS">Caja / POS</option>
                  <option value="SERVER">Servidor</option>
                  <option value="FISCAL_PRINTER">Impresora Fiscal</option>
                </>
              ) : (
                <>
                  <option value="POS">Caja / POS</option>
                  <option value="SERVER">Servidor</option>
                  <option value="FISCAL_PRINTER">Impresora Fiscal</option>
                  <option value="SWITCH">Switch / Router</option>
                  <option value="UPS">UPS / Regulador</option>
                  <option value="OTHER">Otro</option>
                </>
              )}
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
