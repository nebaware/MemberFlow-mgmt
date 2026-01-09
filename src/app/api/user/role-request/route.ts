import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// GET: List user's requests
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const requests = await prisma.roleChangeRequest.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, requests });
    } catch (err: any) {
        console.error('Get role requests error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch requests', details: err.message },
            { status: 500 }
        );
    }
}

// POST: Create a new request
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { requestedRole, documents } = body;

        if (!requestedRole) {
            return NextResponse.json({ error: 'Requested role is required' }, { status: 400 });
        }

        // Check if there is already a pending request
        const pendingRequest = await prisma.roleChangeRequest.findFirst({
            where: {
                userId: session.user.id,
                status: 'pending',
            },
        });

        if (pendingRequest) {
            return NextResponse.json(
                { error: 'You already have a pending role change request' },
                { status: 409 }
            );
        }

        // Create request
        const newRequest = await prisma.roleChangeRequest.create({
            data: {
                userId: session.user.id,
                requestedRole: requestedRole,
                documents: documents ? JSON.stringify(documents) : null,
                status: 'pending',
            },
        });

        return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
    } catch (err: any) {
        console.error('Create role request error:', err);
        return NextResponse.json(
            { error: 'Failed to create request', details: err.message },
            { status: 500 }
        );
    }
}
