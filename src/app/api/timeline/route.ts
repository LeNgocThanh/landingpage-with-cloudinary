import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'startDate and endDate are required' },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            );
        }

        // Get all rooms with their images and bookings within the date range
        const rooms = await prisma.room.findMany({
            include: {
                images: {
                    // where: { isPrimary: true },
                    take: 1,
                },
                bookings: {
                    where: {
                        AND: [
                            { startTime: { lte: end } },
                            { endTime: { gte: start } },
                            { status: { notIn: ['cancelled'] } },
                        ],
                    },
                    orderBy: { startTime: 'asc' },
                    include: {
                        timeSlot: true,
                    },
                },
                timeSlots: {
                    where: {
                        AND: [
                            { startTime: { lte: end } },
                            { endTime: { gte: start } },
                        ],
                    },
                    orderBy: { startTime: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        });

        // Transform data for timeline display
        const timelineData = rooms.map(room => {
            // Combine bookings and available time slots
            const events = [
                ...room.bookings.map(booking => ({
                    id: booking.id,
                    type: 'booking' as const,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    status: booking.status,
                    customerName: booking.customerName,
                    customerPhone: booking.customerPhone,
                    totalPrice: booking.totalPrice,
                    notes: booking.notes,
                })),
                ...room.timeSlots
                    .filter(slot => slot.status === 'available' && !slot.roomId)
                    .map(slot => ({
                        id: slot.id,
                        type: 'available' as const,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        status: slot.status,
                    })),
            ];

            // Sort events by start time
            events.sort((a, b) => 
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );

            return {
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                pricePerHour: room.pricePerHour,
                status: room.status,
                image: room.images[0]?.url || null,
                events,
            };
        });

        return NextResponse.json({
            rooms: timelineData,
            dateRange: {
                start: start.toISOString(),
                end: end.toISOString(),
            },
        });
    } catch (error) {
        console.error('Error fetching timeline data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch timeline data' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
