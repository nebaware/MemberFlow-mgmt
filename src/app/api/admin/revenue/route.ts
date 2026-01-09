import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    // Get all revenue records
    const revenue = await dbQuery(
      `SELECT id, order_id AS "orderId", revenue_type AS "revenueType", 
              amount, percentage, description, created_at AS "createdAt"
       FROM platform_revenue
       ORDER BY created_at DESC`
    );

    // Get revenue statistics
    const statsRows = await dbQuery(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(DISTINCT order_id) as total_orders,
        COALESCE(AVG(amount), 0) as avg_commission
       FROM platform_revenue`
    );

    const stats = statsRows[0];

    // Get today's revenue
    const todayRows = await dbQuery(
      `SELECT COALESCE(SUM(amount), 0) as today_revenue
       FROM platform_revenue
       WHERE DATE(created_at) = DATE('now')`
    );

    const todayRevenue = todayRows[0]?.today_revenue || 0;

    // Get platform settings
    const settingsRows = await dbQuery(
      `SELECT setting_key, setting_value FROM platform_settings`
    );

    const settings: Record<string, string> = {};
    settingsRows.forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });

    return NextResponse.json({
      revenue,
      stats: {
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        totalOrders: parseInt(stats.total_orders) || 0,
        avgCommission: parseFloat(stats.avg_commission) || 0,
        todayRevenue: parseFloat(todayRevenue) || 0,
      },
      settings,
    });
  } catch (err: any) {
    console.error('Revenue fetch error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
