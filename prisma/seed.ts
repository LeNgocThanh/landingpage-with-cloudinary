import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            email: 'admin@homestay.com',
        },
    });

    console.log('✅ Admin created:', admin.username);

    // Create amenities
    const amenities = await Promise.all([
        prisma.amenity.upsert({
            where: { name: 'WiFi' },
            update: {},
            create: { name: 'WiFi', icon: 'wifi' },
        }),
        prisma.amenity.upsert({
            where: { name: 'Điều hòa' },
            update: {},
            create: { name: 'Điều hòa', icon: 'wind' },
        }),
        prisma.amenity.upsert({
            where: { name: 'Smart TV' },
            update: {},
            create: { name: 'Smart TV', icon: 'tv' },
        }),
        prisma.amenity.upsert({
            where: { name: 'Minibar' },
            update: {},
            create: { name: 'Minibar', icon: 'coffee' },
        }),
    ]);

    console.log('✅ Amenities created:', amenities.length);

    // Create sample rooms
    const room1 = await prisma.room.create({
        data: {
            name: 'Phòng Standard',
            description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản, phù hợp cho 2 người',
            pricePerHour: 100000,
            capacity: 2,
            status: 'available',
        },
    });

    const room2 = await prisma.room.create({
        data: {
            name: 'Phòng Deluxe',
            description: 'Phòng cao cấp với view đẹp, không gian rộng rãi, phù hợp cho 3-4 người',
            pricePerHour: 150000,
            capacity: 4,
            status: 'available',
        },
    });

    const room3 = await prisma.room.create({
        data: {
            name: 'Phòng VIP',
            description: 'Phòng VIP sang trọng với đầy đủ tiện nghi cao cấp, jacuzzi riêng',
            pricePerHour: 250000,
            capacity: 2,
            status: 'available',
        },
    });

    console.log('✅ Rooms created: 3');

    // Add amenities to rooms
    for (const room of [room1, room2, room3]) {
        for (const amenity of amenities) {
            await prisma.roomAmenity.create({
                data: {
                    roomId: room.id,
                    amenityId: amenity.id,
                },
            });
        }
    }

    console.log('✅ Room amenities linked');

    console.log('🎉 Seeding completed!');
    console.log('\n📝 Admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
