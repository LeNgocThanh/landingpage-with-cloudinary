'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare,
  Search,
  Eye,
  Trash2,
  Mail,
  Phone,
  User,
  Building,
  CheckCircle2,
  CircleDot,
  ArrowLeft,
} from 'lucide-react'

type Status = 'pending' | 'read' | 'replied'
type StatusFilter = Status | 'all'

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  subject: string | null
  message: string
  status: Status
  createdAt: string
  updatedAt?: string
}

type ApiListResponse = {
  success: boolean
  data?: {
    items: Contact[]
    pagination?: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  message?: string
}

const statusColors: Record<Status, string> = {
  pending: 'bg-orange-100 text-orange-800 border-orange-200',
  read: 'bg-blue-100 text-blue-800 border-blue-200',
  replied: 'bg-green-100 text-green-800 border-green-200',
}

const statusLabels: Record<Status, string> = {
  pending: 'Chưa đọc',
  read: 'Đã đọc',
  replied: 'Đã trả lời',
}

function fmtDT(s?: string) {
  if (!s) return ''
  try {
    return new Date(s).toLocaleString('vi-VN')
  } catch {
    return s
  }
}

export default function ContactsPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const [items, setItems] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string>('')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [total, setTotal] = useState(0)
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  const [active, setActive] = useState<Contact | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Debounce q (đỡ gọi API liên tục)
  const [qDebounced, setQDebounced] = useState(q)
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 350)
    return () => clearTimeout(t)
  }, [q])

  async function fetchList(opts?: { resetPage?: boolean }) {
    const nextPage = opts?.resetPage ? 1 : page
    setLoading(true)
    setErr('')

    try {
      const sp = new URLSearchParams()
      if (qDebounced.trim()) sp.set('q', qDebounced.trim())
      sp.set('status', status)
      sp.set('page', String(nextPage))
      sp.set('limit', String(limit))
      sp.set('sort', 'createdAt')
      sp.set('order', 'desc')

      const res = await fetch(`/api/contacts?${sp.toString()}`, { cache: 'no-store' })
      const data: ApiListResponse = await res.json().catch(() => ({ success: false }))

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Không tải được danh sách')
      }

      const nextItems = Array.isArray(data.data?.items) ? data.data!.items : []
      setItems(nextItems)

      const p = data.data?.pagination
      setTotal(typeof p?.total === 'number' ? p.total : nextItems.length)

      if (opts?.resetPage) setPage(1)
    } catch (e: any) {
      setItems([])
      setTotal(0)
      setErr(e?.message || 'Có lỗi')
    } finally {
      setLoading(false)
    }
  }

  // Khi đổi filter/search/limit => reset page về 1
  useEffect(() => {
    fetchList({ resetPage: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, qDebounced, limit])

  // Khi đổi page (không reset)
  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function patchItemLocal(id: string, patch: Partial<Contact>) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    setActive((prev) => (prev?.id === id ? { ...prev, ...patch } as Contact : prev))
  }

  async function updateStatus(id: string, next: Status) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/contacts?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Cập nhật trạng thái thất bại')
      patchItemLocal(id, { status: next })
    } finally {
      setBusyId(null)
    }
  }

  async function onView(c: Contact) {
    setActive(c)
    // pending -> read ngay khi mở xem
    if (c.status === 'pending') {
      try {
        await updateStatus(c.id, 'read')
      } catch {
        // không chặn việc xem
      }
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Xóa tin nhắn này?')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/contacts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Xóa thất bại')

      // Nếu xóa trên trang cuối và hết item, lùi trang
      const left = items.length - 1
      const shouldGoPrev = left <= 0 && page > 1
      if (active?.id === id) setActive(null)

      if (shouldGoPrev) setPage((p) => Math.max(1, p - 1))
      else fetchList()
    } catch (e: any) {
      alert(e?.message || 'Có lỗi')
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = useMemo(() => items.filter((x) => x.status === 'pending').length, [items])
  const readCount = useMemo(() => items.filter((x) => x.status === 'read').length, [items])
  const repliedCount = useMemo(() => items.filter((x) => x.status === 'replied').length, [items])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tin nhắn liên hệ</h1>
              <p className="text-gray-600 mt-1">Quản lý tin nhắn từ khách hàng</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng tin nhắn</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chưa đọc (trang hiện tại)</p>
                <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
              </div>
              <CircleDot className="w-8 h-8 text-orange-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã đọc (trang hiện tại)</p>
                <p className="text-2xl font-bold text-blue-700">{readCount}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã trả lời (trang hiện tại)</p>
                <p className="text-2xl font-bold text-green-700">{repliedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-7 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo tên, email, SĐT, công ty, chủ đề, nội dung..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              <div className="lg:col-span-3">
                <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chưa đọc</SelectItem>
                    <SelectItem value="read">Đã đọc</SelectItem>
                    <SelectItem value="replied">Đã trả lời</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Số dòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / trang</SelectItem>
                    <SelectItem value="20">20 / trang</SelectItem>
                    <SelectItem value="50">50 / trang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(qDebounced.trim() || status !== 'all') && (
              <p className="text-sm text-gray-500">
                Đang lọc: <strong>{status === 'all' ? 'Tất cả' : statusLabels[status]}</strong>
                {qDebounced.trim() ? (
                  <>
                    {' '}
                    • Từ khóa: <strong>“{qDebounced.trim()}”</strong>
                  </>
                ) : null}
              </p>
            )}
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
          ) : err ? (
            <Card>
              <CardContent className="p-10 text-center text-red-600">{err}</CardContent>
            </Card>
          ) : items.length > 0 ? (
            items.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <Badge className={`border ${statusColors[c.status]}`}>
                          {statusLabels[c.status]}
                        </Badge>

                        <span className="text-sm text-gray-500">
                          {fmtDT(c.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                        {c.subject?.trim() ? c.subject : '(Không có chủ đề)'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center min-w-0">
                          <User className="w-4 h-4 mr-2 shrink-0" />
                          <span className="truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <Mail className="w-4 h-4 mr-2 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <Phone className="w-4 h-4 mr-2 shrink-0" />
                          <span className="truncate">{c.phone || '-'}</span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <Building className="w-4 h-4 mr-2 shrink-0" />
                          <span className="truncate">{c.company || '-'}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-green-500 line-clamp-2">
                        {c.message}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onView(c)}
                        disabled={busyId === c.id}
                        title="Xem (pending sẽ chuyển sang read)"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(c.id)}
                        disabled={busyId === c.id}
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Không có tin nhắn phù hợp.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Trang <strong>{page}</strong> / <strong>{pages}</strong>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Chi tiết tin nhắn
              {active ? (
                <Badge className={`border ${statusColors[active.status]}`}>
                  {statusLabels[active.status]}
                </Badge>
              ) : null}
            </DialogTitle>
            <DialogDescription>
              {active ? fmtDT(active.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>

          {active && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500 mb-1">Họ và tên</div>
                  <div className="font-medium">{active.name}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="font-medium break-all">{active.email}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500 mb-1">Số điện thoại</div>
                  <div className="font-medium">{active.phone || '-'}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500 mb-1">Công ty</div>
                  <div className="font-medium">{active.company || '-'}</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500 mb-1">Chủ đề</div>
                <div className="font-semibold">
                  {active.subject?.trim() ? active.subject : '(Không có chủ đề)'}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500 mb-2">Nội dung</div>
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {active.message}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div className="text-xs text-gray-500">
                  Tip: Khi bấm “View”, nếu đang “Chưa đọc” thì hệ thống tự chuyển sang “Đã đọc”.
                </div>

                <div className="flex items-center gap-2">
                  {active.status !== 'replied' ? (
                    <Button
                      onClick={() => updateStatus(active.id, 'replied')}
                      disabled={busyId === active.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Đánh dấu đã trả lời
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => updateStatus(active.id, 'read')}
                      disabled={busyId === active.id}
                    >
                      Chuyển về “Đã đọc”
                    </Button>
                  )}

                  <Button variant="outline" onClick={() => setActive(null)}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
