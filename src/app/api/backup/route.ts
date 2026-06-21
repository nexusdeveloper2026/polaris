import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { execSync } from "child_process";
import { PG_DUMP, getDbUrl, parseDbUrl } from "@/lib/pg-tools";
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/audit";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUrl = getDbUrl();
    const db = parseDbUrl(dbUrl);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `nexus-polaris-${timestamp}.backup`;
    const tmpPath = join(tmpdir(), filename);

    const env = { ...process.env, PGPASSWORD: db.password };

    execSync(
      `"${PG_DUMP}" -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -F c -b -v -f "${tmpPath}"`,
      { env, timeout: 60000, stdio: "pipe" }
    );

    const fileBuffer = await readFile(tmpPath);

    await unlink(tmpPath).catch(() => {});

    const userId = Number(session.user.id);
    logAudit({ userId, action: AUDIT_ACTIONS.BACKUP, entity: AUDIT_ENTITIES.BACKUP });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Error desconocido";
    const stderr = (err as { stderr?: Buffer })?.stderr?.toString() || "";
    console.error("[BACKUP] ERROR:", detail, stderr);
    return NextResponse.json(
      { error: `Error al generar backup: ${detail}${stderr ? ` - ${stderr}` : ""}` },
      { status: 500 }
    );
  }
}
