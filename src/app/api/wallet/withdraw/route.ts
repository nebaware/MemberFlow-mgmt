import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog, AuditActions } from '@/lib/db/audit-logger';
import speakeasy from 'speakeasy';

// Helper function to check if we need to reset daily/monthly counters
function shouldResetDaily(lastWithdrawalDate: Date | null): boolean {
    if (!lastWithdrawalDate) return true;
    const now = new Date();
    const last = new Date(lastWithdrawalDate);
    return now.getDate() !== last.getDate() ||
        now.getMonth() !== last.getMonth() ||
        now.getFullYear() !== last.getFullYear();
}

function shouldResetMonthly(lastMonthReset: Date): boolean {
    const now = new Date();
    const last = new Date(lastMonthReset);
    return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
}

// POST: Request withdrawal
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
        });

        if (!wallet) {
            return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        }

        // Check 2FA
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (user?.twoFactorEnabled) {
            const { token } = body;
            if (!token) {
                return NextResponse.json({ error: '2FA token required', require2FA: true }, { status: 400 });
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret!,
                encoding: 'base32',
                token: token,
            });

            if (!verified) {
                return NextResponse.json({ error: 'Invalid 2FA token' }, { status: 400 });
            }
        }

        // Check if balance is sufficient
        if (wallet.balance < amount) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Reset counters if needed
        const resetDaily = shouldResetDaily(wallet.lastWithdrawalDate);
        const resetMonthly = shouldResetMonthly(wallet.lastMonthReset);

        const currentDailyWithdrawn = resetDaily ? 0 : wallet.dailyWithdrawn;
        const currentMonthlyWithdrawn = resetMonthly ? 0 : wallet.monthlyWithdrawn;

        // Check daily limit
        if (currentDailyWithdrawn + amount > wallet.dailyWithdrawalLimit) {
            const remaining = wallet.dailyWithdrawalLimit - currentDailyWithdrawn;
            return NextResponse.json({
                error: 'Daily withdrawal limit exceeded',
                limit: wallet.dailyWithdrawalLimit,
                withdrawn: currentDailyWithdrawn,
                remaining: remaining,
            }, { status: 400 });
        }

        // Check monthly limit
        if (currentMonthlyWithdrawn + amount > wallet.monthlyWithdrawalLimit) {
            const remaining = wallet.monthlyWithdrawalLimit - currentMonthlyWithdrawn;
            return NextResponse.json({
                error: 'Monthly withdrawal limit exceeded',
                limit: wallet.monthlyWithdrawalLimit,
                withdrawn: currentMonthlyWithdrawn,
                remaining: remaining,
            }, { status: 400 });
        }

        // Create withdrawal transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update wallet
            const updatedWallet = await tx.wallet.update({
                where: { userId: session.user.id },
                data: {
                    balance: { decrement: amount },
                    dailyWithdrawn: currentDailyWithdrawn + amount,
                    monthlyWithdrawn: currentMonthlyWithdrawn + amount,
                    lastWithdrawalDate: new Date(),
                    ...(resetMonthly ? { lastMonthReset: new Date() } : {}),
                },
            });

            // Create transaction record
            const transaction = await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'withdrawal',
                    amount: -amount,
                    description: `Withdrawal request of ${amount} Birr`,
                },
            });

            // Audit log
            await createAuditLog({
                userId: session.user.id,
                action: AuditActions.WITHDRAWAL_REQUESTED,
                entityType: 'Wallet',
                entityId: wallet.id,
                changes: {
                    amount,
                    newBalance: updatedWallet.balance,
                    dailyWithdrawn: updatedWallet.dailyWithdrawn,
                    monthlyWithdrawn: updatedWallet.monthlyWithdrawn,
                },
            });

            return { wallet: updatedWallet, transaction };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (err: any) {
        console.error('Withdrawal error:', err);
        return NextResponse.json(
            { error: 'Failed to process withdrawal', details: err.message },
            { status: 500 }
        );
    }
}
