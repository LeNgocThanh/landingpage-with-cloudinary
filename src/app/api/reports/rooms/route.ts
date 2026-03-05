import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma'; // Đường dẫn tùy project của bạn

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');

    const now = new Date();
    const startDate = start ? new Date(start) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = end ? new Date(end) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const rooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            startTime: { gte: startDate, lte: endDate },
          },
        },
      },
    });

    const reportData = rooms.map((room) => {
      const bookings = room.bookings;

      // 1. Tổng hợp doanh thu và số lượt theo trạng thái
      const stats = bookings.reduce((acc, b) => {
        const status = b.status;
        if (status === 'completed' || status === 'confirmed' || status === 'pending' || status === 'cancelled') {
          acc[status] = (acc[status] || 0) + 1;
        }
        if (b.status === 'completed') acc.totalRevenue += b.totalPrice;
        if (b.status === 'confirmed' || b.status === 'pending') acc.expectedRevenue += b.totalPrice;
        return acc;
      }, { completed: 0, confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0, expectedRevenue: 0 });

      // 2. Tính toán giờ cao điểm (Block 1h)
      const hourMap: Record<number, number> = {};
      const dayMap: Record<number, number> = {};

      bookings.forEach(b => {
        if (b.status !== 'cancelled') {
          const hour = new Date(b.startTime).getHours();
          const day = new Date(b.startTime).getDay(); // 0: CN, 1: Thứ 2...
          hourMap[hour] = (hourMap[hour] || 0) + 1;
          dayMap[day] = (dayMap[day] || 0) + 1;
        }
      });

      const getMaxKeys = (map: Record<number, number>) => {
        const maxVal = Math.max(...Object.values(map), 0);
        if (maxVal === 0) return [];
        return Object.keys(map).filter(k => map[Number(k)] === maxVal).map(Number);
      };

      return {
        roomId: room.id,
        roomName: room.name,
        summary: stats,
        peakHours: getMaxKeys(hourMap).map(h => `${h}h - ${h+1}h`),
        peakDays: getMaxKeys(dayMap).map(d => ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][d])
      };
    });

    return NextResponse.json(reportData);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}