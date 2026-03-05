import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cập nhật thông tin một tiện ích (PATCH)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, icon } = body;

        const updatedAmenity = await prisma.amenity.update({
            where: { id },
            data: {
                name,
                icon,
            },
        });

        return NextResponse.json(updatedAmenity);
    } catch (error) {
        console.error('Update amenity error:', error);
        return NextResponse.json(
            { error: 'Không thể cập nhật tiện ích hoặc tên bị trùng' },
            { status: 500 }
        );
    }
}

// Xóa một tiện ích (DELETE)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Lưu ý: Nhờ thiết lập Cascade trong schema, khi xóa Amenity, 
        // các bản ghi liên quan trong bảng RoomAmenity cũng sẽ bị xóa sạch.
        await prisma.amenity.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Đã xóa tiện ích' });
    } catch (error) {
        console.error('Delete amenity error:', error);
        return NextResponse.json(
            { error: 'Không thể xóa tiện ích này' },
            { status: 500 }
        );
    }
}