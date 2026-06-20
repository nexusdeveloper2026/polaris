import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function randDays(min: number, max: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * (max - min) + min));
  return d;
}

function pastDays(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function futureDays(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("🌱 Iniciando seed completo...");

  const modules = [
    "dashboard", "companies", "users", "roles", "licenses", "products", "visits",
    "supportCases", "technicalReports", "implementationSheets", "alerts", "transfers", "productCategories",
  ];
  const actions = ["view", "create", "edit", "delete"];
  const fullPermissions: Record<string, Record<string, boolean>> = {};
  modules.forEach((m) => { fullPermissions[m] = {}; actions.forEach((a) => { fullPermissions[m][a] = true; }); });

  const limitedPermissions: Record<string, Record<string, boolean>> = {
    dashboard: { view: true, create: false, edit: false, delete: false },
    companies: { view: true, create: true, edit: true, delete: false },
    users: { view: true, create: false, edit: false, delete: false },
    roles: { view: false, create: false, edit: false, delete: false },
    licenses: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    visits: { view: true, create: true, edit: true, delete: false },
    supportCases: { view: true, create: true, edit: true, delete: false },
    technicalReports: { view: true, create: true, edit: true, delete: false },
    implementationSheets: { view: true, create: false, edit: false, delete: false },
    alerts: { view: true, create: false, edit: false, delete: false },
    transfers: { view: true, create: true, edit: false, delete: false },
    productCategories: { view: true, create: false, edit: false, delete: false },
  };

  const techPermissions: Record<string, Record<string, boolean>> = {
    dashboard: { view: true, create: false, edit: false, delete: false },
    companies: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    roles: { view: false, create: false, edit: false, delete: false },
    licenses: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    visits: { view: true, create: true, edit: true, delete: false },
    supportCases: { view: true, create: true, edit: true, delete: false },
    technicalReports: { view: true, create: true, edit: true, delete: false },
    implementationSheets: { view: true, create: true, edit: true, delete: false },
    alerts: { view: true, create: false, edit: false, delete: false },
    transfers: { view: true, create: false, edit: false, delete: false },
    productCategories: { view: false, create: false, edit: false, delete: false },
  };

  // ─── ROLES ───────────────────────────────────────────
  console.log("  📋 Creando roles...");
  const roleSuperUser = await prisma.role.upsert({ where: { name: "superUser" }, update: {}, create: { name: "superUser", description: "Super administrador con acceso total", permissions: fullPermissions as any } });
  const roleAdmin = await prisma.role.upsert({ where: { name: "admin" }, update: {}, create: { name: "admin", description: "Administrador del sistema", permissions: limitedPermissions as any } });
  const roleTech = await prisma.role.upsert({ where: { name: "tecnico" }, update: {}, create: { name: "tecnico", description: "Técnico de soporte y campo", permissions: techPermissions as any } });
  const roleSales = await prisma.role.upsert({ where: { name: "ventas" }, update: {}, create: { name: "ventas", description: "Ventas y atención al cliente", permissions: limitedPermissions as any } });
  const roleSupport = await prisma.role.upsert({ where: { name: "soporte" }, update: {}, create: { name: "soporte", description: "Soporte técnico", permissions: limitedPermissions as any } });

  // ─── USERS ───────────────────────────────────────────
  console.log("  👤 Creando usuarios...");
  const pass = await hash("123456", 10);
  const admin = await prisma.user.upsert({ where: { email: "admin@admin.com" }, update: {}, create: { email: "admin@admin.com", name: "Administrador General", password: pass, roleId: roleSuperUser.id, isActive: true, docType: "V", docNumber: "12345678", position: "Gerente General", state: "Distrito Capital", fullAddress: "Av. Principal, Edif. 5, Piso 2, Caracas" } });

  const u2 = await prisma.user.upsert({ where: { email: "carlos.mendoza@nexus.com" }, update: {}, create: { email: "carlos.mendoza@nexus.com", name: "Carlos Mendoza", password: pass, roleId: roleTech.id, isActive: true, docType: "V", docNumber: "18456789", position: "Técnico Senior", state: "Zulia", fullAddress: "Calle 5, Maracaibo", hasCommissions: false } });

  const u3 = await prisma.user.upsert({ where: { email: "maria.gonzalez@nexus.com" }, update: {}, create: { email: "maria.gonzalez@nexus.com", name: "María González", password: pass, roleId: roleSales.id, isActive: true, docType: "V", docNumber: "20123456", position: "Ejecutiva de Ventas", state: "Miranda", fullAddress: "Av. Francisco Fajardo, Caracas", hasCommissions: true } });

  const u4 = await prisma.user.upsert({ where: { email: "pedro.rivas@nexus.com" }, update: {}, create: { email: "pedro.rivas@nexus.com", name: "Pedro Rivas", password: pass, roleId: roleTech.id, isActive: true, docType: "V", docNumber: "19789012", position: "Técnico de Campo", state: "Aragua", fullAddress: "Calle Norte, Maracay", hasCommissions: false } });

  const u5 = await prisma.user.upsert({ where: { email: "ana.torres@nexus.com" }, update: {}, create: { email: "ana.torres@nexus.com", name: "Ana Torres", password: pass, roleId: roleSupport.id, isActive: true, docType: "V", docNumber: "21345678", position: "Agente de Soporte", state: "Carabobo", fullAddress: "Av. Bolívar, Valencia", hasCommissions: false } });

  const u6 = await prisma.user.upsert({ where: { email: "jose.martinez@nexus.com" }, update: {}, create: { email: "jose.martinez@nexus.com", name: "José Martínez", password: pass, roleId: roleSales.id, isActive: true, docType: "V", docNumber: "17654321", position: "Gerente de Ventas", state: "Lara", fullAddress: "Av. Libertador, Barquisimeto", hasCommissions: true } });

  const u7 = await prisma.user.upsert({ where: { email: "lucia.fernandez@nexus.com" }, update: {}, create: { email: "lucia.fernandez@nexus.com", name: "Lucía Fernández", password: pass, roleId: roleAdmin.id, isActive: true, docType: "V", docNumber: "22456789", position: "Coordinadora Administrativa", state: "Distrito Capital", fullAddress: "Calle El Hatillo, Caracas", hasCommissions: false } });

  // ─── PRODUCT CATEGORIES ──────────────────────────────
  console.log("  📂 Creando categorías...");
  const catERP = await prisma.productCategory.upsert({ where: { name: "Sistemas ERP" }, update: {}, create: { name: "Sistemas ERP", description: "Sistemas de planificación de recursos empresariales" } });
  const catRedes = await prisma.productCategory.upsert({ where: { name: "Redes e Infraestructura" }, update: {}, create: { name: "Redes e Infraestructura", description: "Equipos y servicios de redes de telecomunicaciones" } });
  const catSeguridad = await prisma.productCategory.upsert({ where: { name: "Seguridad Electrónica" }, update: {}, create: { name: "Seguridad Electrónica", description: "Cámaras, alarmas y sistemas de seguridad" } });
  const catSoporte = await prisma.productCategory.upsert({ where: { name: "Soporte Técnico" }, update: {}, create: { name: "Soporte Técnico", description: "Servicios de soporte y mantenimiento" } });
  const catCloud = await prisma.productCategory.upsert({ where: { name: "Servicios Cloud" }, update: {}, create: { name: "Servicios Cloud", description: "Servicios de computación en la nube" } });
  const catConsultoria = await prisma.productCategory.upsert({ where: { name: "Consultoría" }, update: {}, create: { name: "Consultoría", description: "Servicios de consultoría tecnológica" } });

  // ─── PRODUCTS / SERVICES ─────────────────────────────
  console.log("  📦 Creando productos y servicios...");
  const p1 = await prisma.product.create({ data: { name: "NEXUS ERP Pro", description: "Sistema ERP completo para empresas medianas y grandes", categoryId: catERP.id, type: "PRODUCT", cost: 4500, price: 8500, discountPercent: 10, ivaPercent: 16, paymentPeriod: "ANNUAL", dailyPrice: 23.3 } });
  const p2 = await prisma.product.create({ data: { name: "NEXUS ERP Lite", description: "ERP simplificado para pequeñas empresas", categoryId: catERP.id, type: "PRODUCT", cost: 1800, price: 3500, discountPercent: 5, ivaPercent: 16, paymentPeriod: "ANNUAL", dailyPrice: 9.59 } });
  const p3 = await prisma.product.create({ data: { name: "Servidor Dell PowerEdge R750", description: "Servidor rack 2U, Xeon Silver, 64GB RAM", categoryId: catRedes.id, type: "PRODUCT", cost: 8500, price: 14500, discountPercent: 0, ivaPercent: 16, paymentPeriod: "ONE_TIME", dailyPrice: 0 } });
  const p4 = await prisma.product.create({ data: { name: "Switch Cisco Catalyst 9300", description: "Switch empresarial 48 puertos PoE+", categoryId: catRedes.id, type: "PRODUCT", cost: 3200, price: 5800, discountPercent: 5, ivaPercent: 16, paymentPeriod: "ONE_TIME", dailyPrice: 0 } });
  const p5 = await prisma.product.create({ data: { name: "Cámara Hikvision DS-2CD2387G2", description: "Cámara IP dome 8MP, visión nocturna ColorVu", categoryId: catSeguridad.id, type: "PRODUCT", cost: 280, price: 520, discountPercent: 0, ivaPercent: 16, paymentPeriod: "ONE_TIME", dailyPrice: 0 } });
  const p6 = await prisma.product.create({ data: { name: "NVR Hikvision DS-7632NI", description: "Grabador de video en red 32 canales", categoryId: catSeguridad.id, type: "PRODUCT", cost: 650, price: 1200, discountPercent: 0, ivaPercent: 16, paymentPeriod: "ONE_TIME", dailyPrice: 0 } });
  const p7 = await prisma.product.create({ data: { name: "Soporte Técnico Remoto", description: "Servicio de soporte técnico remoto por hora", categoryId: catSoporte.id, type: "SERVICE", cost: 15, price: 45, discountPercent: 0, ivaPercent: 16, paymentPeriod: "MONTHLY", dailyPrice: 1.5 } });
  const p8 = await prisma.product.create({ data: { name: "Mantenimiento Preventivo", description: "Servicio de mantenimiento preventivo mensual", categoryId: catSoporte.id, type: "SERVICE", cost: 200, price: 450, discountPercent: 10, ivaPercent: 16, paymentPeriod: "MONTHLY", dailyPrice: 15 } });
  const p9 = await prisma.product.create({ data: { name: "Instalación de Red", description: "Servicio de instalación y configuración de red", categoryId: catRedes.id, type: "SERVICE", cost: 500, price: 1200, discountPercent: 0, ivaPercent: 16, paymentPeriod: "ONE_TIME", dailyPrice: 0 } });
  const p10 = await prisma.product.create({ data: { name: "Consultoría ERP", description: "Servicio de consultoría para implementación ERP", categoryId: catConsultoria.id, type: "SERVICE", cost: 80, price: 150, discountPercent: 0, ivaPercent: 16, paymentPeriod: "MONTHLY", dailyPrice: 5 } });
  const p11 = await prisma.product.create({ data: { name: "Microsoft 365 Business", description: "Licencia Microsoft 365 Business Standard", categoryId: catCloud.id, type: "SERVICE", cost: 8, price: 15, discountPercent: 0, ivaPercent: 16, paymentPeriod: "MONTHLY", dailyPrice: 0.5 } });
  const p12 = await prisma.product.create({ data: { name: "Backup en la Nube", description: "Servicio de respaldo cloud 1TB", categoryId: catCloud.id, type: "SERVICE", cost: 25, price: 60, discountPercent: 5, ivaPercent: 16, paymentPeriod: "MONTHLY", dailyPrice: 2 } });
  const p13 = await prisma.product.create({ data: { name: "Firewall FortiGate 60F", description: "Firewall empresarial con UTM", categoryId: catRedes.id, type: "PRODUCT", cost: 800, price: 1500, discountPercent: 5, ivaPercent: 16, paymentPeriod: "ONE_TIME", dailyPrice: 0 } });
  const p14 = await prisma.product.create({ data: { name: "Acceso Point Ubiquiti U6", description: "Access Point WiFi 6 empresarial", categoryId: catRedes.id, type: "PRODUCT", cost: 150, price: 280, discountPercent: 0, ivaPercent: 16, paymentPeriod: "ONE_TIME", dailyPrice: 0 } });
  const p15 = await prisma.product.create({ data: { name: "Capacitación ERP", description: "Servicio de capacitación para usuarios del ERP", categoryId: catConsultoria.id, type: "SERVICE", cost: 50, price: 100, discountPercent: 0, ivaPercent: 16, paymentPeriod: "OTHER", dailyPrice: 0 } });

  // ─── COMPANIES (MAIN) ───────────────────────────────
  console.log("  🏢 Creando empresas MAIN...");
  const c1 = await prisma.company.create({ data: { name: "Constructora Venezolana S.A.", taxIdType: "J", taxId: "401234567", phone: "+58-212-5551234", email: "info@constructoravzla.com", website: "www.constructoravzla.com", type: "MAIN", state: "Distrito Capital", municipality: "Libertador", parish: "El Recreo", localidad: "Las Mercedes", address: "Av. Francisco Fajardo, Torre Empresarial, Piso 8, Caracas", salesRepId: u3.id, economicActivity: "Construcción", isActive: true, notes: "Cliente desde 2019. Empresa líder en construcción." } });
  const c2 = await prisma.company.create({ data: { name: "Distribuidora Mercal C.A.", taxIdType: "J", taxId: "412345678", phone: "+58-241-5556789", email: "ventas@mercal.com.ve", type: "MAIN", state: "Aragua", municipality: "Mario Briceño Iragorry", parish: "El Limón", address: "Calle Principal, Centro Comercial Mercal, Local 12, Maracay", salesRepId: u6.id, economicActivity: "Comercio", isActive: true } });
  const c3 = await prisma.company.create({ data: { name: "Petróleos del Caribe S.R.L.", taxIdType: "J", taxId: "423456789", phone: "+58-261-5554321", email: "admin@petrocaribe.com", type: "MAIN", state: "Zulia", municipality: "San Francisco", parish: "San Francisco", address: "Av. Bella Vista, Edif. Petrocaribe, Piso 3, Maracaibo", salesRepId: u3.id, economicActivity: "Servicios", isActive: true, notes: "Servicios petroleros y mantenimiento industrial." } });
  const c4 = await prisma.company.create({ data: { name: "Farmacia Salud Total C.A.", taxIdType: "J", taxId: "434567890", phone: "+58-241-5557890", email: "gerencia@saludtotal.com.ve", type: "MAIN", state: "Carabobo", municipality: "Valencia", parish: "Santa Rosa", address: "Av. Bolívar, Centro Médico, Piso 1, Valencia", salesRepId: u6.id, economicActivity: "Salud", isActive: true } });
  const c5 = await prisma.company.create({ data: { name: "Tecnología Avanzada C.A.", taxIdType: "J", taxId: "445678901", phone: "+58-212-5553456", email: "info@tecav.com.ve", website: "www.tecav.com.ve", type: "MAIN", state: "Distrito Capital", municipality: "Chacao", parish: "Chacao", address: "Av. Principal de Las Mercedes, Edif. TecAv, Piso 5", salesRepId: u3.id, economicActivity: "Tecnología", isActive: true } });

  // ─── COMPANIES (BRANCH) ─────────────────────────────
  console.log("  🏬 Creando sucursales...");
  const b1 = await prisma.company.create({ data: { name: "Constructora Venezolana - Maracaibo", taxIdType: "J", taxId: "401234567", type: "BRANCH", parentId: c1.id, state: "Zulia", municipality: "San Cristóbal", parish: "San Cristóbal", address: "Calle 4, Zona Industrial, Maracaibo", phone: "+58-261-5551111", email: "maracaibo@constructoravzla.com", isActive: true } });
  const b2 = await prisma.company.create({ data: { name: "Constructora Venezolana - Valencia", taxIdType: "J", taxId: "401234567", type: "BRANCH", parentId: c1.id, state: "Carabobo", municipality: "Valencia", parish: "Naguanagua", address: "Av. Industrial, Zona Franca, Valencia", phone: "+58-241-5552222", email: "valencia@constructoravzla.com", isActive: true } });
  const b3 = await prisma.company.create({ data: { name: "Mercal - Sucursal Barquisimeto", taxIdType: "J", taxId: "412345678", type: "BRANCH", parentId: c2.id, state: "Lara", municipality: "Iribarren", parish: "Aguedo Felipe Alvarado", address: "Av. Libertador, Centro Comercial Plaza Mayor, Local 5, Barquisimeto", phone: "+58-251-5553333", email: "barquisimeto@mercal.com.ve", isActive: true } });
  const b4 = await prisma.company.create({ data: { name: "Mercal - Sucursal Valencia", taxIdType: "J", taxId: "412345678", type: "BRANCH", parentId: c2.id, state: "Carabobo", municipality: "Valencia", parish: "San Diego", address: "Calle Principal, Centro Comercial Mercal II, Valencia", phone: "+58-241-5554444", email: "valencia@mercal.com.ve", isActive: true } });

  // ─── CONTACTS ────────────────────────────────────────
  console.log("  📇 Creando contactos...");
  const contact1 = await prisma.contact.create({ data: { companyId: c1.id, name: "Roberto Méndez", position: "Gerente de TI", phone: "+58-212-5551234", email: "rmendez@constructoravzla.com", isPrimary: true } });
  const contact2 = await prisma.contact.create({ data: { companyId: c1.id, name: "Laura Suárez", position: "Directora de Operaciones", phone: "+58-212-5551235", email: "lsuarez@constructoravzla.com", isPrimary: false } });
  const contact3 = await prisma.contact.create({ data: { companyId: c2.id, name: "Fernando Paredes", position: "Gerente General", phone: "+58-241-5556789", email: "fparedes@mercal.com.ve", isPrimary: true } });
  const contact4 = await prisma.contact.create({ data: { companyId: c3.id, name: "Sandra Rondón", position: "Jefe de Sistemas", phone: "+58-261-5554321", email: "srondon@petrocaribe.com", isPrimary: true } });
  const contact5 = await prisma.contact.create({ data: { companyId: c4.id, name: "Dra. Carmen López", position: "Directora Médica", phone: "+58-241-5557890", email: "clopez@saludtotal.com.ve", isPrimary: true } });
  const contact6 = await prisma.contact.create({ data: { companyId: c5.id, name: "Ing. Manuel Reyes", position: "Director de Tecnología", phone: "+58-212-5553456", email: "mreyes@tecav.com.ve", isPrimary: true } });

  // ─── LICENSES ────────────────────────────────────────
  console.log("  🔑 Creando licencias...");
  const l1 = await prisma.license.create({ data: { licenseKey: "NXER-PRO-2024-ABCD", productId: p1.id, startDate: pastDays(365), endDate: futureDays(30), maxUsers: 50, status: "ACTIVE", licenseType: "SUBSCRIPTION", renewalPeriod: "ANNUAL", autoRenew: true, vendor: "NEXUS Technology", costUSD: 4500, supportHours: 40, name: "NEXUS ERP Pro - Corporativo", version: "8.2", edition: "Enterprise" } });
  const l2 = await prisma.license.create({ data: { licenseKey: "NXER-LITE-2024-EFGH", productId: p2.id, startDate: pastDays(180), endDate: futureDays(15), maxUsers: 10, status: "ACTIVE", licenseType: "SUBSCRIPTION", renewalPeriod: "ANNUAL", autoRenew: false, vendor: "NEXUS Technology", costUSD: 1800, supportHours: 20, name: "NEXUS ERP Lite - PYME", version: "8.2", edition: "Standard" } });
  const l3 = await prisma.license.create({ data: { licenseKey: "MS365-BIZ-2024-IJKL", productId: p11.id, startDate: pastDays(90), endDate: futureDays(270), maxUsers: 25, status: "ACTIVE", licenseType: "SUBSCRIPTION", renewalPeriod: "ANNUAL", autoRenew: true, vendor: "Microsoft", costUSD: 200, name: "Microsoft 365 Business Standard", version: "Current", edition: "Business Standard" } });
  const l4 = await prisma.license.create({ data: { licenseKey: "FORT-UTM-2024-MNOP", productId: p13.id, startDate: pastDays(120), endDate: futureDays(245), maxUsers: 1, status: "ACTIVE", licenseType: "SUBSCRIPTION", renewalPeriod: "ANNUAL", autoRenew: true, vendor: "Fortinet", costUSD: 800, supportHours: 24, name: "FortiGate UTM Bundle", version: "7.2", edition: "UTM" } });
  const l5 = await prisma.license.create({ data: { licenseKey: "NXERP-PRO-2023-QRST", productId: p1.id, startDate: pastDays(730), endDate: pastDays(30), maxUsers: 30, status: "EXPIRED", licenseType: "PERPETUAL", vendor: "NEXUS Technology", costUSD: 6000, name: "NEXUS ERP Pro - Legacy", version: "7.5", edition: "Enterprise" } });
  const l6 = await prisma.license.create({ data: { licenseKey: "HIKV-CAM-2024-UVWX", productId: p5.id, startDate: pastDays(60), endDate: futureDays(305), maxUsers: 1, status: "ACTIVE", licenseType: "OEM", vendor: "Hikvision", costUSD: 280, name: "Hikvision Camera License Pack", version: "5.7", edition: "Pro" } });
  const l7 = await prisma.license.create({ data: { licenseKey: "BKUP-CLOUD-2024-YZAB", productId: p12.id, startDate: pastDays(45), endDate: futureDays(320), maxUsers: 5, status: "ACTIVE", licenseType: "SUBSCRIPTION", renewalPeriod: "MONTHLY", autoRenew: true, vendor: "NEXUS Cloud", costUSD: 25, supportHours: 8, name: "Backup Cloud 1TB", version: "3.1", edition: "Business" } });

  // ─── LICENSE ASSIGNMENTS ─────────────────────────────
  console.log("  🔗 Asignando licencias...");
  const la1 = await prisma.licenseAssignment.create({ data: { licenseId: l1.id, companyId: c1.id, status: "ACTIVE", renewalPeriod: "ANNUAL", priceOverride: 8500, supportHours: 40, trainingSessions: 3, renewalEndDate: futureDays(30) } });
  const la2 = await prisma.licenseAssignment.create({ data: { licenseId: l1.id, companyId: c1.id, branchId: b1.id, status: "ACTIVE", renewalPeriod: "ANNUAL", priceOverride: 4250, supportHours: 20, trainingSessions: 1, renewalEndDate: futureDays(30) } });
  const la3 = await prisma.licenseAssignment.create({ data: { licenseId: l2.id, companyId: c2.id, status: "ACTIVE", renewalPeriod: "ANNUAL", priceOverride: 3500, supportHours: 20, renewalEndDate: futureDays(15) } });
  const la4 = await prisma.licenseAssignment.create({ data: { licenseId: l3.id, companyId: c2.id, branchId: b3.id, status: "ACTIVE", renewalPeriod: "ANNUAL", priceOverride: 15, supportHours: 10, renewalEndDate: futureDays(270) } });
  const la5 = await prisma.licenseAssignment.create({ data: { licenseId: l3.id, companyId: c5.id, status: "ACTIVE", renewalPeriod: "ANNUAL", priceOverride: 15, supportHours: 10, renewalEndDate: futureDays(270) } });
  const la6 = await prisma.licenseAssignment.create({ data: { licenseId: l4.id, companyId: c3.id, status: "ACTIVE", renewalPeriod: "ANNUAL", priceOverride: 1500, supportHours: 24, renewalEndDate: futureDays(245) } });
  const la7 = await prisma.licenseAssignment.create({ data: { licenseId: l5.id, companyId: c4.id, status: "EXPIRED", renewalEndDate: pastDays(30) } });
  const la8 = await prisma.licenseAssignment.create({ data: { licenseId: l6.id, companyId: c3.id, branchId: null, status: "ACTIVE", renewalPeriod: "ANNUAL", priceOverride: 520, supportHours: 8, renewalEndDate: futureDays(305) } });
  const la9 = await prisma.licenseAssignment.create({ data: { licenseId: l7.id, companyId: c5.id, status: "ACTIVE", renewalPeriod: "MONTHLY", priceOverride: 60, supportHours: 8, renewalEndDate: futureDays(30) } });

  // ─── LICENSE PAYMENTS ────────────────────────────────
  console.log("  💰 Creando pagos de licencias...");
  await prisma.licensePayment.create({ data: { assignmentId: la1.id, paymentDate: pastDays(365), paymentMethod: "TRANSFERENCIA", amount: 8500, renewalPeriod: "ANNUAL", renewalEndDate: futureDays(30), reference: "TRANS-2025-001", notes: "Pago anual NEXUS ERP Pro - Constructora", createdBy: admin.id } });
  await prisma.licensePayment.create({ data: { assignmentId: la3.id, paymentDate: pastDays(180), paymentMethod: "PAGO_MOVIL", amount: 3500, renewalPeriod: "ANNUAL", renewalEndDate: futureDays(15), reference: "PM-2025-456", notes: "Pago anual ERP Lite - Mercal", createdBy: admin.id } });
  await prisma.licensePayment.create({ data: { assignmentId: la9.id, paymentDate: pastDays(30), paymentMethod: "TRANSFERENCIA", amount: 60, renewalPeriod: "MONTHLY", renewalEndDate: futureDays(30), reference: "TRANS-BK-001", notes: "Pago mensual Backup Cloud - TecAv", createdBy: admin.id } });

  // ─── VISITS ──────────────────────────────────────────
  console.log("  🚗 Creando visitas...");
  await prisma.visit.create({ data: { companyId: c1.id, contactId: contact1.id, type: "INSTALLATION", scheduledDate: pastDays(15), completedDate: pastDays(14), status: "COMPLETED", assignedTo: u2.id, notes: "Instalación exitosa del ERP en oficina principal" } });
  await prisma.visit.create({ data: { companyId: c2.id, contactId: contact3.id, type: "DEMO", scheduledDate: futureDays(5), status: "SCHEDULED", assignedTo: u3.id, notes: "Demostración del módulo de inventario" } });
  await prisma.visit.create({ data: { companyId: c3.id, contactId: contact4.id, type: "TECHNICAL", scheduledDate: pastDays(5), completedDate: pastDays(3), status: "COMPLETED", assignedTo: u4.id, notes: "Mantenimiento correctivo servidor principal" } });
  await prisma.visit.create({ data: { companyId: c4.id, contactId: contact5.id, type: "INDUCTION", scheduledDate: futureDays(10), status: "SCHEDULED", assignedTo: u2.id, notes: "Capacitación inicial de usuarios" } });
  await prisma.visit.create({ data: { companyId: c5.id, contactId: contact6.id, type: "POST_SALE", scheduledDate: pastDays(7), completedDate: pastDays(6), status: "COMPLETED", assignedTo: u4.id, notes: "Seguimiento post-venta, cliente satisfecho" } });

  // ─── SUPPORT CASES ───────────────────────────────────
  console.log("  🎫 Creando casos de soporte...");
  const sc1 = await prisma.supportCase.create({ data: { companyId: c1.id, contactId: contact1.id, subject: "Error en módulo contable", description: "El sistema genera error al intentar generar el balance general del mes de mayo.", priority: "HIGH", status: "RESOLVED", assignedTo: u5.id, resolvedAt: pastDays(2), slaDeadline: pastDays(1) } });
  await prisma.supportCase.create({ data: { companyId: c2.id, contactId: contact3.id, subject: "Lentitud en el sistema", description: "El sistema ERP tarda más de 30 segundos en responder a las consultas.", priority: "MEDIUM", status: "IN_PROGRESS", assignedTo: u5.id, slaDeadline: futureDays(3) } });
  await prisma.supportCase.create({ data: { companyId: c3.id, contactId: contact4.id, subject: "Solicitud de nuevo reporte", description: "Necesitamos un reporte personalizado de producción mensual.", priority: "LOW", status: "OPEN", assignedTo: u5.id, slaDeadline: futureDays(15) } });
  await prisma.supportCase.create({ data: { companyId: c5.id, contactId: contact6.id, subject: "Falla en impresión de facturas", description: "Las facturas salen con formato incorrecto, los montos no se alinean.", priority: "CRITICAL", status: "OPEN", assignedTo: u5.id, slaDeadline: futureDays(1) } });

  // ─── SUPPORT CASE COMMENTS ───────────────────────────
  console.log("  💬 Creando comentarios...");
  await prisma.supportCaseComment.create({ data: { caseId: sc1.id, userId: u5.id, comment: "Se identificó el problema: falta actualizar la tabla de impuestos. Procediendo a corregir." } });
  await prisma.supportCaseComment.create({ data: { caseId: sc1.id, userId: admin.id, comment: "Corregido. Se actualizó la tabla de impuestos IVA. Cliente confirmó que funciona correctamente." } });

  // ─── TRANSFERS ───────────────────────────────────────
  console.log("  🔄 Creando transferencias...");
  await prisma.transfer.create({ data: { userId: u4.id, fromLocation: "Oficina Central Caracas", toLocation: "Sucursal Maracaibo", transferDate: futureDays(2), reason: "Instalación de equipo de seguridad en sucursal", status: "APPROVED", approvedById: admin.id, notes: "Aprobado por gerencia" } });
  await prisma.transfer.create({ data: { userId: u2.id, fromLocation: "Oficina Central Caracas", toLocation: "Sucursal Valencia", transferDate: futureDays(7), reason: "Mantenimiento preventivo servidor", status: "PENDING" } });

  // ─── ALERTS ──────────────────────────────────────────
  console.log("  🔔 Creando alertas...");
  await prisma.alert.create({ data: { type: "LICENSE_EXPIRING", title: "Licencia ERP Lite por vencer", message: "La licencia NEXUS ERP Lite de Distribuidora Mercal vence en 15 días.", relatedEntityType: "license", relatedEntityId: l2.id, isRead: false, userId: admin.id } });
  await prisma.alert.create({ data: { type: "LICENSE_EXPIRING", title: "Backup Cloud por renovar", message: "La suscripción Backup Cloud 1TB de Tecnología Avanzada se renueva en 30 días.", relatedEntityType: "license", relatedEntityId: l7.id, isRead: false, userId: admin.id } });
  await prisma.alert.create({ data: { type: "SUPPORT_CASE", title: "Caso CRITICAL abierto", message: "Caso crítico abierto por Tecnología Avanzada: Falla en impresión de facturas.", relatedEntityType: "supportCase", relatedEntityId: 4, isRead: false, userId: admin.id } });
  await prisma.alert.create({ data: { type: "VISIT_SCHEDULED", title: "Visita programada - Mercal", message: "Demostración del módulo de inventario programada para dentro de 5 días.", relatedEntityType: "visit", relatedEntityId: 2, isRead: true, userId: u3.id } });

  // ─── TECHNICAL REPORTS ───────────────────────────────
  console.log("  📄 Creando reportes técnicos...");
  await prisma.technicalReport.create({ data: { visitId: 1, companyId: c1.id, reportType: "ERP_INSTALLATION", title: "Instalación NEXUS ERP Pro - Constructora Venezolana", content: "Se realizó la instalación del sistema ERP en la oficina principal. Se configuraron 15 estaciones de trabajo, servidor de base de datos y módulo contable.", findings: "La infraestructura de red existente es adecuada. Se detectó falta de UPS en el cuarto del servidor.", recommendations: "Instalar UPS de 3KVA para proteger el servidor. Programar capacitación para usuarios clave.", createdBy: u2.id } });
  await prisma.technicalReport.create({ data: { visitId: 3, companyId: c3.id, reportType: "TELECOM_NETWORK", title: "Mantenimiento Correctivo - Petróleos del Caribe", content: "Se realizó mantenimiento correctivo al servidor principal que presentaba fallas de rendimiento.", findings: "Disco duro con sectores defectuosos. Memoria RAM con errores intermitentes.", recommendations: "Reemplazar disco duro dañado. Actualizar firmware del servidor. Considerar expansión de RAM a 128GB.", createdBy: u4.id } });

  // ─── IMPLEMENTATION SHEETS ───────────────────────────
  console.log("  📋 Creando fichas de implementación...");
  await prisma.implementationSheet.create({ data: { companyId: c1.id, financialData: { totalCost: 8500, monthlyFee: 708.33, contractDuration: "12 meses", paymentMethod: "Transferencia bancaria" }, products: { erp: "NEXUS ERP Pro v8.2", modules: ["Contabilidad", "Inventario", "RRHH", "Ventas"], users: 50 }, contractTerms: { sla: "4 horas respuesta", support: "24/7 remoto, presencial en 48h" }, notes: "Implementación exitosa. Pendiente segunda fase de capacitación.", status: "APPROVED", createdBy: admin.id } });
  await prisma.implementationSheet.create({ data: { companyId: c5.id, financialData: { totalCost: 1500, monthlyFee: 125, contractDuration: "12 meses", paymentMethod: "Pago móvil" }, products: { firewall: "FortiGate 60F", licenses: "UTM Bundle 1 año" }, notes: "Firewall configurado con políticas de seguridad personalizadas.", status: "COMPLETED", createdBy: admin.id } });

  // ─── SUMMARY ─────────────────────────────────────────
  const counts = {
    roles: await prisma.role.count(),
    users: await prisma.user.count(),
    companies: await prisma.company.count(),
    categories: await prisma.productCategory.count(),
    products: await prisma.product.count(),
    licenses: await prisma.license.count(),
    assignments: await prisma.licenseAssignment.count(),
    payments: await prisma.licensePayment.count(),
    contacts: await prisma.contact.count(),
    visits: await prisma.visit.count(),
    supportCases: await prisma.supportCase.count(),
    transfers: await prisma.transfer.count(),
    alerts: await prisma.alert.count(),
    reports: await prisma.technicalReport.count(),
    implSheets: await prisma.implementationSheet.count(),
  };

  console.log("\n✅ Seed completado exitosamente!");
  console.log("📊 Resumen:");
  Object.entries(counts).forEach(([key, val]) => console.log(`   ${key}: ${val}`));

  await prisma.$disconnect();
}

main().catch((e) => { console.error("❌ Error en seed:", e); process.exit(1); });
