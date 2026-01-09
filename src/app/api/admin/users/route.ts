import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

// GET: Fetch all users
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                location: true,
                licenseNumber: true,
                licenseVerified: true,
                verificationStatus: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ users });
    } catch (err: any) {
        console.error('Error fetching users:', err);
        return NextResponse.json(
            { error: 'Failed to fetch users', details: err.message },
            { status: 500 }
        );
    }
}

// POST: Create new user
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { email, name, role, phone, location, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                role: role || 'FARMER',
                phone,
                location,
                passwordHash,
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'user_created',
                entityType: 'User',
                entityId: user.id,
                changes: JSON.stringify({ email, role }),
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (err: any) {
        console.error('Error creating user:', err);
        return NextResponse.json(
            { error: 'Failed to create user', details: err.message },
            { status: 500 }
        );
    }
}
