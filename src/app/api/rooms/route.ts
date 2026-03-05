import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                images: {
                    orderBy: {
                        isPrimary: 'desc',
                    },
                },
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
                timeSlots: {
                    where: {
                        startTime: {
                            gte: new Date(),
                        },
                    },
                    orderBy: {
                        startTime: 'asc',
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Get rooms error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Thêm amenityIds vào body nhận được từ client
        const { name, description, pricePerHour, capacity, status, amenityIds } = body;

        const room = await prisma.room.create({
            data: {
                name,
                description,
                pricePerHour: parseFloat(pricePerHour),
                capacity: parseInt(capacity),
                status: status || 'available',
                // logic tạo liên kết với các Amenity đã có sẵn
                amenities: {
                    create: amenityIds?.map((id: string) => ({
                        amenity: {
                            connect: { id: id }
                        }
                    }))
                }
            },
            // Include thêm thông tin amenities để trả về cho client kiểm tra
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
        console.error('Create room error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi tạo phòng' },
            { status: 500 }
        );
    }
}
