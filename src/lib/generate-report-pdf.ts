import jsPDF from "jspdf";

const NAVY: [number, number, number] = [11, 20, 36];
const BLUE: [number, number, number] = [74, 144, 217];
const GRAY: [number, number, number] = [120, 120, 120];

type ReportData = Record<string, unknown> & {
  id: number;
  title: string;
  status: string;
  createdAt: string;
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
  cctvNightVision: boolean;
  cctvRemoteAccess: boolean;
  cctvAlarmIntegration: boolean;
  cctvAccessControl: boolean;
  cctvAdditionalNotes: string | null;
  netCurrentTopology: string | null;
  netCurrentBandwidth: string | null;
  netCurrentIsp: string | null;
  netCurrentRouter: string | null;
  netCurrentSwitch: string | null;
  netCurrentFirewall: string | null;
  netCurrentWifiAp: string | null;
  netCurrentIssues: string | null;
  netRequiredTopology: string | null;
  netRequiredEquipment: string | null;
  netRequiredSecurity: string | null;
  netAdditionalNotes: string | null;
  supType: string | null;
  supRemoteHours: string | null;
  supOnSiteHours: string | null;
  supScheduleDays: string | null;
  supResponseTime: string | null;
  supCurrentEquipBrand: string | null;
  supCurrentEquipModel: string | null;
  supCurrentEquipCondition: string | null;
  supCurrentSoftware: string | null;
  supCurrentIssues: string | null;
  supRequiredServices: string | null;
  supRequiredCoverage: string | null;
  supRequiredSlA: string | null;
  supClientExpectations: string | null;
  supBudgetRange: string | null;
  supContractDuration: string | null;
  supAdditionalNotes: string | null;
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
  currentSystems: string | null;
  erpUsers: number | null;
  erpModules: string | null;
  timelineExpectations: string | null;
  dataMigration: boolean | null;
  trainingRequirements: string | null;
  telecomNodes: number | null;
  telecomServers: number | null;
  telecomRacks: number | null;
  cablingType: string | null;
  fiberDistanceM: number | null;
  networkTopology: string | null;
  switchRouterDetails: string | null;
  upsRequirements: string | null;
  content: string;
  findings: string | null;
  recommendations: string | null;
  justification: string | null;
  observations: string | null;
  photos: Array<{ name: string; url: string; size?: number; type?: string }> | null;
  blueprints: Array<{ name: string; url: string; size?: number; type?: string }> | null;
  videos: Array<{ name: string; url: string; size?: number; type?: string }> | null;
  documents: Array<{ name: string; url: string; size?: number; type?: string }> | null;
  technicianSignature: string | null;
  clientSignature: string | null;
  clientName: string | null;
  clientDocType: string | null;
  clientDocNumber: string | null;
  clientPosition: string | null;
  equipment: Array<{ type: string; applies: boolean; brand: string; model: string; serialNumber: string; quantity: string; condition: string; specs: string; posProcessor?: string; posRam?: string; posStorageType?: string; posStorageCapacity?: string; posOs?: string; posNotes?: string }> | string | null;
  company: { name: string; taxId: string | null; taxIdType: string | null; address: string | null; phone: string | null; email: string | null; state: string | null; municipality: string | null };
  branch: { name: string } | null;
  creator: { name: string | null; email: string };
  inspectionTypes: string | null;
};

let logoBase64: string | null = null;

