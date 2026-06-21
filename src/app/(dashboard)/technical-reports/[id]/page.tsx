"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import {
  Loader2, ArrowLeft, Pencil, FileText, Building2, Wifi, Server,
  Camera, Network, Cpu, Upload, ExternalLink, CheckCircle, XCircle,
  Clock, AlertTriangle, MapPin, Phone, Mail,
} from "lucide-react";

type ReportDetail = {
  id: number;
  title: string;
  reportType: string;
  status: string;
  qualification: string;
  companyId: number;
  company: { id: number; name: string; taxId: string | null; taxIdType: string | null; address: string | null; phone: string | null; email: string | null; state: string | null; municipality: string | null };
  branch: { id: number; name: string } | null;
  creator: { id: number; name: string | null; email: string };
  visit: { id: number; type: string; scheduledDate: string | null; notes: string | null } | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  connectionType: string | null;
  bandwidth: string | null;
  powerSupply: string | null;
  airConditioning: boolean;
  airConditioningDetails: string | null;
  physicalSecurity: string | null;
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
  dataMigration: boolean;
  trainingRequirements: string | null;
  cameraCount: number | null;
  cameraType: string | null;
  recordingHours: number | null;
  storageRequirements: string | null;
  monitoringNeeds: string | null;
  nightVision: boolean;
  content: string;
  findings: string | null;
  recommendations: string | null;
  justification: string | null;
  observations: string | null;
  blueprints: { name: string; url: string }[];
  photos: { name: string; url: string }[];
  createdAt: string;
};

const typeLabels: Record<string, string> = { ERP_INSTALLATION: "Instalación ERP", TELECOM_NETWORK: "Red Telecomunicaciones", SECURITY_CAMERAS: "Cámaras Seguridad" };
const statusLabels: Record<string, string> = { DRAFT: "Borrador", SUBMITTED: "Enviado", UNDER_REVIEW: "En Revisión", APPROVED: "Aprobado", REJECTED: "Rechazado" };
const qualLabels: Record<string, string> = { APPLIES: "Aplica", DOES_NOT_APPLY: "No Aplica", PENDING: "Pendiente" };
const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "info"> = { DRAFT: "default", SUBMITTED: "info", UNDER_REVIEW: "warning", APPROVED: "success", REJECTED: "danger" };
const qualVariant: Record<string, "success" | "danger" | "warning"> = { APPLIES: "success", DOES_NOT_APPLY: "danger", PENDING: "warning" };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-navy-50 dark:border-white/[0.04] last:border-0">
      <span className="text-xs text-navy-400 dark:text-white/30">{label}</span>
      <span className="text-sm font-medium text-navy-900 dark:text-white text-right">{value}</span>
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

