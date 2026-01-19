import { NextResponse } from "next/server";
import crypto from "crypto";
import {prisma} from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

function safeInt(v: any, d = 0) {
  const n = parseInt(String(v));
  return isNaN(n) ? d : n;
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

  // Convert File → Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload lên Cloudinary
  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "uploads", // thư mục trên cloudinary
        resource_type: "image", // hoặc "auto" nếu có pdf, video
        public_id: crypto.randomBytes(12).toString("hex"),
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  const url = upload.secure_url; // URL CDN

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
