"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { Loader2, ArrowLeft, Pencil, FileText, Building2, Wifi, Server, Code, Network, Shield, Upload, ExternalLink, Cpu, MapPin, Phone, Camera, Video, PenTool, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";

type FileEntry = { name: string; url: string; size?: number; type?: string };

type EquipmentEntry = {
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
};

type ReportDetail = {
  id: number;
  title: string;
  reportType: string;
  status: string;
  qualification: string;
  inspectionTypes: string | null;
  companyId: number;
  company: {
    id: number;
    name: string;
    taxId: string | null;
    taxIdType: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    state: string | null;
    municipality: string | null;
  };
  branch: { id: number; name: string } | null;
  creator: { id: number; name: string | null; email: string };
  visit: { id: number; type: string; scheduledDate: string | null; notes: string | null } | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  gmapUrl: string | null;
  connectionType: string | null;
  bandwidth: string | null;
  speedDownload: string | null;
  speedUpload: string | null;
  speedLatency: string | null;
  speedConnectionType: string | null;
  speedIsp: string | null;
  speedIp: string | null;
  powerSupply: string | null;
  airConditioning: boolean | null;
  airConditioningDetails: string | null;
  physicalSecurity: string | null;
  cctvExistingSystem: string | null;
  cctvCameraCount: number | null;
  cctvCameraType: string | null;
  cctvCameraResolution: string | null;
  cctvCameraBrand: string | null;
  cctvCameraCondition: string | null;
  cctvDvrNvrBrand: string | null;
  cctvDvrNvrChannels: string | null;
  cctvStorageCapacity: string | null;
  cctvRetentionDays: string | null;
  cctvCablingType: string | null;
  cctvCablingLength: number | null;
  cctvPowerSupply: string | null;
  cctvMonitoringLocation: string | null;
  cctvAreasToCover: string | null;
  cctvAreasCovered: string | null;
  cctvBlindSpots: string | null;
  cctvInstallationType: string | null;
  cctvNightVision: boolean;
  cctvRemoteAccess: boolean;
  cctvAlarmIntegration: boolean;
  cctvAccessControl: boolean;
  cctvMountingLocations: string | null;
  cctvLightingConditions: string | null;
  cctvWeatherExposure: string | null;
  cctvNetworkBandwidth: string | null;
  cctvAdditionalNotes: string | null;
  netCurrentTopology: string | null;
  netCurrentBandwidth: string | null;
  netCurrentIsp: string | null;
  netCurrentRouter: string | null;
  netCurrentSwitch: string | null;
  netCurrentFirewall: string | null;
  netCurrentWifiAp: string | null;
  netCurrentCabling: string | null;
  netCurrentServerRoom: string | null;
  netCurrentIssues: string | null;
  netRequiredTopology: string | null;
  netRequiredBandwidth: string | null;
  netRequiredEquipment: string | null;
  netRequiredCabling: string | null;
  netRequiredSecurity: string | null;
  netRequiredVpn: boolean;
  netRequiredWifi: boolean;
  netRequiredVoip: boolean;
  netRequiredBackup: boolean;
  netRequiredMonitoring: boolean;
  netWifiCoverage: string | null;
  netWifiZones: string | null;
  netVlanNeeds: string | null;
  netRemoteAccessNeeds: string | null;
  netBackupStrategy: string | null;
  netMaintenanceNeeds: string | null;
  netAdditionalNotes: string | null;
  supType: string | null;
  supRemoteHours: string | null;
  supOnSiteHours: string | null;
  supScheduleDays: string | null;
  supScheduleTimeStart: string | null;
  supScheduleTimeEnd: string | null;
  supResponseTime: string | null;
  supCurrentEquipBrand: string | null;
  supCurrentEquipModel: string | null;
  supCurrentEquipQty: string | null;
  supCurrentEquipCondition: string | null;
  supCurrentEquipWarranty: string | null;
  supCurrentSoftware: string | null;
  supCurrentIssues: string | null;
  supRequiredServices: string | null;
  supRequiredCoverage: string | null;
  supRequiredSlA: string | null;
  supRequiredTraining: boolean;
  supRequiredDocumentation: boolean;
  supRequiredInventory: boolean;
  supRequiredOnSiteVisit: boolean;
  supRequiredRemoteAccess: boolean;
  supClientExpectations: string | null;
  supBudgetRange: string | null;
  supContractDuration: string | null;
  supAdditionalNotes: string | null;
  telecomNodes: number | null;
  telecomServers: number | null;
  telecomRacks: number | null;
  cablingType: string | null;
  fiberDistanceM: number | null;
  networkTopology: string | null;
  switchRouterDetails: string | null;
  upsRequirements: string | null;
  currentSystems: string | null;
  erpUsers: number | null;
  erpModules: string | null;
  timelineExpectations: string | null;
  dataMigration: boolean | null;
  trainingRequirements: string | null;
  swDevType: string | null;
  swDevPlatform: string | null;
  swDevFeatures: string | null;
  swDevUserRoles: string | null;
  swDevIntegrations: string | null;
  swDevHosting: string | null;
  swDevDomain: string | null;
  swDevSSL: boolean;
  swDevDatabase: string | null;
  swDevDesignReqs: string | null;
  swDevMobileResponsive: boolean;
  swDevBranding: boolean;
  swDevSecurityReqs: string | null;
  swDevAuthType: string | null;
  swDevVersionControl: string | null;
  swDevCICD: boolean;
  swDevTesting: string | null;
  swDevBudget: string | null;
  swDevMaintenance: string | null;
  swDevDocumentation: string | null;
  swDevAdditionalNotes: string | null;
  secExistingSystem: string | null;
  secType: string | null;
  secCameraCount: number | null;
  secCameraType: string | null;
  secCameraResolution: string | null;
  secCameraBrand: string | null;
  secCameraCondition: string | null;
  secDvrNvrType: string | null;
  secDvrNvrBrand: string | null;
  secStorageDays: number | null;
  secCablingType: string | null;
  secPowerSupply: string | null;
  secMonitoringLocation: string | null;
  secAreasToCover: string | null;
  secAreasCovered: string | null;
  secBlindSpots: string | null;
  secNightVision: boolean;
  secRemoteAccess: boolean;
  secAlarmIntegration: boolean;
  secAccessControl: boolean;
  secAdditionalNotes: string | null;
  cameraCount: number | null;
  cameraType: string | null;
  recordingHours: number | null;
  storageRequirements: string | null;
  monitoringNeeds: string | null;
  nightVision: boolean | null;
  content: string;
  findings: string | null;
  recommendations: string | null;
  justification: string | null;
  observations: string | null;
  blueprints: FileEntry[] | null;
  photos: FileEntry[] | null;
  videos: FileEntry[] | null;
  documents: FileEntry[] | null;
  technicianSignature: string | null;
  clientSignature: string | null;
  clientName: string | null;
  clientDocType: string | null;
  clientDocNumber: string | null;
  clientPosition: string | null;
  technicianSignatureLocked: boolean;
  clientSignatureLocked: boolean;
  equipment: EquipmentEntry[] | string | null;
  createdAt: string;
};

