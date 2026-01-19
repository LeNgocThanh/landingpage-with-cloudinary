// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Nếu không muốn cài mime-types, dùng bảng MIME tối thiểu:
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
}
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const rel = searchParams.get('path') || ''

    if (!rel || !rel.startsWith('/uploads/')) {
      return NextResponse.json({ success: false, message: 'Invalid path. Must start with /uploads/' }, { status: 400 })
    }

    const baseDir = path.join(process.cwd(), 'public')
    const resolved = path.resolve(baseDir, rel.replace(/^\/+/, ''))

    if (!resolved.startsWith(baseDir)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    const buf = await fs.readFile(resolved) // Buffer
    const ext = path.extname(resolved).toLowerCase()
    const contentType = MIME[ext] ?? 'application/octet-stream'

    // ✅ Sửa lỗi: chuyển Buffer -> ArrayBuffer hoặc Uint8Array trước khi tạo Blob   
    const blob = new Blob([new Uint8Array(buf)], { type: String(contentType) })

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e: any) {
    if (e?.code === 'ENOENT') {
      return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 })
    }
    console.error('GET /api/files error:', e)
    return NextResponse.json({ success: false, message: 'Failed to read file' }, { status: 500 })
  }
}
