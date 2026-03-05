import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { username, password, email } = await request.json();

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findFirst();

        if (existingAdmin) {
            return NextResponse.json(
                { error: 'Admin đã tồn tại' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
                email,
            },
        });

        return NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error('Setup error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra' },
            { status: 500 }
        );
    }
}
