
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

/**
 * Contact model (for reference)
 * model Contact {
 *   id        String   @id @default(cuid())
 *   name      String
 *   email     String
 *   phone     String?
 *   company   String?
 *   subject   String?
 *   message   String
 *   status    String   @default("pending") // pending, read, replied
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 *   @@map("contacts")
 * }
 */

// -------------------- Utilities --------------------

const isNonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

function ok(data: any, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init)
}
function fail(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ success: false, message, ...(extra ?? {}) }, { status })
}

// Pagination & sorting helpers
function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

function parseOrder(searchParams: URLSearchParams) {
  const sort = (searchParams.get('sort') || 'createdAt').toString()
  const order = (searchParams.get('order') || 'desc').toString().toLowerCase() === 'asc' ? 'asc' : 'desc'
  const orderBy: any = {}
  orderBy[sort] = order
  return orderBy
}

// Block immutable fields
function sanitizeUpdatePayload<T extends Record<string, any>>(payload: T): Partial<T> {
  if (!payload || typeof payload !== 'object') return {}
  const clone: any = { ...payload }
  delete clone.id
  delete clone.createdAt
  delete clone.updatedAt
  return clone
}

// Extract unique where (id only for Contact)
async function extractContactWhere(req: NextRequest): Promise<Prisma.ContactWhereUniqueInput> {
  const { searchParams } = new URL(req.url)
  const qid = searchParams.get('id')
  if (isNonEmpty(qid)) return { id: qid.trim() }

  const body = await req.clone().json().catch(() => null)
  const id = isNonEmpty(body?.id) ? body.id.trim() : ''
  if (id) return { id }
  throw new Error('MISSING_ID')
}

// -------------------- Validation Schemas --------------------

const StatusEnum = z.enum(['pending', 'read', 'replied'])

const CreateSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email'),
  message: z.string().min(1, 'message is required'),
  // optionals
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  status: StatusEnum.optional().default('pending'),
})

const PutSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  status: StatusEnum.optional().default('pending'),
})

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  message: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  status: StatusEnum.optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'PATCH requires at least one field' })

// -------------------- Routes --------------------

/**
 * GET /api/contacts
 * Query:
 *  - q: search in name/email/phone/company/subject/message
 *  - status: 'pending' | 'read' | 'replied' | 'all'
 *  - page, limit
 *  - sort, order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || undefined
    const status = (searchParams.get('status') || 'all').toLowerCase()
    const { limit, skip, page } = parsePagination(searchParams)
    const orderBy = parseOrder(searchParams)

    const where: any = {}
    if (status !== 'all') where.status = status
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.contact.findMany({ where, skip, take: limit, orderBy }),
      prisma.contact.count({ where }),
    ])

    return ok({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    console.error('GET /api/contacts error:', error)
    return fail('Failed to fetch contacts', 500)
  }
}

/**
 * POST /api/contacts
 * Body: CreateSchema
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const data = CreateSchema.parse(raw)

    const contact = await prisma.contact.create({ data })
    return ok(contact)
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    console.error('POST /api/contacts error:', error)
    return fail('Failed to create contact', 500)
  }
}

/**
 * PUT /api/contacts?id=STRING (or body.id)
 * Body: PutSchema
 */
export async function PUT(request: NextRequest) {
  try {
    const where = await extractContactWhere(request)
    const raw = await request.json()
    const data = PutSchema.parse(sanitizeUpdatePayload(raw))

    const updated = await prisma.contact.update({ where, data })
    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_ID') {
      return fail('Missing id (?id=... or body.id)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Contact not found', 404)
    }
    console.error('PUT /api/contacts error:', error)
    return fail('Failed to update contact', 500)
  }
}

/**
 * PATCH /api/contacts?id=STRING (or body.id)
 * Body: PatchSchema
 */
export async function PATCH(request: NextRequest) {
  try {
    const where = await extractContactWhere(request)
    const raw = await request.json()
    const data = PatchSchema.parse(sanitizeUpdatePayload(raw))

    const updated = await prisma.contact.update({ where, data })
    return ok(updated)
  } catch (error: any) {
    if (error?.message === 'MISSING_ID') {
      return fail('Missing id (?id=... or body.id)', 400)
    }
    if (error?.name === 'ZodError') {
      return fail('Invalid payload', 422, { errors: error.errors })
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Contact not found', 404)
    }
    console.error('PATCH /api/contacts error:', error)
    return fail('Failed to update contact', 500)
  }
}

/**
 * DELETE /api/contacts
 * - Single: ?id=STRING (or body.id)
 * - Bulk: body.ids: string[]
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.clone().json().catch(() => null)

    // Bulk by ids[]
    if (Array.isArray(body?.ids) && body.ids.length > 0) {
      const ids = (body.ids as any[])
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => !!v)

      if (ids.length === 0) return fail('Invalid ids list', 400)

      const result = await prisma.contact.deleteMany({ where: { id: { in: ids } } })
      return ok({ count: result.count })
    }

    // Single by id
    const where = await extractContactWhere(request)
    const deleted = await prisma.contact.delete({ where })
    return ok(deleted)
  } catch (error: any) {
    if (error?.message === 'MISSING_ID') {
      return fail('Missing id (?id=... or body.id)', 400)
    }
    if (error?.code === 'P2025' || (error instanceof Error && 'code' in error && (error as any).code === 'P2025')) {
      return fail('Contact not found', 404)
    }
    console.error('DELETE /api/contacts error:', error)
    return fail('Failed to delete contact', 500)
  }
}
