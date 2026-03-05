import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;
        const body = await request.json();
        const { name, description, pricePerHour, capacity, status, amenityIds } = body;

        const room = await prisma.room.update({
            where: { id: roomId },
            data: {
                name,
                description,
                pricePerHour: parseFloat(pricePerHour),
                capacity: parseInt(capacity),
                status,
                // Cập nhật danh sách tiện ích
                amenities: {
                    // Bước 1: Xóa các liên kết cũ
                    deleteMany: {}, 
                    // Bước 2: Tạo các liên kết mới từ danh sách amenityIds truyền lên
                    create: amenityIds?.map((id: string) => ({
                        amenity: {
                            connect: { id: id }
                        }
                    }))
                }
            },
            include: {
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        });

        return NextResponse.json(room);
    } catch (error) {
        console.error('Update room error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi cập nhật' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;

        // Nhờ cấu hiệu `onDelete: Cascade` trong schema[cite: 3, 4], 
        // khi xóa Room, các bản ghi liên quan trong RoomAmenity sẽ tự động bị xóa theo.
        await prisma.room.delete({
            where: { id: roomId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete room error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi xóa' },
            { status: 500 }
        );
    }
}