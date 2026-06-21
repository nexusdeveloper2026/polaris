export const PG_DUMP = "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe";
export const PG_RESTORE = "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_restore.exe";
export const PSQL = "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe";

export function getDbUrl(): string {
  return process.env.DATABASE_URL || "";
}

export function parseDbUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "localhost",
    port: parsed.port || "5432",
    database: parsed.pathname.replace("/", ""),
    user: parsed.username || "postgres",
    password: decodeURIComponent(parsed.password || ""),
  };
}
