import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// POST: Resolve a dispute
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role?.toLowerCase() !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { action, resolution } = body; // action: 'release' | 'refund' | 'partial'

        if (!['release', 'refund', 'partial'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const dispute = await prisma.dispute.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        escrowTransaction: true,
                    },
                },
            },
        });

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        if (dispute.status !== 'pending') {
            return NextResponse.json({ error: 'Dispute already resolved' }, { status: 400 });
        }

        // Resolve dispute in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update dispute
            const updatedDispute = await tx.dispute.update({
                where: { id },
                data: {
                    status: 'resolved',
                    resolution,
                    resolvedBy: session.user.id,
                    resolvedAt: new Date(),
                },
            });

            // Update order and escrow based on action
            if (action === 'release') {
                // Release funds to seller
                await tx.order.update({
                    where: { id: dispute.orderId },
                    data: {
                        escrowStatus: 'released',
                        paymentStatus: 'released',
                        status: 'delivered',
                    },
                });

                if (dispute.order.escrowTransaction) {
                    await tx.escrowTransaction.update({
                        where: { id: dispute.order.escrowTransaction.id },
                        data: {
                            status: 'released',
                            releasedAt: new Date(),
                        },
                    });
                }

                // Credit seller wallet
                let sellerWallet = await tx.wallet.findUnique({ where: { userId: dispute.order.sellerId } });
                if (!sellerWallet) {
                    sellerWallet = await tx.wallet.create({ data: { userId: dispute.order.sellerId } });
                }

                const releaseAmount = dispute.order.escrowTransaction?.amount || dispute.order.totalAmount;

                await tx.wallet.update({
                    where: { id: sellerWallet.id },
                    data: {
                        balance: { increment: releaseAmount },
                        totalEarnings: { increment: releaseAmount },
                        transactions: {
                            create: {
                                type: 'credit',
                                amount: releaseAmount,
                                orderId: dispute.orderId,
                                description: `Payment released for order #${dispute.order.orderNumber}`,
                            }
                        }
                    }
                });

            } else if (action === 'refund') {
                // Refund to buyer
                await tx.order.update({
                    where: { id: dispute.orderId },
                    data: {
                        escrowStatus: 'released',
                        paymentStatus: 'refunded',
                        status: 'cancelled',
                    },
                });

                if (dispute.order.escrowTransaction) {
                    await tx.escrowTransaction.update({
                        where: { id: dispute.order.escrowTransaction.id },
                        data: {
                            status: 'refunded',
                            refundedAt: new Date(),
                        },
                    });
                }

                // Refund buyer wallet
                let buyerWallet = await tx.wallet.findUnique({ where: { userId: dispute.order.buyerId } });
                if (!buyerWallet) {
                    buyerWallet = await tx.wallet.create({ data: { userId: dispute.order.buyerId } });
                }

                const refundAmount = dispute.order.escrowTransaction?.amount || dispute.order.totalAmount;

                await tx.wallet.update({
                    where: { id: buyerWallet.id },
                    data: {
                        balance: { increment: refundAmount },
                        transactions: {
                            create: {
                                type: 'refund',
                                amount: refundAmount,
                                orderId: dispute.orderId,
                                description: `Refund for order #${dispute.order.orderNumber}`,
                            }
                        }
                    }
                });
            }

            // Create notifications
            await tx.notification.createMany({
                data: [
                    {
                        userId: dispute.order.buyerId,
                        type: 'dispute_resolved',
                        title: 'Dispute Resolved',
                        message: `Your dispute for order #${dispute.order.orderNumber} has been resolved.`,
                        orderId: dispute.orderId,
                    },
                    {
                        userId: dispute.order.sellerId,
                        type: 'dispute_resolved',
                        title: 'Dispute Resolved',
                        message: `The dispute for order #${dispute.order.orderNumber} has been resolved.`,
                        orderId: dispute.orderId,
                    },
                ],
            });

            return updatedDispute;
        });

        return NextResponse.json({ success: true, dispute: result });
    } catch (err: any) {
        console.error('Resolve dispute error:', err);
        return NextResponse.json(
            { error: 'Failed to resolve dispute', details: err.message },
            { status: 500 }
        );
    }
}
