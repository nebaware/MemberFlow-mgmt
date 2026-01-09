import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// GET: Fetch consultation requests for an educator or requester
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role'); // educator or requester

        const consultations = await prisma.consultation.findMany({
            where: {
                OR: [
                    { educatorId: session.user.id },
                    { requesterId: session.user.id }
                ],
                ...(role === 'educator' ? { educatorId: session.user.id } : {}),
                ...(role === 'requester' ? { requesterId: session.user.id } : {}),
            },
            include: {
                educator: {
                    select: { id: true, name: true, email: true }
                },
                requester: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ consultations });
    } catch (err: any) {
        console.error('Error fetching consultations:', err);
        return NextResponse.json(
            { error: 'Failed to fetch consultations', details: err.message },
            { status: 500 }
        );
    }
}

// POST: Create a new consultation request
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { educatorId, topic, details, requestedDate } = body;

        if (!educatorId || !topic || !details || !requestedDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify educator exists
        const educator = await prisma.user.findUnique({
            where: { id: educatorId },
        });

        if (!educator || educator.role !== 'EDUCATOR') {
            return NextResponse.json({ error: 'Invalid educator' }, { status: 400 });
        }

        const consultation = await prisma.consultation.create({
            data: {
                educatorId,
                requesterId: session.user.id,
                topic,
                details,
                requestedDate: new Date(requestedDate),
                status: 'pending'
            },
            include: {
                educator: {
                    select: { name: true }
                }
            }
        });

        // Proactively create a notification for the educator
        await prisma.notification.create({
            data: {
                userId: educatorId,
                type: 'consultation_requested',
                title: 'New Consultation Request',
                message: `You have received a new consultation request from ${session.user.name || 'a user'} regarding "${topic}".`,
                read: false,
            }
        });

        return NextResponse.json({
            success: true,
            consultation
        });
    } catch (err: any) {
        console.error('Error creating consultation request:', err);
        return NextResponse.json(
            { error: 'Failed to create consultation request', details: err.message },
            { status: 500 }
        );
    }
}
