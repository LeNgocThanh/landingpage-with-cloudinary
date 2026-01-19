export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const imageId = parseId(id);
  if (!imageId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const item = await prisma.imageItem.findUnique({ where: { id: imageId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(item);
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const imageId = parseId(id);
  if (!imageId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { title, position, url } = body as {
    title?: string | null;
    position?: number;
    url?: string;
  };

  const data: any = {};
  if (typeof title === "string") data.title = title.trim();
  if (title === null) data.title = null;

  if (typeof url === "string" && url.trim()) data.url = url.trim();

  if (typeof position === "number" && Number.isFinite(position)) {
    data.position = Math.max(0, Math.floor(position));
  }

  const updated = await prisma.imageItem.update({
    where: { id: imageId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const imageId = parseId(id);
  if (!imageId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // (tuỳ bạn) lấy item để xóa file vật lý nếu bạn lưu trong /public/uploads
  const existing = await prisma.imageItem.findUnique({ where: { id: imageId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.imageItem.delete({ where: { id: imageId } });

  // Nếu bạn có lưu file local, bạn có thể xóa file ở đây (mình bổ sung sau nếu cần)

  return NextResponse.json({ ok: true });
}
