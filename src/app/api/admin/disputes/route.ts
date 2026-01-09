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

        const disputes = await prisma.dispute.findMany({
            include: {
                order: {
                    select: {
                        orderNumber: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ disputes });
    } catch (err: any) {
        console.error('Error fetching disputes:', err);
        return NextResponse.json(
            { error: 'Failed to fetch disputes', details: err.message },
            { status: 500 }
        );
    }
}