function drawFrame(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(14, 14, w - 28, h - 28);

  doc.setFillColor(...NAVY);
  doc.path([[0,0],[0,55],[55,0]], "F");
  doc.setFillColor(...BLUE);
  doc.path([[0,0],[0,38],[38,0]], "F");
  doc.setFillColor(...NAVY);
  doc.path([[0,0],[0,20],[20,0]], "F");
  doc.rect(0, 0, 60, 3, "F");
  doc.rect(0, 0, 3, 60, "F");

  doc.setFillColor(...NAVY);
  doc.path([[w,0],[w,55],[w-55,0]], "F");
  doc.setFillColor(...BLUE);
  doc.path([[w,0],[w,38],[w-38,0]], "F");
  doc.setFillColor(...NAVY);
  doc.path([[w,0],[w,20],[w-20,0]], "F");
  doc.rect(w-60, 0, 60, 3, "F");
  doc.rect(w-3, 0, 3, 60, "F");

  doc.setFillColor(...NAVY);
  doc.path([[0,h],[0,h-55],[55,h]], "F");
  doc.setFillColor(...BLUE);
  doc.path([[0,h],[0,h-38],[38,h]], "F");
  doc.setFillColor(...NAVY);
  doc.path([[0,h],[0,h-20],[20,h]], "F");
  doc.rect(0, h-3, 60, 3, "F");
  doc.rect(0, h-60, 3, 60, "F");

  doc.setFillColor(...NAVY);
  doc.path([[w,h],[w,h-55],[w-55,h]], "F");
  doc.setFillColor(...BLUE);
  doc.path([[w,h],[w,h-38],[w-38,h]], "F");
  doc.setFillColor(...NAVY);
  doc.path([[w,h],[w,h-20],[w-20,h]], "F");
  doc.rect(w-60, h-3, 60, 3, "F");
  doc.rect(w-3, h-60, 3, 60, "F");

  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  doc.text("SGI-MAN-003 Sistema de Gestion Integrada / Revision: 00", w - 7, h / 2, { align: "center", angle: 90 });
}

function drawFooter(doc: jsPDF, page: number) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(...NAVY);
  doc.rect(14, h-22, w-28, 10, "F");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("NEXUS TECHNOLOGY", 20, h-15);
  doc.text("Sistema de Gestion Integrada", w/2, h-15, { align: "center" });
  doc.text(`Pagina ${page}`, w-20, h-15, { align: "right" });
}

function drawHeaderInfo(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const now = new Date();
  const d = `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getFullYear()}`;
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`Fecha de Revision: ${d}`, w/2, 22, { align: "center" });
  doc.text(`Fecha de Elaboracion: ${d}`, w/2, 27, { align: "center" });
}

function sectTitle(doc: jsPDF, y: number, title: string): number {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NAVY);
  doc.rect(20, y, w-40, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold");
  doc.text(title, 23, y+4.5);
  doc.setFont("helvetica","normal");
  return y+9;
}

function fRow(doc: jsPDF, y: number, label: string, val: string|null|boolean|number|undefined, x=20, lw=40): number {
  if (val === null || val === undefined || val === "") return y;
  const w = doc.internal.pageSize.getWidth();
  const dv = typeof val === "boolean" ? (val?"Si":"No") : String(val);
  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica","bold");
  doc.text(label+":", x, y);
  doc.setFont("helvetica","normal");
  doc.setTextColor(50,50,50);
  const mw = w-20-x-lw-4;
  const lines = doc.splitTextToSize(dv, mw);
  doc.text(lines[0]||"", x+lw+3, y);
  return y+3.8*Math.max(1,lines.length);
}

function twoCol(doc: jsPDF, y: number, l1:string, v1:string|null, l2:string|null, v2:string|null): number {
  const y1 = l1 ? fRow(doc,y,l1,v1,20,36) : y;
  const y2 = l2 ? fRow(doc,y,l2,v2,110,36) : y;
  return Math.max(y1,y2)+1;
}

function textBlock(doc: jsPDF, y: number, text: string): number {
  if (!text) return y;
  const w = doc.internal.pageSize.getWidth();
  doc.setFontSize(7);
  doc.setTextColor(50,50,50);
  const lines = doc.splitTextToSize(text, w-46);
  doc.text(lines, 23, y);
  return y + lines.length*3.5 + 2;
}

let currentPage = 1;

function checkBreak(doc: jsPDF, y: number, need: number): number {
  const h = doc.internal.pageSize.getHeight();
  if (y + need > h - 28) {
    doc.addPage();
    currentPage++;
    drawFrame(doc);
    drawFooter(doc, currentPage);
    drawHeaderInfo(doc);
    return 38;
  }
  return y;
}

