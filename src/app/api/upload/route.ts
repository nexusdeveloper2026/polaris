import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "technical-reports");

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se enviaron archivos" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const uploaded: { name: string; url: string; size: number; type: string }[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `${timestamp}-${safeName}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      await writeFile(filePath, buffer);

      uploaded.push({
        name: file.name,
        url: `/uploads/technical-reports/${fileName}`,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({ files: uploaded }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error al subir archivos: ${message}` }, { status: 500 });
  }
}
