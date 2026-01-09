import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const notifications = await prisma.notification.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100, // Limit to last 100 notifications
        });

        return NextResponse.json({ notifications });
    } catch (err: any) {
        console.error('Error fetching notifications:', err);
        return NextResponse.json(
            { error: 'Failed to fetch notifications', details: err.message },
            { status: 500 }
        );
    }
}
