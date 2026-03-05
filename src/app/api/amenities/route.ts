import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Lấy danh sách tất cả các tiện ích
export async function GET() {
    try {
        const amenities = await prisma.amenity.findMany({
            orderBy: {
                name: 'asc' // Sắp xếp theo tên để dễ tìm kiếm trên giao diện
            }
        });
        return NextResponse.json(amenities);
    } catch (error) {
        console.error('Fetch amenities error:', error);
        return NextResponse.json(
            { error: 'Không thể lấy danh sách tiện ích' },
            { status: 500 }
        );
    }
}

// Tạo mới một tiện ích (Dùng cho trang quản lý tiện ích riêng nếu có)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, icon } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Tên tiện ích là bắt buộc' },
                { status: 400 }
            );
        }

        const amenity = await prisma.amenity.create({
            data: {
                name,
                icon,
            },
        });

        return NextResponse.json(amenity);
    } catch (error) {
        console.error('Create amenity error:', error);
        return NextResponse.json(
            { error: 'Tiện ích đã tồn tại hoặc có lỗi xảy ra' },
            { status: 500 }
        );
    }
}