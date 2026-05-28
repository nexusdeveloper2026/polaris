import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Administrador del sistema con acceso completo",
      permissions: { all: true },
    },
  });

  await prisma.role.upsert({
    where: { name: "TECHNICIAN" },
    update: {},
    create: {
      name: "TECHNICIAN",
      description: "Técnico de soporte y campo",
      permissions: {
        companies: { read: true },
        visits: { read: true, create: true, update: true },
        support_cases: { read: true, create: true, update: true },
      },
    },
  });

  await prisma.role.upsert({
    where: { name: "SALES" },
    update: {},
    create: {
      name: "SALES",
      description: "Ventas y atención al cliente",
      permissions: {
        companies: { read: true, create: true, update: true },
        products: { read: true },
        visits: { read: true, create: true },
      },
    },
  });

  const adminPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@nexuserp.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@nexuserp.com",
      password: adminPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const categories = [
    { name: "Sistemas ERP", description: "Sistemas de planificación de recursos empresariales" },
    { name: "Redes", description: "Redes de telecomunicaciones" },
    { name: "Seguridad", description: "Cámaras y sistemas de seguridad" },
    { name: "Soporte", description: "Servicios de soporte técnico" },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log("Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
