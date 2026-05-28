import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
const url = new URL('postgresql://postgres:N3xusT3echt2026%2A@localhost:5432/polaris');
const pool = new Pool({
  host: url.hostname,
  port: Number(url.port),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace('/', '')
});
console.log('password:', decodeURIComponent(url.password));
const adapter = new PrismaPg({ pool });
const prisma = new PrismaClient({ adapter });
try {
  const roles = await prisma.role.findMany();
  console.log('roles count:', roles.length);
} catch(e) {
  console.log('ERROR:', e.message);
}
await prisma.$disconnect();