function loadImages(urls: string[]): Promise<Map<string, string>> {
  return new Promise((resolve) => {
    const map = new Map<string, string>();
    if (urls.length === 0) { resolve(map); return; }
    let done = 0;
    const total = urls.length;
    const timeout = setTimeout(() => resolve(map), 5000);
    urls.forEach(url => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
            map.set(url, canvas.toDataURL("image/jpeg", 0.7));
          } catch {}
          done++;
          if (done >= total) { clearTimeout(timeout); resolve(map); }
        };
        img.onerror = () => { done++; if (done >= total) { clearTimeout(timeout); resolve(map); } };
        img.src = url;
      } catch { done++; if (done >= total) { clearTimeout(timeout); resolve(map); } }
    });
  });
}

async function doGenerate(report: ReportData) {
  const doc = new jsPDF("p", "mm", "letter");
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  currentPage = 1;

  const photoUrls = (report.photos || []).map(p => p.url);
  const bpUrls = (report.blueprints || []).map(b => b.url);
  const allImageUrls = [...new Set([...photoUrls, ...bpUrls])];
  const imageMap = await loadImages(allImageUrls);

  drawFrame(doc);
  drawFooter(doc, 1);
  drawHeaderInfo(doc);

  let y = 35;
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica","bold");
  doc.text("INFORME DE INSPECCION TECNICA", w/2, y, { align: "center" });
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.setFont("helvetica","normal");
  doc.text(report.title || "", w/2, y, { align: "center" });
  y += 10;

  const typeLabels: Record<string,string> = { ERP_INSTALLATION:"Instalacion ERP", TELECOM_NETWORK:"Red Telecomunicaciones", SECURITY_CAMERAS:"Camaras Seguridad", SOFTWARE_DEV:"Desarrollo Software", TECH_SUPPORT:"Soporte Tecnico", SECURITY_ELECTRONIC:"Seguridad Electronica", OTHER:"Otro" };
  const hasTypes = report.inspectionTypes ? JSON.parse(report.inspectionTypes as string) : [];

  y = sectTitle(doc, y, "1. INFORMACION GENERAL");
  y = twoCol(doc, y, "Empresa", report.company?.name, "RIF", report.company?.taxId ? `${report.company.taxIdType||""}-${report.company.taxId}` : null);
  if (report.branch) y = fRow(doc, y, "Sucursal", report.branch.name, 20, 36);
  y = twoCol(doc, y, "Direccion", report.address||report.company?.address, "Ciudad", report.city);
  y = twoCol(doc, y, "Estado", report.state||report.company?.state, "Municipio", report.company?.municipality);
  y = twoCol(doc, y, "Contacto", report.contactName, "Telefono", report.contactPhone);
  y = twoCol(doc, y, "Email Contacto", report.contactEmail, "GPS", report.gmapUrl);
  y = twoCol(doc, y, "Creado por", report.creator?.name||report.creator?.email, "Estado", report.status==="SUBMITTED"?"Finalizado":"Borrador");
  if (hasTypes.length > 0) {
    y = fRow(doc, y, "Tipos de Inspeccion", hasTypes.map((t:string)=>typeLabels[t]||t).join(", "), 20, 36);
  }
  y += 3;

  if (report.equipment) {
    const eqArr = Array.isArray(report.equipment) ? report.equipment : (() => { try { return JSON.parse(String(report.equipment)); } catch { return []; } })();
    if (eqArr.length > 0) {
      y = checkBreak(doc, y, 20);
      y = sectTitle(doc, y, "2. EQUIPOS");
      for (const eq of eqArr) {
        y = checkBreak(doc, y, 18);
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.setFont("helvetica","bold");
        doc.text(`> ${eq.type}${eq.brand?" - "+eq.brand:""}${eq.model?" "+eq.model:""} ${eq.applies?"[Aplica]":"[No aplica]"}`, 23, y);
        doc.setFont("helvetica","normal");
        y += 4;
        if (eq.serialNumber) y = fRow(doc, y, "  Serial", eq.serialNumber, 23, 30);
        if (eq.quantity) y = fRow(doc, y, "  Cantidad", eq.quantity, 23, 30);
        if (eq.condition) y = fRow(doc, y, "  Condicion", eq.condition, 23, 30);
        if (eq.status) y = fRow(doc, y, "  Estado", eq.status, 23, 30);
        if (eq.specs) y = fRow(doc, y, "  Specs", eq.specs, 23, 30);
        if (eq.posProcessor) y = fRow(doc, y, "  Procesador", eq.posProcessor, 23, 30);
        if (eq.posRam) y = fRow(doc, y, "  RAM", eq.posRam, 23, 30);
        if (eq.posStorageType) y = fRow(doc, y, "  Almacenamiento", `${eq.posStorageType} ${eq.posStorageCapacity||""}`, 23, 30);
        if (eq.posOs) y = fRow(doc, y, "  SO", eq.posOs, 23, 30);
        if (eq.posNotes) y = fRow(doc, y, "  Notas POS", eq.posNotes, 23, 30);
      }
      y += 3;
    }
  }

  if (report.connectionType || report.bandwidth || report.powerSupply) {
    y = checkBreak(doc, y, 35);
    y = sectTitle(doc, y, "3. INFRAESTRUCTURA");
    y = twoCol(doc, y, "Tipo Conexion", report.connectionType, "Ancho Banda", report.bandwidth);
    y = twoCol(doc, y, "Suministro Elec.", report.powerSupply, "Aire Acondicionado", report.airConditioning != null ? (report.airConditioning ? "Si" : "No") : null);
    if (report.airConditioningDetails) y = fRow(doc, y, "Detalles A/C", report.airConditioningDetails, 20, 36);
    y = twoCol(doc, y, "Descarga", report.speedDownload?`${report.speedDownload} Mbps`:null, "Subida", report.speedUpload?`${report.speedUpload} Mbps`:null);
    y = twoCol(doc, y, "Latencia", report.speedLatency?`${report.speedLatency} ms`:null, "ISP", report.speedIsp);
    y = twoCol(doc, y, "Tipo Conn. Medida", report.speedConnectionType, "IP", report.speedIp);
    if (report.physicalSecurity) { y = fRow(doc, y, "Obs. Infraestructura", report.physicalSecurity, 20, 36); }
    y += 3;
  }

  if (hasTypes.includes("SECURITY_ELECTRONIC") || hasTypes.includes("SECURITY_CAMERAS") || report.secExistingSystem || report.cctvExistingSystem) {
    y = checkBreak(doc, y, 30);
    y = sectTitle(doc, y, "4. SEGURIDAD ELECTRONICA / CCTV");
    const secSys = report.secExistingSystem || report.cctvExistingSystem;
    y = twoCol(doc, y, "Sistema Existente", secSys, "Tipo Seguridad", report.secType);
    y = twoCol(doc, y, "Cant. Camaras", String(report.secCameraCount||report.cctvCameraCount||""), "Tipo Camara", report.secCameraType||report.cctvCameraType);
    y = twoCol(doc, y, "Resolucion", report.secCameraResolution||report.cctvCameraResolution, "Marca", report.secCameraBrand||report.cctvCameraBrand);
    y = twoCol(doc, y, "Condicion", report.secCameraCondition||report.cctvCameraCondition, "DVR/NVR Marca", report.secDvrNvrBrand||report.cctvDvrNvrBrand);
    y = twoCol(doc, y, "Tipo DVR/NVR", report.secDvrNvrType, "Dias Almacenamiento", String(report.secStorageDays||report.cctvRetentionDays||""));
    y = twoCol(doc, y, "Cableado", report.secCablingType||report.cctvCablingType, "Suministro Elec.", report.secPowerSupply||report.cctvPowerSupply);
    y = twoCol(doc, y, "Ubic. Monitoreo", report.secMonitoringLocation||report.cctvMonitoringLocation, "Cobertura", report.secAreasToCover||report.cctvAreasToCover);
    y = twoCol(doc, y, "Cubiertas", report.secAreasCovered||report.cctvAreasCovered, "Puntos Ciegos", report.secBlindSpots||report.cctvBlindSpots);
    const boolY = Math.max(y, y);
    if (report.secNightVision||report.cctvNightVision) y = fRow(doc, y, "Vision Nocturna", "Si", 20, 36);
    if (report.secRemoteAccess||report.cctvRemoteAccess) y = fRow(doc, y, "Acceso Remoto", "Si", 20, 36);
    if (report.secAlarmIntegration||report.cctvAlarmIntegration) y = fRow(doc, y, "Integracion Alarma", "Si", 20, 36);
    if (report.secAccessControl||report.cctvAccessControl) y = fRow(doc, y, "Control Acceso", "Si", 20, 36);
    if (report.secAdditionalNotes||report.cctvAdditionalNotes) y = fRow(doc, y, "Notas", report.secAdditionalNotes||report.cctvAdditionalNotes, 20, 36);
    y += 3;
  }

  if (hasTypes.includes("TELECOM_NETWORK") || report.netCurrentTopology || report.telecomNodes) {
    y = checkBreak(doc, y, 30);
    y = sectTitle(doc, y, "5. RED DE TELECOMUNICACIONES");
    y = twoCol(doc, y, "Topologia Actual", report.netCurrentTopology, "Ancho Banda Actual", report.netCurrentBandwidth);
    y = twoCol(doc, y, "ISP Actual", report.netCurrentIsp, "Router", report.netCurrentRouter);
    y = twoCol(doc, y, "Switch", report.netCurrentSwitch, "Firewall", report.netCurrentFirewall);
    y = twoCol(doc, y, "WiFi AP", report.netCurrentWifiAp, "Topologia Requerida", report.netRequiredTopology);
    y = twoCol(doc, y, "Equipo Requerido", report.netRequiredEquipment, "Seguridad Req.", report.netRequiredSecurity);
    y = twoCol(doc, y, "Nodos", String(report.telecomNodes||""), "Servidores", String(report.telecomServers||""));
    y = twoCol(doc, y, "Racks", String(report.telecomRacks||""), "Fibra (m)", String(report.fiberDistanceM||""));
    y = twoCol(doc, y, "Tipo Cableado", report.cablingType, "Topologia Red", report.networkTopology);
    y = twoCol(doc, y, "Switch/Router Det.", report.switchRouterDetails, "Requisitos UPS", report.upsRequirements);
    if (report.netAdditionalNotes) y = fRow(doc, y, "Notas Red", report.netAdditionalNotes, 20, 36);
    y += 3;
  }

  if (hasTypes.includes("SOFTWARE_DEV") || report.swDevType) {
    y = checkBreak(doc, y, 30);
    y = sectTitle(doc, y, "6. DESARROLLO DE SOFTWARE");
    y = twoCol(doc, y, "Tipo Desarrollo", report.swDevType, "Plataforma", report.swDevPlatform);
    y = fRow(doc, y, "Funcionalidades", report.swDevFeatures, 20, 36);
    y = fRow(doc, y, "Roles Usuario", report.swDevUserRoles, 20, 36);
    y = fRow(doc, y, "Integraciones", report.swDevIntegrations, 20, 36);
    y = twoCol(doc, y, "Hosting", report.swDevHosting, "Base Datos", report.swDevDatabase);
    y = twoCol(doc, y, "Dominio", report.swDevDomain, "SSL", report.swDevSSL!=null?(report.swDevSSL?"Si":"No"):null);
    y = fRow(doc, y, "Diseño", report.swDevDesignReqs, 20, 36);
    y = twoCol(doc, y, "Responsive", report.swDevMobileResponsive!=null?(report.swDevMobileResponsive?"Si":"No"):null, "Branding", report.swDevBranding!=null?(report.swDevBranding?"Si":"No"):null);
    y = fRow(doc, y, "Seguridad", report.swDevSecurityReqs, 20, 36);
    y = twoCol(doc, y, "Auth", report.swDevAuthType, "Control Version", report.swDevVersionControl);
    y = twoCol(doc, y, "CI/CD", report.swDevCICD!=null?(report.swDevCICD?"Si":"No"):null, "Testing", report.swDevTesting);
    y = twoCol(doc, y, "Presupuesto", report.swDevBudget, "Mantenimiento", report.swDevMaintenance);
    y = twoCol(doc, y, "Documentacion", report.swDevDocumentation, "Timeline", report.timelineExpectations);
    y = twoCol(doc, y, "Usuarios ERP", String(report.erpUsers||""), "Modulos ERP", report.erpModules);
    y = twoCol(doc, y, "Sistemas Actuales", report.currentSystems, "Migracion Datos", report.dataMigration!=null?(report.dataMigration?"Si":"No"):null);
    y = fRow(doc, y, "Capacitacion", report.trainingRequirements, 20, 36);
    if (report.swDevAdditionalNotes) y = fRow(doc, y, "Notas", report.swDevAdditionalNotes, 20, 36);
    y += 3;
  }

  if (hasTypes.includes("TECH_SUPPORT") || report.supType) {
    y = checkBreak(doc, y, 30);
    y = sectTitle(doc, y, "7. SOPORTE TECNICO");
    y = twoCol(doc, y, "Tipo Soporte", report.supType, "Horas Remoto", report.supRemoteHours);
    y = twoCol(doc, y, "Horas Presencial", report.supOnSiteHours, "Dias Horario", report.supScheduleDays);
    y = twoCol(doc, y, "Tiempo Respuesta", report.supResponseTime, "SLA", report.supRequiredSlA);
    y = twoCol(doc, y, "Equipo Marca", report.supCurrentEquipBrand, "Equipo Modelo", report.supCurrentEquipModel);
    y = twoCol(doc, y, "Condicion Equipo", report.supCurrentEquipCondition, "Software Actual", report.supCurrentSoftware);
    y = fRow(doc, y, "Problemas Actuales", report.supCurrentIssues, 20, 36);
    y = fRow(doc, y, "Servicios Requeridos", report.supRequiredServices, 20, 36);
    y = twoCol(doc, y, "Cobertura", report.supRequiredCoverage, "Rango Presupuesto", report.supBudgetRange);
    y = fRow(doc, y, "Expectativas", report.supClientExpectations, 20, 36);
    y = twoCol(doc, y, "Duracion Contrato", report.supContractDuration, null, null);
    if (report.supAdditionalNotes) y = fRow(doc, y, "Notas", report.supAdditionalNotes, 20, 36);
    y += 3;
  }

  if (report.content) {
    y = checkBreak(doc, y, 20);
    y = sectTitle(doc, y, "8. DESCRIPCION Y CONTENIDO");
    y = textBlock(doc, y, String(report.content));
    y += 2;
  }

  if (report.findings) {
    y = checkBreak(doc, y, 20);
    y = sectTitle(doc, y, "9. HALLAZGOS");
    y = textBlock(doc, y, String(report.findings));
    y += 2;
  }

  if (report.recommendations) {
    y = checkBreak(doc, y, 20);
    y = sectTitle(doc, y, "10. RECOMENDACIONES");
    y = textBlock(doc, y, String(report.recommendations));
    y += 2;
  }

  if (report.justification) {
    y = checkBreak(doc, y, 20);
    y = sectTitle(doc, y, "11. JUSTIFICACION");
    y = textBlock(doc, y, String(report.justification));
    y += 2;
  }

  if (report.observations) {
    y = checkBreak(doc, y, 20);
    y = sectTitle(doc, y, "12. OBSERVACIONES");
    y = textBlock(doc, y, String(report.observations));
    y += 2;
  }

  if (report.photos && report.photos.length > 0) {
    y = checkBreak(doc, y, 20);
    y = sectTitle(doc, y, "13. FOTOGRAFIAS");
    const thumbW = 55;
    const thumbH = 40;
    const gap = 5;
    let col = 0;
    for (const photo of report.photos) {
      const imgData = imageMap.get(photo.url);
      if (!imgData) continue;
      const x = 20 + col * (thumbW + gap);
      y = checkBreak(doc, y, thumbH + 8);
      try {
        doc.addImage(imgData, "JPEG", x, y, thumbW, thumbH);
        doc.setDrawColor(180,180,180);
        doc.setLineWidth(0.2);
        doc.rect(x, y, thumbW, thumbH);
      } catch {}
      doc.setFontSize(5);
      doc.setTextColor(...GRAY);
      doc.text(photo.name, x, y + thumbH + 3);
      col++;
      if (col >= 3) { col = 0; y += thumbH + 6; }
    }
    if (col > 0) y += thumbH + 6;
    y += 3;
  }

  if (report.blueprints && report.blueprints.length > 0) {
    y = checkBreak(doc, y, 20);
    y = sectTitle(doc, y, "14. PLANOS");
    for (const bp of report.blueprints) {
      const imgData = imageMap.get(bp.url);
      if (imgData) {
        y = checkBreak(doc, y, 50);
        try {
          doc.addImage(imgData, "JPEG", 20, y, 80, 50);
          doc.setDrawColor(180,180,180);
          doc.rect(20, y, 80, 50);
        } catch {}
        doc.setFontSize(5);
        doc.setTextColor(...GRAY);
        doc.text(bp.name, 20, y + 53);
        y += 56;
      } else {
        y = fRow(doc, y, "  Plano", bp.name, 20, 30);
      }
    }
    y += 3;
  }

  if (report.videos && report.videos.length > 0) {
    y = checkBreak(doc, y, 15);
    y = sectTitle(doc, y, "15. VIDEOS");
    for (const v of report.videos) {
      y = fRow(doc, y, "  Video", `${v.name} (${v.url})`, 20, 30);
    }
    y += 3;
  }

  if (report.documents && report.documents.length > 0) {
    y = checkBreak(doc, y, 15);
    y = sectTitle(doc, y, "16. DOCUMENTOS");
    for (const d of report.documents) {
      y = fRow(doc, y, "  Doc", `${d.name} (${d.url})`, 20, 30);
    }
    y += 3;
  }

  if (report.technicianSignature || report.clientSignature) {
    y = checkBreak(doc, y, 55);
    y = sectTitle(doc, y, "17. FIRMAS");
    y += 3;

    const sigW = 70;
    const sigH = 22;

    if (report.technicianSignature) {
      doc.setFontSize(8);
      doc.setTextColor(...NAVY);
      doc.setFont("helvetica","bold");
      doc.text("Firma del Tecnico:", 23, y);
      doc.setFont("helvetica","normal");
      y += 3;
      doc.setDrawColor(180,180,180);
      doc.setLineWidth(0.3);
      doc.rect(23, y, sigW, sigH);
      try { doc.addImage(report.technicianSignature, "PNG", 24, y+1, sigW-2, sigH-2); } catch {}
      y += sigH + 6;
    }

    if (report.clientSignature) {
      const cx = 120;
      const cy = report.technicianSignature ? y - sigH - 9 : y;
      doc.setFontSize(8);
      doc.setTextColor(...NAVY);
      doc.setFont("helvetica","bold");
      doc.text("Firma del Cliente:", cx, cy);
      doc.setFont("helvetica","normal");
      doc.setFontSize(7);
      if (report.clientName) doc.text(`Nombre: ${report.clientName}`, cx, cy+5);
      if (report.clientDocNumber) doc.text(`Doc: ${report.clientDocType||""}-${report.clientDocNumber}`, cx, cy+9);
      if (report.clientPosition) doc.text(`Cargo: ${report.clientPosition}`, cx, cy+13);
      doc.setDrawColor(180,180,180);
      doc.setLineWidth(0.3);
      doc.rect(cx, cy+15, sigW, sigH);
      try { doc.addImage(report.clientSignature, "PNG", cx+1, cy+16, sigW-2, sigH-2); } catch {}
    }
  }

  // Update all page footers with correct page count
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i);
  }

  doc.save(`Inspeccion_${report.id}_${report.company?.name||"reporte"}.pdf`);
}

export function generateReportPDF(report: ReportData): Promise<void> {
  return new Promise((resolve) => {
    fetch("/logo/logo.png")
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => { logoBase64 = reader.result as string; doGenerate(report).then(resolve).catch(() => resolve()); };
        reader.onerror = () => { doGenerate(report).then(resolve).catch(() => resolve()); };
        reader.readAsDataURL(blob);
      })
      .catch(() => { doGenerate(report).then(resolve).catch(() => resolve()); });
  });
}
