import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { appendToGoogleSheet } from '@/lib/googleSheets';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, startTime, endTime } = body;

        // 1. Tìm thông tin booking và timeSlot hiện tại
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            include: { room: true }
        });

        if (!existingBooking) {
            return NextResponse.json({ error: 'Không tìm thấy đặt phòng' }, { status: 404 });
        }

        const newStart = startTime ? new Date(startTime) : new Date(existingBooking.startTime);
        const newEnd = endTime ? new Date(endTime) : new Date(existingBooking.endTime);

        // 2. Nếu có thay đổi thời gian, phải kiểm tra chồng chéo
        if (startTime || endTime) {
            if (newStart >= newEnd) {
                return NextResponse.json({ error: 'Thời gian không hợp lệ' }, { status: 400 });
            }

            const overlap = await prisma.timeSlot.findFirst({
                where: {
                    roomId: existingBooking.roomId,
                    id: { not: existingBooking.timeSlotId }, // Loại trừ chính slot hiện tại
                    status: { in: ['booked', 'blocked'] },
                    AND: [
                        { startTime: { lt: newEnd } },
                        { endTime: { gt: newStart } }
                    ]
                }
            });

            if (overlap) {
                return NextResponse.json({ error: 'Thời gian mới bị trùng với lịch khác' }, { status: 409 });
            }
        }

        // 3. Tính toán lại giá tiền nếu thời gian thay đổi
        let newTotalPrice = existingBooking.totalPrice;
        if (startTime || endTime) {
            const hours = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60));
            newTotalPrice = hours * existingBooking.room.pricePerHour;
        }

        // 4. Cập nhật dữ liệu trong Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Cập nhật TimeSlot
            await tx.timeSlot.update({
                where: { id: existingBooking.timeSlotId },
                data: {
                    startTime: newStart,
                    endTime: newEnd,
                    status: status === 'cancelled' ? 'available' : undefined // Nếu hủy thì giải phóng slot
                }
            });

            // Cập nhật Booking
            const updated = await tx.booking.update({
                where: { id },
                data: {
                    status: status || existingBooking.status,
                    startTime: newStart,
                    endTime: newEnd,
                    totalPrice: newTotalPrice
                },
                include: { room: true }
            });

            const notificationData = {
                customerName: updated.customerName,
                customerPhone: updated.customerPhone,
                customerZalo: updated.customerZalo ?? undefined,
                roomName: updated.room.name,
                startTime: newStart.toLocaleString('vi-VN'),
                endTime: newEnd.toLocaleString('vi-VN'),
                status: updated.status,                
            };

            appendToGoogleSheet(notificationData).catch(err => console.error('Sheet error:', err));

            return updated;
        });       

        return NextResponse.json(result);
    } catch (error) {
        console.error('Update booking error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}