const typeLabels: Record<string, string> = {
  ERP_INSTALLATION: "Instalacion ERP",
  TELECOM_NETWORK: "Red Telecomunicaciones",
  SECURITY_CAMERAS: "Camaras Seguridad",
  SOFTWARE_DEVELOPMENT: "Desarrollo Software",
  MAINTENANCE: "Mantenimiento",
  CONSULTING: "Consultoria",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Finalizado",
  UNDER_REVIEW: "En Revision",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

const qualLabels: Record<string, string> = {
  APPLIES: "Aplica",
  DOES_NOT_APPLY: "No Aplica",
  PENDING: "Pendiente",
};

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "default",
  SUBMITTED: "success",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const qualVariant: Record<string, "success" | "danger" | "warning"> = {
  APPLIES: "success",
  DOES_NOT_APPLY: "danger",
  PENDING: "warning",
};

function parseJsonField<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-navy-50 dark:border-white/[0.04] last:border-0">
      <span className="text-xs text-navy-400 dark:text-white/30">{label}</span>
      <span className="text-sm font-medium text-navy-900 dark:text-white text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-navy-50 dark:border-white/[0.04] last:border-0">
      <span className="text-xs text-navy-400 dark:text-white/30">{label}</span>
      <span className={`text-sm font-medium ${value ? "text-green-600 dark:text-green-400" : "text-navy-400 dark:text-white/30"}`}>
        {value ? "Si" : "No"}
      </span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof FileText; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-navy-100 pb-2 dark:border-white/[0.06]">
        <Icon className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-navy-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-navy-400 dark:text-white/30">{label}</p>
      <p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export default function TechnicalReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/technical-reports/${params.id}`)
      .then(async (r) => {
        if (r.ok) setReport(await r.json());
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-navy-300" />
      </div>
    );
  }
  if (!report) {
    return (
      <div className="text-center py-12 text-navy-400">Inspeccion no encontrada</div>
    );
  }

  const inspectionTypes = parseJsonField<string[]>(report.inspectionTypes);
  const equipmentList = parseJsonField<EquipmentEntry[]>(report.equipment);
  const blueprints = parseJsonField<FileEntry[]>(report.blueprints);
  const photos = parseJsonField<FileEntry[]>(report.photos);
  const videos = parseJsonField<FileEntry[]>(report.videos);
  const documents = parseJsonField<FileEntry[]>(report.documents);

  const hasCctv =
    report.cctvExistingSystem || report.cctvCameraCount || report.cctvCameraType ||
    report.cctvCameraResolution || report.cctvCameraBrand || report.cctvCameraCondition ||
    report.cctvDvrNvrBrand || report.cctvDvrNvrChannels || report.cctvStorageCapacity ||
    report.cctvRetentionDays || report.cctvCablingType || report.cctvCablingLength ||
    report.cctvPowerSupply || report.cctvMonitoringLocation || report.cctvAreasToCover ||
    report.cctvAreasCovered || report.cctvBlindSpots || report.cctvInstallationType ||
    report.cctvMountingLocations || report.cctvLightingConditions || report.cctvWeatherExposure ||
    report.cctvNetworkBandwidth || report.cctvAdditionalNotes;

  const hasSec =
    report.secExistingSystem || report.secType || report.secCameraCount || report.secCameraType ||
    report.secCameraResolution || report.secCameraBrand || report.secCameraCondition ||
    report.secDvrNvrType || report.secDvrNvrBrand || report.secStorageDays ||
    report.secCablingType || report.secPowerSupply || report.secMonitoringLocation ||
    report.secAreasToCover || report.secAreasCovered || report.secBlindSpots ||
    report.secAdditionalNotes;

  const hasNet =
    report.netCurrentTopology || report.netCurrentBandwidth || report.netCurrentIsp ||
    report.netCurrentRouter || report.netCurrentSwitch || report.netCurrentFirewall ||
    report.netCurrentWifiAp || report.netCurrentCabling || report.netCurrentServerRoom ||
    report.netCurrentIssues || report.netRequiredTopology || report.netRequiredBandwidth ||
    report.netRequiredEquipment || report.netRequiredCabling || report.netRequiredSecurity ||
    report.netWifiCoverage || report.netWifiZones || report.netVlanNeeds ||
    report.netRemoteAccessNeeds || report.netBackupStrategy || report.netMaintenanceNeeds ||
    report.netAdditionalNotes || report.netRequiredVpn || report.netRequiredWifi ||
    report.netRequiredVoip || report.netRequiredBackup || report.netRequiredMonitoring;

  const hasSup =
    report.supType || report.supRemoteHours || report.supOnSiteHours || report.supScheduleDays ||
    report.supScheduleTimeStart || report.supScheduleTimeEnd || report.supResponseTime ||
    report.supCurrentEquipBrand || report.supCurrentEquipModel || report.supCurrentEquipQty ||
    report.supCurrentEquipCondition || report.supCurrentEquipWarranty || report.supCurrentSoftware ||
    report.supCurrentIssues || report.supRequiredServices || report.supRequiredCoverage ||
    report.supRequiredSlA || report.supClientExpectations || report.supBudgetRange ||
    report.supContractDuration || report.supAdditionalNotes || report.supRequiredTraining ||
    report.supRequiredDocumentation || report.supRequiredInventory || report.supRequiredOnSiteVisit ||
    report.supRequiredRemoteAccess;

  const hasSwDev =
    report.swDevType || report.swDevPlatform || report.swDevFeatures || report.swDevUserRoles ||
    report.swDevIntegrations || report.swDevHosting || report.swDevDomain || report.swDevSSL ||
    report.swDevDatabase || report.swDevDesignReqs || report.swDevSecurityReqs ||
    report.swDevAuthType || report.swDevVersionControl || report.swDevTesting ||
    report.swDevBudget || report.swDevMaintenance || report.swDevDocumentation ||
    report.swDevAdditionalNotes || report.swDevMobileResponsive || report.swDevBranding ||
    report.swDevCICD;

  const hasTelecom =
    report.telecomNodes || report.telecomServers || report.telecomRacks ||
    report.cablingType || report.fiberDistanceM || report.networkTopology ||
    report.switchRouterDetails || report.upsRequirements;

  const hasErp =
    report.currentSystems || report.erpUsers || report.erpModules ||
    report.timelineExpectations || report.dataMigration || report.trainingRequirements;

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.title}
        subtitle={`${typeLabels[report.reportType] || report.reportType} · ${report.company.name}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />Volver
            </Button>
            <Button variant="outline" disabled={pdfLoading} onClick={async () => {
              setPdfLoading(true);
              try {
                const { generateReportPDF } = await import("@/lib/generate-report-pdf");
                await generateReportPDF(report);
                toast.success("PDF generado correctamente");
              } catch (err) {
                console.error("Error generating PDF:", err);
                toast.error("Error al generar PDF: " + (err instanceof Error ? err.message : String(err)));
              } finally {
                setPdfLoading(false);
              }
            }}>
              {pdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              {pdfLoading ? "Generando..." : "Descargar PDF"}
            </Button>
            <Link href={`/technical-reports/${report.id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />Editar
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tipos de Inspeccion */}
          {inspectionTypes && inspectionTypes.length > 0 && (
            <Card className="animate-fade-in-up">
              <CardContent className="space-y-3 py-5">
                <Section icon={FileText} title="Tipos de Inspeccion">
                  <div className="flex flex-wrap gap-2">
                    {inspectionTypes.map((t, i) => (
                      <Badge key={i} variant="info">{t}</Badge>
                    ))}
                  </div>
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Equipos */}
          {equipmentList && equipmentList.length > 0 && (
            <Card className="animate-fade-in-up animate-delay-1">
              <CardContent className="space-y-4 py-5">
                <Section icon={Cpu} title="Equipos">
                  <div className="space-y-3">
                    {equipmentList.map((eq, i) => (
                      <div key={i} className="rounded-lg border border-navy-100 bg-navy-50/50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="info">{eq.type}</Badge>
                          {eq.applies ? (
                            <Badge variant="success">Aplica</Badge>
                          ) : (
                            <Badge variant="danger">No Aplica</Badge>
                          )}
                        </div>
                        {eq.brand && (
                          <p className="text-sm font-medium text-navy-900 dark:text-white">
                            {eq.brand} {eq.model}
                          </p>
                        )}
                        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-navy-500 dark:text-white/50">
                          {eq.serialNumber && <span>Serie: {eq.serialNumber}</span>}
                          {eq.quantity && <span>Cantidad: {eq.quantity}</span>}
                          {eq.condition && <span>Condicion: {eq.condition}</span>}
                          {eq.status && <span>Estado: {eq.status}</span>}
                        </div>
                        {eq.specs && (
                          <p className="mt-1 text-xs text-navy-400 dark:text-white/30 whitespace-pre-wrap">{eq.specs}</p>
                        )}
                        {(eq.posProcessor || eq.posRam || eq.posStorageType || eq.posStorageCapacity || eq.posOs || eq.posNotes) && (
                          <div className="mt-2 rounded border border-navy-100 bg-white p-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
                            <p className="text-xs font-medium text-navy-400 dark:text-white/30 mb-1">Detalles POS</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-navy-500 dark:text-white/50">
                              {eq.posProcessor && <span>Procesador: {eq.posProcessor}</span>}
                              {eq.posRam && <span>RAM: {eq.posRam}</span>}
                              {eq.posStorageType && <span>Almacenamiento: {eq.posStorageType}</span>}
                              {eq.posStorageCapacity && <span>Capacidad: {eq.posStorageCapacity}</span>}
                              {eq.posOs && <span>SO: {eq.posOs}</span>}
                            </div>
                            {eq.posNotes && (
                              <p className="mt-1 text-xs text-navy-400 dark:text-white/30 whitespace-pre-wrap">{eq.posNotes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Infraestructura */}
          <Card className="animate-fade-in-up animate-delay-2">
            <CardContent className="space-y-4 py-5">
              <Section icon={Wifi} title="Infraestructura">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <Row label="Conexion" value={report.connectionType || "—"} />
                  <Row label="Ancho de Banda" value={report.bandwidth || "—"} />
                  {report.speedDownload && (
                    <>
                      <Row label="Vel. Descarga" value={`${report.speedDownload} Mbps`} />
                      <Row label="Vel. Subida" value={`${report.speedUpload || "N/A"} Mbps`} />
                      <Row label="Latencia" value={`${report.speedLatency || "—"} ms`} />
                      <Row label="Tipo Conexión (Test)" value={report.speedConnectionType || "—"} />
                      <Row label="ISP" value={report.speedIsp || "—"} />
                      <Row label="IP" value={report.speedIp || "—"} />
                    </>
                  )}
                  <Row label="Suministro Electrico" value={report.powerSupply || "—"} />
                  <Row label="Seguridad Fisica" value={report.physicalSecurity || "—"} />
                </div>
                {report.airConditioning !== null && (
                  <BoolRow label="Aire Acondicionado" value={!!report.airConditioning} />
                )}
                {report.airConditioningDetails && (
                  <p className="text-xs text-navy-400 dark:text-white/30 ml-1">
                    Detalle: {report.airConditioningDetails}
                  </p>
                )}
              </Section>
            </CardContent>
          </Card>

          {/* Seguridad Electronica (sec* fields) */}
          {hasSec && (
            <Card className="animate-fade-in-up animate-delay-3">
              <CardContent className="space-y-4 py-5">
                <Section icon={Shield} title="Seguridad Electronica">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Sistema Existente" value={report.secExistingSystem || "—"} />
                    <Row label="Tipo" value={report.secType || "—"} />
                    <Row label="Cantidad Cámaras" value={report.secCameraCount ?? "—"} />
                    <Row label="Tipo Camara" value={report.secCameraType || "—"} />
                    <Row label="Resolucion" value={report.secCameraResolution || "—"} />
                    <Row label="Marca" value={report.secCameraBrand || "—"} />
                    <Row label="Condicion" value={report.secCameraCondition || "—"} />
                    <Row label="Tipo DVR/NVR" value={report.secDvrNvrType || "—"} />
                    <Row label="Marca DVR/NVR" value={report.secDvrNvrBrand || "—"} />
                    <Row label="Dias Almacenamiento" value={report.secStorageDays ?? "—"} />
                    <Row label="Cableado" value={report.secCablingType || "—"} />
                    <Row label="Fuente Poder" value={report.secPowerSupply || "—"} />
                    <Row label="Ubicacion Monitoreo" value={report.secMonitoringLocation || "—"} />
                  </div>
                  {report.secAreasToCover && <TextBlock label="Areas a Cubrir" value={report.secAreasToCover} />}
                  {report.secAreasCovered && <TextBlock label="Areas Cubiertas" value={report.secAreasCovered} />}
                  {report.secBlindSpots && <TextBlock label="Puntos Ciegos" value={report.secBlindSpots} />}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <BoolRow label="Vision Nocturna" value={report.secNightVision} />
                    <BoolRow label="Acceso Remoto" value={report.secRemoteAccess} />
                    <BoolRow label="Integracion Alarma" value={report.secAlarmIntegration} />
                    <BoolRow label="Control Acceso" value={report.secAccessControl} />
                  </div>
                  {report.secAdditionalNotes && <TextBlock label="Notas" value={report.secAdditionalNotes} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Legacy Cameras Section */}
          {(report.cameraCount || report.cameraType || report.recordingHours || report.storageRequirements || report.monitoringNeeds) && (
            <Card className="animate-fade-in-up animate-delay-3">
              <CardContent className="space-y-4 py-5">
                <Section icon={Camera} title="Camaras de Seguridad">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Cantidad" value={report.cameraCount ?? "—"} />
                    <Row label="Tipo" value={report.cameraType || "—"} />
                    <Row label="Horas Grabacion" value={report.recordingHours ? `${report.recordingHours}h` : "—"} />
                    {report.nightVision !== null && <BoolRow label="Vision Nocturna" value={!!report.nightVision} />}
                  </div>
                  {report.storageRequirements && <TextBlock label="Almacenamiento" value={report.storageRequirements} />}
                  {report.monitoringNeeds && <TextBlock label="Monitoreo" value={report.monitoringNeeds} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Software / Desarrollo */}
          {hasSwDev && (
            <Card className="animate-fade-in-up animate-delay-3">
              <CardContent className="space-y-4 py-5">
                <Section icon={Code} title="Software / Desarrollo">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Tipo" value={report.swDevType || "—"} />
                    <Row label="Plataforma" value={report.swDevPlatform || "—"} />
                    <Row label="Hosting" value={report.swDevHosting || "—"} />
                    <Row label="Dominio" value={report.swDevDomain || "—"} />
                    <Row label="Base de Datos" value={report.swDevDatabase || "—"} />
                    <Row label="Tipo Auth" value={report.swDevAuthType || "—"} />
                    <Row label="Control Versiones" value={report.swDevVersionControl || "—"} />
                    <Row label="Presupuesto" value={report.swDevBudget || "—"} />
                  </div>
                  {report.swDevFeatures && <TextBlock label="Funcionalidades" value={report.swDevFeatures} />}
                  {report.swDevUserRoles && <TextBlock label="Roles de Usuario" value={report.swDevUserRoles} />}
                  {report.swDevIntegrations && <TextBlock label="Integraciones" value={report.swDevIntegrations} />}
                  {report.swDevDesignReqs && <TextBlock label="Requisitos de Diseno" value={report.swDevDesignReqs} />}
                  {report.swDevSecurityReqs && <TextBlock label="Requisitos de Seguridad" value={report.swDevSecurityReqs} />}
                  {report.swDevTesting && <TextBlock label="Pruebas" value={report.swDevTesting} />}
                  {report.swDevMaintenance && <TextBlock label="Mantenimiento" value={report.swDevMaintenance} />}
                  {report.swDevDocumentation && <TextBlock label="Documentacion" value={report.swDevDocumentation} />}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <BoolRow label="SSL" value={report.swDevSSL} />
                    <BoolRow label="Responsive" value={report.swDevMobileResponsive} />
                    <BoolRow label="Branding" value={report.swDevBranding} />
                    <BoolRow label="CI/CD" value={report.swDevCICD} />
                  </div>
                  {report.swDevAdditionalNotes && <TextBlock label="Notas" value={report.swDevAdditionalNotes} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Red de Telecomunicaciones (telecom + net fields) */}
          {hasTelecom && (
            <Card className="animate-fade-in-up animate-delay-4">
              <CardContent className="space-y-4 py-5">
                <Section icon={Network} title="Red de Telecomunicaciones">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Nodos" value={report.telecomNodes ?? "—"} />
                    <Row label="Servidores" value={report.telecomServers ?? "—"} />
                    <Row label="Racks" value={report.telecomRacks ?? "—"} />
                    <Row label="Distancia Fibra" value={report.fiberDistanceM ? `${report.fiberDistanceM}m` : "—"} />
                    <Row label="Cableado" value={report.cablingType || "—"} />
                    <Row label="Topologia" value={report.networkTopology || "—"} />
                  </div>
                  {report.switchRouterDetails && <TextBlock label="Switch/Router" value={report.switchRouterDetails} />}
                  {report.upsRequirements && <TextBlock label="UPS" value={report.upsRequirements} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Red Actual */}
          {hasNet && (
            <Card className="animate-fade-in-up animate-delay-4">
              <CardContent className="space-y-4 py-5">
                <Section icon={Network} title="Red de Telecomunicaciones - Detalles">
                  <p className="text-xs font-medium text-navy-400 dark:text-white/30 mb-2">Estado Actual</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Topologia" value={report.netCurrentTopology || "—"} />
                    <Row label="Ancho de Banda" value={report.netCurrentBandwidth || "—"} />
                    <Row label="ISP" value={report.netCurrentIsp || "—"} />
                    <Row label="Router" value={report.netCurrentRouter || "—"} />
                    <Row label="Switch" value={report.netCurrentSwitch || "—"} />
                    <Row label="Firewall" value={report.netCurrentFirewall || "—"} />
                    <Row label="WiFi AP" value={report.netCurrentWifiAp || "—"} />
                    <Row label="Cableado" value={report.netCurrentCabling || "—"} />
                  </div>
                  {report.netCurrentServerRoom && <TextBlock label="Sala de Servidores" value={report.netCurrentServerRoom} />}
                  {report.netCurrentIssues && <TextBlock label="Problemas Actuales" value={report.netCurrentIssues} />}

                  <p className="text-xs font-medium text-navy-400 dark:text-white/30 mt-4 mb-2">Requerimientos</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Topologia Requerida" value={report.netRequiredTopology || "—"} />
                    <Row label="Ancho de Banda Req." value={report.netRequiredBandwidth || "—"} />
                    <Row label="Cableado Req." value={report.netRequiredCabling || "—"} />
                  </div>
                  {report.netRequiredEquipment && <TextBlock label="Equipo Requerido" value={report.netRequiredEquipment} />}
                  {report.netRequiredSecurity && <TextBlock label="Seguridad Requerida" value={report.netRequiredSecurity} />}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <BoolRow label="VPN" value={report.netRequiredVpn} />
                    <BoolRow label="WiFi" value={report.netRequiredWifi} />
                    <BoolRow label="VoIP" value={report.netRequiredVoip} />
                    <BoolRow label="Backup" value={report.netRequiredBackup} />
                    <BoolRow label="Monitoreo" value={report.netRequiredMonitoring} />
                  </div>

                  <p className="text-xs font-medium text-navy-400 dark:text-white/30 mt-4 mb-2">WiFi y Otros</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Cobertura WiFi" value={report.netWifiCoverage || "—"} />
                    <Row label="VLAN" value={report.netVlanNeeds || "—"} />
                  </div>
                  {report.netWifiZones && <TextBlock label="Zonas WiFi" value={report.netWifiZones} />}
                  {report.netRemoteAccessNeeds && <TextBlock label="Acceso Remoto" value={report.netRemoteAccessNeeds} />}
                  {report.netBackupStrategy && <TextBlock label="Estrategia Backup" value={report.netBackupStrategy} />}
                  {report.netMaintenanceNeeds && <TextBlock label="Mantenimiento" value={report.netMaintenanceNeeds} />}
                  {report.netAdditionalNotes && <TextBlock label="Notas Adicionales" value={report.netAdditionalNotes} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Soporte Tecnico */}
          {hasSup && (
            <Card className="animate-fade-in-up animate-delay-5">
              <CardContent className="space-y-4 py-5">
                <Section icon={Server} title="Soporte Tecnico">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Tipo" value={report.supType || "—"} />
                    <Row label="Horas Remoto" value={report.supRemoteHours || "—"} />
                    <Row label="Horas Presencial" value={report.supOnSiteHours || "—"} />
                    <Row label="Dias Horario" value={report.supScheduleDays || "—"} />
                    <Row label="Hora Inicio" value={report.supScheduleTimeStart || "—"} />
                    <Row label="Hora Fin" value={report.supScheduleTimeEnd || "—"} />
                    <Row label="Tiempo Respuesta" value={report.supResponseTime || "—"} />
                    <Row label="Cobertura" value={report.supRequiredCoverage || "—"} />
                    <Row label="SLA" value={report.supRequiredSlA || "—"} />
                    <Row label="Rango Presupuesto" value={report.supBudgetRange || "—"} />
                    <Row label="Duracion Contrato" value={report.supContractDuration || "—"} />
                  </div>
                  {report.supCurrentEquipBrand && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-navy-400 dark:text-white/30">Equipo Actual</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        <Row label="Marca" value={report.supCurrentEquipBrand || "—"} />
                        <Row label="Modelo" value={report.supCurrentEquipModel || "—"} />
                        <Row label="Cantidad" value={report.supCurrentEquipQty || "—"} />
                        <Row label="Condicion" value={report.supCurrentEquipCondition || "—"} />
                        <Row label="Garantia" value={report.supCurrentEquipWarranty || "—"} />
                      </div>
                    </div>
                  )}
                  {report.supCurrentSoftware && <TextBlock label="Software Actual" value={report.supCurrentSoftware} />}
                  {report.supCurrentIssues && <TextBlock label="Problemas Actuales" value={report.supCurrentIssues} />}
                  {report.supRequiredServices && <TextBlock label="Servicios Requeridos" value={report.supRequiredServices} />}
                  {report.supClientExpectations && <TextBlock label="Expectativas" value={report.supClientExpectations} />}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <BoolRow label="Capacitacion" value={report.supRequiredTraining} />
                    <BoolRow label="Documentacion" value={report.supRequiredDocumentation} />
                    <BoolRow label="Inventario" value={report.supRequiredInventory} />
                    <BoolRow label="Visita Presencial" value={report.supRequiredOnSiteVisit} />
                    <BoolRow label="Acceso Remoto" value={report.supRequiredRemoteAccess} />
                  </div>
                  {report.supAdditionalNotes && <TextBlock label="Notas" value={report.supAdditionalNotes} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Descripcion y Hallazgos */}
          <Card className="animate-fade-in-up animate-delay-4">
            <CardContent className="space-y-4 py-5">
              <Section icon={FileText} title="Descripcion y Hallazgos">
                {report.content && <TextBlock label="Descripcion" value={report.content} />}
                {report.findings && <TextBlock label="Hallazgos" value={report.findings} />}
                {report.recommendations && <TextBlock label="Recomendaciones" value={report.recommendations} />}
                {report.justification && <TextBlock label="Justificacion" value={report.justification} />}
                {report.observations && <TextBlock label="Observaciones" value={report.observations} />}
              </Section>
            </CardContent>
          </Card>

          {/* Archivos Adjuntos */}
          {(blueprints && blueprints.length > 0) ||
          (photos && photos.length > 0) ||
          (videos && videos.length > 0) ||
          (documents && documents.length > 0) ? (
            <Card className="animate-fade-in-up animate-delay-5">
              <CardContent className="space-y-4 py-5">
                <Section icon={Upload} title="Archivos Adjuntos">
                  {photos && photos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-navy-400 dark:text-white/30 mb-2 flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5" /> Fotos del Sitio
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((f, i) => (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden rounded-lg border border-navy-100 dark:border-white/10 hover:opacity-80 transition-opacity"
                          >
                            <img src={f.url} alt={f.name} className="h-24 w-full object-cover" />
                            <p className="text-[10px] text-navy-400 dark:text-white/30 px-1 py-0.5 truncate">{f.name}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {videos && videos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-navy-400 dark:text-white/30 mb-2 flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5" /> Videos
                      </p>
                      <div className="space-y-1">
                        {videos.map((f, i) => (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-blue-600 hover:bg-navy-100 dark:bg-white/5 dark:text-blue-400 dark:hover:bg-white/10 transition-colors"
                          >
                            <Video className="h-3.5 w-3.5" />
                            {f.name}
                            <ExternalLink className="ml-auto h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {documents && documents.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-navy-400 dark:text-white/30 mb-2 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Documentos
                      </p>
                      <div className="space-y-1">
                        {documents.map((f, i) => (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-blue-600 hover:bg-navy-100 dark:bg-white/5 dark:text-blue-400 dark:hover:bg-white/10 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {f.name}
                            <ExternalLink className="ml-auto h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {blueprints && blueprints.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-navy-400 dark:text-white/30 mb-2 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Planos y Diagramas
                      </p>
                      <div className="space-y-1">
                        {blueprints.map((f, i) => (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-blue-600 hover:bg-navy-100 dark:bg-white/5 dark:text-blue-400 dark:hover:bg-white/10 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {f.name}
                            <ExternalLink className="ml-auto h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </CardContent>
            </Card>
          ) : null}

          {/* Firmas */}
          {(report.technicianSignature || report.clientSignature) && (
            <Card className="animate-fade-in-up animate-delay-6">
              <CardContent className="space-y-4 py-5">
                <Section icon={PenTool} title="Firmas">
                  <div className="grid grid-cols-2 gap-6">
                    {report.technicianSignature && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-navy-400 dark:text-white/30">Tecnico</p>
                          {report.technicianSignatureLocked && <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"><Lock className="h-2.5 w-2.5" />Aceptada</span>}
                        </div>
                        <div className="rounded-lg border border-navy-100 bg-white p-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
                          <img
                            src={report.technicianSignature}
                            alt="Firma del tecnico"
                            className="w-full h-auto max-h-32 object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {report.clientSignature && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-navy-400 dark:text-white/30">Cliente</p>
                          {report.clientSignatureLocked && <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"><Lock className="h-2.5 w-2.5" />Aceptada</span>}
                        </div>
                        <div className="rounded-lg border border-navy-100 bg-white p-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
                          <img
                            src={report.clientSignature}
                            alt="Firma del cliente"
                            className="w-full h-auto max-h-32 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {(report.clientName || report.clientDocNumber || report.clientPosition) && (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <Row label="Nombre Cliente" value={report.clientName || "—"} />
                      <Row label="Documento" value={report.clientDocNumber ? `${report.clientDocType || ""} ${report.clientDocNumber}` : "—"} />
                      <Row label="Cargo" value={report.clientPosition || "—"} />
                    </div>
                  )}
                </Section>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status & Dates */}
          <Card className="animate-fade-in-up">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={statusVariant[report.status]}>{statusLabels[report.status]}</Badge>
                <Badge variant={qualVariant[report.qualification]}>{qualLabels[report.qualification]}</Badge>
              </div>
              <Row label="Creado" value={formatDate(report.createdAt)} />
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="animate-fade-in-up animate-delay-1">
            <CardContent className="space-y-3 py-5">
              <Section icon={Building2} title="Empresa">
                <Row label="Nombre" value={report.company.name} />
                {report.branch && <Row label="Sucursal" value={report.branch.name} />}
                <Row
                  label="RIF/NIT"
                  value={
                    report.company.taxId
                      ? `${report.company.taxIdType || ""}-${report.company.taxId}`
                      : "—"
                  }
                />
                <Row label="Direccion" value={report.company.address || "—"} />
                <Row label="Telefono" value={report.company.phone || "—"} />
                <Row label="Email" value={report.company.email || "—"} />
                {report.company.municipality && <Row label="Municipio" value={report.company.municipality} />}
                {report.company.state && <Row label="Estado" value={report.company.state} />}
              </Section>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="animate-fade-in-up animate-delay-2">
            <CardContent className="space-y-3 py-5">
              <Section icon={Phone} title="Contacto en Campo">
                <Row label="Nombre" value={report.contactName || "—"} />
                <Row label="Telefono" value={report.contactPhone || "—"} />
                <Row label="Email" value={report.contactEmail || "—"} />
                <Row label="Direccion" value={report.address || "—"} />
                <Row label="Ciudad" value={report.city || "—"} />
                <Row label="Estado" value={report.state || "—"} />
                {report.gmapUrl && (
                  <a
                    href={report.gmapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400 mt-2"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Ver en Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </Section>
            </CardContent>
          </Card>

          {/* Created By */}
          <Card className="animate-fade-in-up animate-delay-3">
            <CardContent className="space-y-3 py-5">
              <Section icon={Cpu} title="Creado Por">
                <Row label="Nombre" value={report.creator.name || "—"} />
                <Row label="Email" value={report.creator.email} />
              </Section>
            </CardContent>
          </Card>

          {/* Visit */}
          {report.visit && (
            <Card className="animate-fade-in-up animate-delay-4">
              <CardContent className="space-y-3 py-5">
                <Section icon={MapPin} title="Visita Asociada">
                  <Row label="Tipo" value={report.visit.type} />
                  <Row label="Fecha" value={report.visit.scheduledDate ? formatDate(report.visit.scheduledDate) : "—"} />
                  {report.visit.notes && <Row label="Notas" value={report.visit.notes} />}
                </Section>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
