import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// GET: Fetch user wallet
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get or create wallet
        let wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 20,
                },
                user: {
                    select: {
                        twoFactorEnabled: true,
                    },
                },
            },
        });

        if (!wallet) {
            const newWallet = await prisma.wallet.create({
                data: {
                    userId: session.user.id,
                },
                include: {
                    transactions: true,
                    user: {
                        select: {
                            twoFactorEnabled: true,
                        },
                    },
                },
            });

            return NextResponse.json({
                wallet: {
                    ...newWallet,
                    twoFactorEnabled: newWallet.user.twoFactorEnabled
                }
            });
        }

        return NextResponse.json({
            wallet: {
                ...wallet,
                twoFactorEnabled: wallet.user.twoFactorEnabled
            }
        });
    } catch (err: any) {
        console.error('Get wallet error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch wallet', details: err.message },
            { status: 500 }
        );
    }
}
