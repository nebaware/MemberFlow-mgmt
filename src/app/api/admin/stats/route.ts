import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch counts using raw queries to support tables not yet in Prisma schema
        const counts = await prisma.$queryRaw<Array<{ table_name: string; count: bigint }>>`
            SELECT relname as table_name, n_live_tup as count
            FROM pg_stat_user_tables
            WHERE relname IN ('users', 'orders', 'products')
        `;

        const getCount = (tableName: string) => {
            const table = counts.find(c => c.table_name === tableName);
            return table ? Number(table.count) : 0;
        };

        const totalUsers = getCount('users');
        const totalOrders = getCount('orders');
        const totalProducts = getCount('products');

        // Fetch total revenue using raw query (safely handling if table doesn't exist)
        let totalRevenue = 0;
        try {
            const revenueResult = await prisma.$queryRaw<Array<{ total: number }>>`
                SELECT SUM(total_amount) as total FROM "orders" WHERE status = 'completed'
            `;
            totalRevenue = revenueResult[0]?.total || 0;
        } catch (e) {
            console.warn('Orders table might not exist or has different structure for revenue');
        }

        // Fetch recent orders using raw query
        let recentOrders: any[] = [];
        try {
            recentOrders = await prisma.$queryRaw`
                SELECT o.id, o.order_number, o.total_amount, o.status, u.name as buyer_name, o.created_at
                FROM "orders" o
                LEFT JOIN "User" u ON o.buyer_id = u.id
                ORDER BY o.created_at DESC
                LIMIT 5
            `;
        } catch (e) {
            console.warn('Orders table might not exist or has different structure for recent orders');
        }

        // Fetch pending verifications count
        const pendingVerifications = await prisma.user.count({
            where: {
                verificationStatus: 'pending',
                role: {
                    not: 'ADMIN'
                }
            }
        });

        return NextResponse.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            pendingVerifications,
            recentOrders
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
