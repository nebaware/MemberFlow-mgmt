import { prisma } from '@/lib/db/prisma';

export type NotificationType =
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'order_update'
    | 'payment_update'
    | 'license_verification'
    | 'dispute_update'
    | 'system';

interface CreateNotificationParams {
    userId: string;
    type: string; // Using string to match Prisma model, but conceptually NotificationType
    title: string;
    message: string;
    orderId?: string;
    link?: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                orderId: params.orderId,
                read: false,
                // link: params.link, // Check if link exists in schema, if not we might need to add it or omit it
            },
        });
        return notification;
    } catch (error) {
        // Silently fail - notifications are not critical
        return null;
    }
}

/**
 * Create notifications for multiple users (e.g. admins)
 */
export async function createBulkNotifications(userIds: string[], params: Omit<CreateNotificationParams, 'userId'>) {
    try {
        const notifications = userIds.map(userId => ({
            userId,
            type: params.type,
            title: params.title,
            message: params.message,
            orderId: params.orderId,
            read: false,
        }));

        await prisma.notification.createMany({
            data: notifications,
        });
    } catch (error) {
        // Silently fail - notifications are not critical
    }
}
