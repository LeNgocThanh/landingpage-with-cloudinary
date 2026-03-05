import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingEmail } from '@/lib/email';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToGoogleSheet } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { roomId, customerName, customerPhone, customerZalo, startTime, endTime, status, isAdmin } = body;

        // 1. Validate input
        if (!roomId || !customerName || !customerPhone || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Vui lòng điền đầy đủ thông tin' },
                { status: 400 }
            );
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        // Kiểm tra thời gian hợp lệ
        if (start >= end) {
            return NextResponse.json(
                { error: 'Thời gian bắt đầu phải trước thời gian kết thúc' },
                { status: 400 }
            );
        }

        // 2. Kiểm tra chồng chéo thời gian (Overlapping check)
        // Tìm bất kỳ timeSlot nào của phòng này đã "booked" hoặc "blocked" 
        // mà có thời gian giao thoa với khoảng đang chọn
        const existingOverlap = await prisma.timeSlot.findFirst({
            where: {
                roomId: roomId,
                status: { in: ['booked', 'blocked'] },
                AND: [
                    { startTime: { lt: end } }, // Bắt đầu trước khi khách mới kết thúc
                    { endTime: { gt: start } }  // Kết thúc sau khi khách mới bắt đầu
                ]
            }
        });

        if (existingOverlap) {
            return NextResponse.json(
                { error: 'Phòng đã có lịch đặt trong khoảng thời gian này. Vui lòng chọn giờ khác.' },
                { status: 409 } // Conflict
            );
        }

        // 3. Lấy thông tin phòng để tính giá
        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            return NextResponse.json(
                { error: 'Phòng không tồn tại' },
                { status: 404 }
            );
        }

        const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        const totalPrice = hours * room.pricePerHour;

        // 4. Thực hiện Transaction để đảm bảo tính toàn vẹn dữ liệu
        // (Tạo timeSlot và Booking cùng lúc)
        const result = await prisma.$transaction(async (tx) => {
            const timeSlot = await tx.timeSlot.create({
                data: {
                    roomId,
                    startTime: start,
                    endTime: end,
                    status: 'booked',
                },
            });

            const booking = await tx.booking.create({
                data: {
                    roomId,
                    customerName,
                    customerPhone,
                    customerZalo,
                    startTime: start,
                    endTime: end,
                    status: status,
                    totalPrice,
                    timeSlotId: timeSlot.id,
                },
            });

            return { booking, timeSlot };
        });

        // 5. Thông báo
        const notificationData = {
            customerName,
            customerPhone,
            customerZalo,
            roomName: room.name,
            startTime: start.toLocaleString('vi-VN'),
            endTime: end.toLocaleString('vi-VN'),
            status,          
        };
        if(!isAdmin)  {
        Promise.all([
            sendBookingEmail(notificationData),
            sendTelegramNotification(notificationData),
            appendToGoogleSheet(notificationData),
        ]).catch(err => console.error('Notification error:', err));
    }
    appendToGoogleSheet(notificationData)

        return NextResponse.json({
            success: true,
            message: 'Cảm ơn bạn đã đặt phòng!',
            booking: {
                id: result.booking.id,
                roomName: room.name,
                totalPrice,
            },
        });

    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra, vui lòng thử lại' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        const startTime = searchParams.get('startTime'); // ISO string hoặc Date string
        const endTime = searchParams.get('endTime');

        // Khởi tạo đối tượng điều kiện
        const where: any = {};

        // Lọc theo roomId nếu có
        if (roomId) {
            where.roomId = roomId;
        }

        // Lọc theo khoảng thời gian
        // Tìm các booking có startTime nằm trong khoảng người dùng gửi lên
        if (startTime || endTime) {
            where.startTime = {};
            if (startTime) {
                where.startTime.gte = new Date(startTime); // Lớn hơn hoặc bằng
            }
            if (endTime) {
                where.startTime.lte = new Date(endTime);   // Nhỏ hơn hoặc bằng
            }
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                room: true,
                timeSlot: true, 
            },
            orderBy: {
                startTime: 'asc', 
            },
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi lấy danh sách đặt phòng' },
            { status: 500 }
        );
    }
}
