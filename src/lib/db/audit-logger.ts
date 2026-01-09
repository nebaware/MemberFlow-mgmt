import { prisma } from '@/lib/db/prisma';
import { headers } from 'next/headers';

interface AuditLogData {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: Record<string, any>;
}

/**
 * Create an audit log entry for tracking system actions
 */
export async function createAuditLog(data: AuditLogData) {
    try {
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        await prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                changes: data.changes ? JSON.stringify(data.changes) : null,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        // Log error but don't throw - audit logging shouldn't break the main flow
        console.error('Failed to create audit log:', error);
    }
}

/**
 * Audit log action types
 */
export const AuditActions = {
    // Order actions
    ORDER_CREATED: 'order_created',
    ORDER_PAID: 'order_paid',
    ORDER_SHIPPED: 'order_shipped',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_CANCELLED: 'order_cancelled',

    // Dispute actions
    DISPUTE_CREATED: 'dispute_created',
    DISPUTE_RESOLVED: 'dispute_resolved',

    // Wallet actions
    WALLET_CREDITED: 'wallet_credited',
    WALLET_DEBITED: 'wallet_debited',
    WITHDRAWAL_REQUESTED: 'withdrawal_requested',
    WITHDRAWAL_PROCESSED: 'withdrawal_processed',

    // Admin actions
    ADMIN_ROLE_CHANGED: 'admin_role_changed',
    ADMIN_USER_VERIFIED: 'admin_user_verified',
} as const;
