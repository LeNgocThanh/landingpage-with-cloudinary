import { NextResponse } from "next/server";
import crypto from "crypto";
import {prisma} from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function getPublicId(url: string) {
  // https://res.cloudinary.com/xxx/image/upload/v123/uploads/abc.jpg
  const parts = url.split("/");
  const file = parts[parts.length - 1];     // abc.jpg
  const folder = parts[parts.length - 2];   // uploads
  return `${folder}/${file.split(".")[0]}`; // uploads/abc
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const imageId = parseId(id);
  if (!imageId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const form = await req.formData();

  const titleRaw = form.get("title");
  const positionRaw = form.get("position");
  const file = form.get("file");

  const image = await prisma.imageItem.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: any = {};

  // title
  if (typeof titleRaw === "string") {
    const t = titleRaw.trim();
    data.title = t.length ? t : null;
  }

  // position
  if (positionRaw !== null) {
    const p = parseInt(String(positionRaw));
    if (!isNaN(p)) data.position = Math.max(0, p);
  }

  // nếu có file mới → upload cloudinary
  if (file instanceof File) {
    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "uploads",
          public_id: crypto.randomBytes(12).toString("hex"),
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    const newUrl = upload.secure_url;
    data.url = newUrl;

    // xoá ảnh cũ nếu là cloudinary
    if (image.url.includes("cloudinary.com")) {
      const publicId = getPublicId(image.url);
      await cloudinary.uploader.destroy(publicId);
    }
  }

  const updated = await prisma.imageItem.update({
    where: { id: imageId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, ctx: Ctx) {
    const { id } = await ctx.params;
    const imageId = parseId(id);
    if (!imageId) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
  
    const image = await prisma.imageItem.findUnique({
      where: { id: imageId },
    });
  
    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  
    // Xóa Cloudinary nếu là cloudinary url
    if (image.url.includes("cloudinary.com")) {
      try {
        const publicId = getPublicId(image.url);
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete failed:", err);
        // vẫn cho xóa DB để tránh bị kẹt
      }
    }
  
    await prisma.imageItem.delete({
      where: { id: imageId },
    });
  
    return NextResponse.json({ success: true });
  }
