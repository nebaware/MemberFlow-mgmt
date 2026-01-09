import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get counts from Prisma
    const usersCount = await prisma.user.count();

    // Get database size using raw query
    const dbSizeResult = await prisma.$queryRaw<Array<{ size: string }>>`
      SELECT pg_size_pretty(pg_database_size('azmera_db')) as size
    `;

    // Get table information with sizes
    const tableInfo = await prisma.$queryRaw<Array<{ table_name: string; size: string }>>`
      SELECT 
        tablename as table_name,
        pg_size_pretty(pg_total_relation_size('public.' || tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size('public.' || tablename) DESC
    `;

    // Get row counts for each table using pg_stat_user_tables
    const tableStats = await prisma.$queryRaw<Array<{ table_name: string; row_count: bigint }>>`
      SELECT 
        tablename as table_name,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
    `;

    // Merge table info with row counts
    const tablesWithCounts = tableInfo.map(table => {
      const stats = tableStats.find(s => s.table_name === table.table_name);
      return {
        table_name: table.table_name,
        row_count: stats ? Number(stats.row_count) : 0,
        size: table.size,
      };
    });

    // Get recent user registrations for activity
    const recentUsers = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const recentActivity = recentUsers.map(user => ({
      type: 'User Registration',
      description: `${user.name || 'User'} (${user.email}) registered as ${user.role}`,
      timestamp: user.createdAt.toISOString(),
    }));

    const stats = {
      users: usersCount,
      products: 0, // No products table in current schema
      orders: 0, // No orders table in current schema
      storage_facilities: 0,
      transportation: 0,
      learning_modules: 0,
      transactions: 0,
      escrow_transactions: 0,
      total_revenue: 0,
      database_size: dbSizeResult[0]?.size || 'N/A',
    };

    return NextResponse.json({
      stats,
      tables: tablesWithCounts,
      recentActivity,
    });
  } catch (error: any) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database statistics', details: error.message },
      { status: 500 }
    );
  }
}
