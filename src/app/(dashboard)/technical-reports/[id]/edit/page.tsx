"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import TechnicalReportForm from "../form";

type Company = { id: number; name: string; taxId: string | null };
type ReportData = {
  id: number;
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
  blueprints: { name: string; url: string; size: number; type: string }[];
  photos: { name: string; url: string; size: number; type: string }[];
  equipment: { type: string; applies: boolean; brand: string; model: string; serialNumber: string; quantity: string; condition: string; status: string; specs: string; posProcessor: string; posRam: string; posStorageType: string; posStorageCapacity: string; posOs: string; posNotes: string }[];
};

export default function EditTechnicalReportPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/technical-reports/${params.id}`).then(async (r) => {
      if (!r.ok) { setError("Inspección no encontrada"); return; }
      const json = await r.json();
      setData({
        id: json.id,
        companyId: String(json.companyId),
        branchId: json.branchId ? String(json.branchId) : "",
        reportType: json.reportType,
        inspectionTypes: json.inspectionTypes ? JSON.parse(json.inspectionTypes) : [json.reportType],
        title: json.title,
        status: json.status,
        qualification: json.qualification,
        contactName: json.contactName || "",
        contactPhone: json.contactPhone || "",
        contactEmail: json.contactEmail || "",
        address: json.address || "",
        city: json.city || "",
        state: json.state || "",
        gmapUrl: json.gmapUrl || "",
        connectionType: json.connectionType || "",
        bandwidth: json.bandwidth || "",
        powerSupply: json.powerSupply || "",
        airConditioning: json.airConditioning ?? false,
        airConditioningDetails: json.airConditioningDetails || "",
        physicalSecurity: json.physicalSecurity || "",
        cctvExistingSystem: json.cctvExistingSystem || "",
        cctvCameraCount: json.cctvCameraCount ? String(json.cctvCameraCount) : "",
        cctvCameraType: json.cctvCameraType || "",
        cctvCameraResolution: json.cctvCameraResolution || "",
        cctvCameraBrand: json.cctvCameraBrand || "",
        cctvCameraCondition: json.cctvCameraCondition || "",
        cctvDvrNvrBrand: json.cctvDvrNvrBrand || "",
        cctvDvrNvrChannels: json.cctvDvrNvrChannels || "",
        cctvStorageCapacity: json.cctvStorageCapacity || "",
        cctvRetentionDays: json.cctvRetentionDays || "",
        cctvCablingType: json.cctvCablingType || "",
        cctvCablingLength: json.cctvCablingLength ? String(json.cctvCablingLength) : "",
        cctvPowerSupply: json.cctvPowerSupply || "",
        cctvMonitoringLocation: json.cctvMonitoringLocation || "",
        cctvAreasToCover: json.cctvAreasToCover || "",
        cctvAreasCovered: json.cctvAreasCovered || "",
        cctvBlindSpots: json.cctvBlindSpots || "",
        cctvInstallationType: json.cctvInstallationType || "",
        cctvNightVision: json.cctvNightVision ?? false,
        cctvRemoteAccess: json.cctvRemoteAccess ?? false,
        cctvAlarmIntegration: json.cctvAlarmIntegration ?? false,
        cctvAccessControl: json.cctvAccessControl ?? false,
        cctvMountingLocations: json.cctvMountingLocations || "",
        cctvLightingConditions: json.cctvLightingConditions || "",
        cctvWeatherExposure: json.cctvWeatherExposure || "",
        cctvNetworkBandwidth: json.cctvNetworkBandwidth || "",
        cctvAdditionalNotes: json.cctvAdditionalNotes || "",
        swDevType: json.swDevType || "",
        swCurrentSystem: json.swCurrentSystem || "",
        swCurrentWebsite: json.swCurrentWebsite || "",
        swCurrentApp: json.swCurrentApp || "",
        swCurrentSoftware: json.swCurrentSoftware || "",
        swCurrentTech: json.swCurrentTech || "",
        swCurrentIssues: json.swCurrentIssues || "",
        swRequiredType: json.swRequiredType || "",
        swRequiredFeatures: json.swRequiredFeatures || "",
        swRequiredModules: json.swRequiredModules || "",
        swTargetUsers: json.swTargetUsers ? String(json.swTargetUsers) : "",
        swUserRoles: json.swUserRoles || "",
        swIntegrationNeeds: json.swIntegrationNeeds || "",
        swHostingType: json.swHostingType || "",
        swDomainStatus: json.swDomainStatus || "",
        swDomainName: json.swDomainName || "",
        swBudget: json.swBudget || "",
        swTimeline: json.swTimeline || "",
        swSecurityNeeds: json.swSecurityNeeds || "",
        swMaintenanceNeeds: json.swMaintenanceNeeds || "",
        swTrainingNeeds: json.swTrainingNeeds || "",
        swAdditionalNotes: json.swAdditionalNotes || "",
        netCurrentTopology: json.netCurrentTopology || "",
        netCurrentBandwidth: json.netCurrentBandwidth || "",
        netCurrentIsp: json.netCurrentIsp || "",
        netCurrentRouter: json.netCurrentRouter || "",
        netCurrentSwitch: json.netCurrentSwitch || "",
        netCurrentFirewall: json.netCurrentFirewall || "",
        netCurrentWifiAp: json.netCurrentWifiAp || "",
        netCurrentCabling: json.netCurrentCabling || "",
        netCurrentServerRoom: json.netCurrentServerRoom || "",
        netCurrentIssues: json.netCurrentIssues || "",
        netRequiredTopology: json.netRequiredTopology || "",
        netRequiredBandwidth: json.netRequiredBandwidth || "",
        netRequiredEquipment: json.netRequiredEquipment || "",
        netRequiredCabling: json.netRequiredCabling || "",
        netRequiredSecurity: json.netRequiredSecurity || "",
        netRequiredVpn: json.netRequiredVpn ?? false,
        netRequiredWifi: json.netRequiredWifi ?? false,
        netRequiredVoip: json.netRequiredVoip ?? false,
        netRequiredBackup: json.netRequiredBackup ?? false,
        netRequiredMonitoring: json.netRequiredMonitoring ?? false,
        netWifiCoverage: json.netWifiCoverage || "",
        netWifiZones: json.netWifiZones || "",
        netVlanNeeds: json.netVlanNeeds || "",
        netRemoteAccessNeeds: json.netRemoteAccessNeeds || "",
        netBackupStrategy: json.netBackupStrategy || "",
        netMaintenanceNeeds: json.netMaintenanceNeeds || "",
        netAdditionalNotes: json.netAdditionalNotes || "",
        supType: json.supType || "",
        supRemoteHours: json.supRemoteHours || "",
        supOnSiteHours: json.supOnSiteHours || "",
        supScheduleDays: json.supScheduleDays || "",
        supScheduleTimeStart: json.supScheduleTimeStart || "",
        supScheduleTimeEnd: json.supScheduleTimeEnd || "",
        supResponseTime: json.supResponseTime || "",
        supCurrentEquipBrand: json.supCurrentEquipBrand || "",
        supCurrentEquipModel: json.supCurrentEquipModel || "",
        supCurrentEquipQty: json.supCurrentEquipQty ? String(json.supCurrentEquipQty) : "",
        supCurrentEquipCondition: json.supCurrentEquipCondition || "",
        supCurrentEquipWarranty: json.supCurrentEquipWarranty || "",
        supCurrentSoftware: json.supCurrentSoftware || "",
        supCurrentIssues: json.supCurrentIssues || "",
        supRequiredServices: json.supRequiredServices || "",
        supRequiredCoverage: json.supRequiredCoverage || "",
        supRequiredSlA: json.supRequiredSlA || "",
        supRequiredTraining: json.supRequiredTraining ?? false,
        supRequiredDocumentation: json.supRequiredDocumentation ?? false,
        supRequiredInventory: json.supRequiredInventory ?? false,
        supRequiredOnSiteVisit: json.supRequiredOnSiteVisit ?? false,
        supRequiredRemoteAccess: json.supRequiredRemoteAccess ?? false,
        supClientExpectations: json.supClientExpectations || "",
        supBudgetRange: json.supBudgetRange || "",
        supContractDuration: json.supContractDuration || "",
        supAdditionalNotes: json.supAdditionalNotes || "",
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
        equipment: Array.isArray(json.equipment) ? json.equipment : [],
      });
    });
  }, [params.id]);

  if (error) return <div className="flex justify-center py-12 text-red-500">{error}</div>;
  if (!data) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-navy-300" /></div>;

  return <TechnicalReportForm existingData={data} />;
}
