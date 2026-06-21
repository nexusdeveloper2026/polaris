"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import TechnicalReportForm from "../form";

type Company = { id: number; name: string; taxId: string | null };
type ReportData = {
  id: number;
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

export default function EditTechnicalReportPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/technical-reports/${params.id}`).then(async (r) => {
      if (!r.ok) { setError("Informe no encontrado"); return; }
      const json = await r.json();
      setData({
        id: json.id,
        companyId: String(json.companyId),
        reportType: json.reportType,
        title: json.title,
        status: json.status,
        qualification: json.qualification,
        contactName: json.contactName || "",
        contactPhone: json.contactPhone || "",
        contactEmail: json.contactEmail || "",
        address: json.address || "",
        city: json.city || "",
        state: json.state || "",
        connectionType: json.connectionType || "",
        bandwidth: json.bandwidth || "",
        powerSupply: json.powerSupply || "",
        airConditioning: json.airConditioning ?? false,
        airConditioningDetails: json.airConditioningDetails || "",
        physicalSecurity: json.physicalSecurity || "",
        telecomNodes: json.telecomNodes ? String(json.telecomNodes) : "",
        telecomServers: json.telecomServers ? String(json.telecomServers) : "",
        telecomRacks: json.telecomRacks ? String(json.telecomRacks) : "",
        cablingType: json.cablingType || "",
        fiberDistanceM: json.fiberDistanceM ? String(json.fiberDistanceM) : "",
        networkTopology: json.networkTopology || "",
        switchRouterDetails: json.switchRouterDetails || "",
        upsRequirements: json.upsRequirements || "",
        currentSystems: json.currentSystems || "",
        erpUsers: json.erpUsers ? String(json.erpUsers) : "",
        erpModules: json.erpModules || "",
        timelineExpectations: json.timelineExpectations || "",
        dataMigration: json.dataMigration ?? false,
        trainingRequirements: json.trainingRequirements || "",
        cameraCount: json.cameraCount ? String(json.cameraCount) : "",
        cameraType: json.cameraType || "",
        recordingHours: json.recordingHours ? String(json.recordingHours) : "",
        storageRequirements: json.storageRequirements || "",
        monitoringNeeds: json.monitoringNeeds || "",
        nightVision: json.nightVision ?? false,
        content: json.content || "",
        findings: json.findings || "",
        recommendations: json.recommendations || "",
        justification: json.justification || "",
        observations: json.observations || "",
        blueprints: Array.isArray(json.blueprints) ? json.blueprints : [],
        photos: Array.isArray(json.photos) ? json.photos : [],
      });
    });
  }, [params.id]);

  if (error) return <div className="flex justify-center py-12 text-red-500">{error}</div>;
  if (!data) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-navy-300" /></div>;

  return <TechnicalReportForm existingData={data} />;
}
