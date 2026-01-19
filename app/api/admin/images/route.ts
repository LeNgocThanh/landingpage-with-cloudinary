export const runtime = "nodejs"; // cần fs

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";


function safeInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET() {
  const items = await prisma.imageItem.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const form = await req.formData();

  const file = form.get("file");
  const titleRaw = form.get("title");
  const positionRaw = form.get("position");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
  }

  const title = typeof titleRaw === "string" ? titleRaw.trim() : null;
  const position = safeInt(positionRaw, 0);

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
  const name = crypto.randomBytes(12).toString("hex") + ext;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, name), bytes);

  const url = `/uploads/${name}`;

  // tạo anchor duy nhất
  const anchor = `img-${crypto.randomBytes(6).toString("hex")}`;

  const created = await prisma.imageItem.create({
    data: {
      url,
      title: title && title.length ? title : null,
      position,
      anchor,
    },
  });

  return NextResponse.json(created);
}