export default function TechnicalReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/technical-reports/${params.id}`).then(async (r) => {
      if (r.ok) setReport(await r.json());
    }).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-navy-300" /></div>;
  if (!report) return <div className="text-center py-12 text-navy-400">Inspección no encontrada</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.title}
        subtitle={`${typeLabels[report.reportType]} · ${report.company.name}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
            <Link href={`/technical-reports/${report.id}/edit`}><Button><Pencil className="mr-2 h-4 w-4" />Editar</Button></Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Badges */}
          <Card className="animate-fade-in-up">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-3">
                <Badge variant={statusVariant[report.status]}>{statusLabels[report.status]}</Badge>
                <Badge variant={qualVariant[report.qualification]}>{qualLabels[report.qualification]}</Badge>
                <span className="text-xs text-navy-400 dark:text-white/30 self-center">Creado {formatDate(report.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {report.content && (
            <Card className="animate-fade-in-up animate-delay-1">
              <CardContent className="space-y-3 py-5">
                <Section icon={FileText} title="Descripción">
                  <p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.content}</p>
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Infrastructure */}
          <Card className="animate-fade-in-up animate-delay-2">
            <CardContent className="space-y-4 py-5">
              <Section icon={Wifi} title="Infraestructura">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <Row label="Conexión" value={report.connectionType || "—"} />
                  <Row label="Ancho de Banda" value={report.bandwidth || "—"} />
                  <Row label="Suministro Eléctrico" value={report.powerSupply || "—"} />
                  <Row label="Aire Acondicionado" value={report.airConditioning ? `Sí${report.airConditioningDetails ? ` - ${report.airConditioningDetails}` : ""}` : "No"} />
                  <Row label="Seguridad Física" value={report.physicalSecurity || "—"} />
                </div>
              </Section>
            </CardContent>
          </Card>

          {/* Telecom Network */}
          {report.reportType === "TELECOM_NETWORK" && (
            <Card className="animate-fade-in-up animate-delay-3">
              <CardContent className="space-y-4 py-5">
                <Section icon={Network} title="Red de Telecomunicaciones">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Nodos" value={report.telecomNodes ?? "—"} />
                    <Row label="Servidores" value={report.telecomServers ?? "—"} />
                    <Row label="Racks" value={report.telecomRacks ?? "—"} />
                    <Row label="Distancia Fibra" value={report.fiberDistanceM ? `${report.fiberDistanceM}m` : "—"} />
                    <Row label="Cableado" value={report.cablingType || "—"} />
                    <Row label="Topología" value={report.networkTopology || "—"} />
                  </div>
                  {report.switchRouterDetails && <Row label="Switch/Router" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.switchRouterDetails}</p>} />}
                  {report.upsRequirements && <Row label="UPS" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.upsRequirements}</p>} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* ERP Installation */}
          {report.reportType === "ERP_INSTALLATION" && (
            <Card className="animate-fade-in-up animate-delay-3">
              <CardContent className="space-y-4 py-5">
                <Section icon={Server} title="Instalación ERP">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Usuarios" value={report.erpUsers ?? "—"} />
                    <Row label="Migración de Datos" value={report.dataMigration ? "Sí" : "No"} />
                    <Row label="Tiempo Estimado" value={report.timelineExpectations || "—"} />
                  </div>
                  {report.currentSystems && <Row label="Sistemas Actuales" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.currentSystems}</p>} />}
                  {report.erpModules && <Row label="Módulos" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.erpModules}</p>} />}
                  {report.trainingRequirements && <Row label="Capacitación" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.trainingRequirements}</p>} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Security Cameras */}
          {report.reportType === "SECURITY_CAMERAS" && (
            <Card className="animate-fade-in-up animate-delay-3">
              <CardContent className="space-y-4 py-5">
                <Section icon={Camera} title="Cámaras de Seguridad">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <Row label="Cantidad" value={report.cameraCount ?? "—"} />
                    <Row label="Tipo" value={report.cameraType || "—"} />
                    <Row label="Horas Grabación" value={report.recordingHours ? `${report.recordingHours}h` : "—"} />
                    <Row label="Visión Nocturna" value={report.nightVision ? "Sí" : "No"} />
                  </div>
                  {report.storageRequirements && <Row label="Almacenamiento" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.storageRequirements}</p>} />}
                  {report.monitoringNeeds && <Row label="Monitoreo" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.monitoringNeeds}</p>} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Findings & Recommendations */}
          {(report.findings || report.recommendations || report.justification || report.observations) && (
            <Card className="animate-fade-in-up animate-delay-4">
              <CardContent className="space-y-4 py-5">
                <Section icon={Cpu} title="Hallazgos y Recomendaciones">
                  {report.findings && <Row label="Hallazgos" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.findings}</p>} />}
                  {report.recommendations && <Row label="Recomendaciones" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.recommendations}</p>} />}
                  {report.justification && <Row label="Justificación" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.justification}</p>} />}
                  {report.observations && <Row label="Observaciones" value={<p className="text-sm text-navy-700 dark:text-white/70 whitespace-pre-wrap">{report.observations}</p>} />}
                </Section>
              </CardContent>
            </Card>
          )}

          {/* Files */}
          {(report.blueprints?.length > 0 || report.photos?.length > 0) && (
            <Card className="animate-fade-in-up animate-delay-5">
              <CardContent className="space-y-4 py-5">
                <Section icon={Upload} title="Archivos Adjuntos">
                  {report.blueprints?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-navy-400 dark:text-white/30 mb-2">Planos y Diagramas</p>
                      <div className="space-y-1">
                        {report.blueprints.map((f, i) => (
                          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-blue-600 hover:bg-navy-100 dark:bg-white/5 dark:text-blue-400 dark:hover:bg-white/10 transition-colors">
                            <FileText className="h-3.5 w-3.5" />{f.name}<ExternalLink className="ml-auto h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.photos?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-navy-400 dark:text-white/30 mb-2">Fotos del Sitio</p>
                      <div className="grid grid-cols-3 gap-2">
                        {report.photos.map((f, i) => (
                          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-navy-100 dark:border-white/10 hover:opacity-80 transition-opacity">
                            <img src={f.url} alt={f.name} className="h-24 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card className="animate-fade-in-up animate-delay-1">
            <CardContent className="space-y-3 py-5">
              <Section icon={Building2} title="Empresa">
                <Row label="Nombre" value={report.company.name} />
                {report.branch && <Row label="Sucursal" value={report.branch.name} />}
                <Row label="RIF/NIT" value={report.company.taxId ? `${report.company.taxIdType || ""}-${report.company.taxId}` : "—"} />
                <Row label="Dirección" value={report.company.address || "—"} />
                <Row label="Teléfono" value={report.company.phone || "—"} />
                <Row label="Email" value={report.company.email || "—"} />
              </Section>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="animate-fade-in-up animate-delay-2">
            <CardContent className="space-y-3 py-5">
              <Section icon={Phone} title="Contacto en Campo">
                <Row label="Nombre" value={report.contactName || "—"} />
                <Row label="Teléfono" value={report.contactPhone || "—"} />
                <Row label="Email" value={report.contactEmail || "—"} />
                <Row label="Dirección" value={report.address || "—"} />
                <Row label="Ciudad" value={report.city || "—"} />
                <Row label="Estado" value={report.state || "—"} />
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
