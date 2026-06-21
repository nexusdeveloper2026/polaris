import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { execSync } from "child_process";
import { PG_RESTORE, PSQL, getDbUrl, parseDbUrl } from "@/lib/pg-tools";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const dbUrl = getDbUrl();
    const db = parseDbUrl(dbUrl);
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "backup";
    const tmpPath = join(tmpdir(), `restore-${timestamp}.${ext}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tmpPath, buffer);

    const env = { ...process.env, PGPASSWORD: db.password };

    try {
      execSync(
        `"${PSQL}" -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`,
        { env, timeout: 30000, stdio: "pipe" }
      );

      if (ext === "backup" || ext === "dump") {
        execSync(
          `"${PG_RESTORE}" -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} --no-owner --no-privileges "${tmpPath}"`,
          { env, timeout: 120000, stdio: "pipe" }
        );
      } else {
        execSync(
          `"${PSQL}" -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -f "${tmpPath}"`,
          { env, timeout: 120000, stdio: "pipe" }
        );
      }
    } finally {
      await unlink(tmpPath).catch(() => {});
    }

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.RESTORE, entity: AUDIT_ENTITIES.BACKUP });

    console.log("[RESTORE] Database restored from:", file.name);
    return NextResponse.json({ message: "Base de datos restaurada correctamente", file: file.name });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const stderr = (err as { stderr?: Buffer })?.stderr?.toString() || "";
    console.error("[RESTORE] ERROR:", detail, stderr);
    return NextResponse.json(
      { error: `Error al restaurar: ${detail}${stderr ? ` - ${stderr}` : ""}` },
      { status: 500 }
    );
  }
}
