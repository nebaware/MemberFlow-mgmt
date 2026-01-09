import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    let stats = {};

    switch (role) {
      case 'farmer':
      case 'tool_seller':
        // Seller statistics
        const sellerStats = await dbQuery(`
          SELECT 
            COUNT(DISTINCT o.id) as total_orders,
            COUNT(DISTINCT CASE WHEN o.status IN ('paid', 'processing', 'shipped') THEN o.id END) as active_orders,
            COUNT(DISTINCT CASE WHEN o.status = 'shipped' THEN o.id END) as pending_deliveries,
            COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN oi.seller_amount ELSE 0 END), 0) as revenue,
            COALESCE(SUM(CASE WHEN o.payment_status = 'in_escrow' THEN oi.seller_amount ELSE 0 END), 0) as escrow_balance
          FROM orders o
          INNER JOIN \"OrderItem\" oi ON o.id = oi.order_id
          WHERE oi.seller_id = $1
        `, [userId]);

        const productCount = await dbQuery(`
          SELECT COUNT(*) as count FROM products WHERE farmer_id = $1
        `, [userId]);

        stats = {
          totalSales: sellerStats[0]?.total_orders || 0,
          activeOrders: sellerStats[0]?.active_orders || 0,
          pendingDeliveries: sellerStats[0]?.pending_deliveries || 0,
          revenue: parseFloat(sellerStats[0]?.revenue || 0),
          escrowBalance: parseFloat(sellerStats[0]?.escrow_balance || 0),
          availableBalance: parseFloat(sellerStats[0]?.revenue || 0) - parseFloat(sellerStats[0]?.escrow_balance || 0),
          productsListed: productCount[0]?.count || 0,
        };
        break;

      case 'buyer':
        // Buyer statistics
        const buyerStats = await dbQuery(`
          SELECT 
            COUNT(*) as total_orders,
            COUNT(CASE WHEN status IN ('paid', 'processing', 'shipped') THEN 1 END) as active_orders,
            COUNT(CASE WHEN status = 'shipped' THEN 1 END) as pending_deliveries,
            COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_spent,
            COALESCE(SUM(CASE WHEN payment_status = 'in_escrow' THEN total_amount ELSE 0 END), 0) as escrow_balance
          FROM orders
          WHERE buyer_id = $1
        `, [userId]);

        stats = {
          totalSales: buyerStats[0]?.total_orders || 0,
          activeOrders: buyerStats[0]?.active_orders || 0,
          pendingDeliveries: buyerStats[0]?.pending_deliveries || 0,
          revenue: parseFloat(buyerStats[0]?.total_spent || 0),
          escrowBalance: parseFloat(buyerStats[0]?.escrow_balance || 0),
          availableBalance: 0,
        };
        break;

      case 'transporter':
        // Transporter statistics
        const transportStats = await dbQuery(`
          SELECT 
            COUNT(*) as total_deliveries,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_requests,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN delivery_fee ELSE 0 END), 0) as revenue
          FROM \"TransportationRequest\"
          WHERE transporter_id = $1
        `, [userId]);

        stats = {
          totalSales: transportStats[0]?.total_deliveries || 0,
          activeOrders: transportStats[0]?.active_requests || 0,
          completedDeliveries: transportStats[0]?.total_deliveries || 0,
          revenue: parseFloat(transportStats[0]?.revenue || 0),
          escrowBalance: 0,
          availableBalance: parseFloat(transportStats[0]?.revenue || 0),
        };
        break;

      case 'educator':
        // Educator statistics
        const educatorStats = await dbQuery(`
          SELECT 
            COUNT(DISTINCT lm.id) as courses_created,
            COUNT(DISTINCT ulp.user_id) as students_enrolled,
            COALESCE(SUM(CASE WHEN ulp.completed THEN 1 ELSE 0 END), 0) as completions
          FROM \"LearningContent\" lm
          LEFT JOIN \"UserLearningProgress\" ulp ON lm.id = ulp.module_id
          WHERE lm.created_by = $1
        `, [userId]);

        stats = {
          coursesCreated: educatorStats[0]?.courses_created || 0,
          studentsEnrolled: educatorStats[0]?.students_enrolled || 0,
          totalSales: educatorStats[0]?.completions || 0,
          activeOrders: 0,
          pendingDeliveries: 0,
          revenue: 0,
          escrowBalance: 0,
          availableBalance: 0,
        };
        break;

      case 'storage_provider':
        // Storage provider statistics
        const storageStats = await dbQuery(`
          SELECT 
            COUNT(DISTINCT sf.id) as facilities_managed,
            COUNT(DISTINCT sb.id) as bookings_received,
            COALESCE(SUM(CASE WHEN sb.status = 'active' THEN sb.total_cost ELSE 0 END), 0) as revenue
          FROM \"StorageFacility\" sf
          LEFT JOIN \"StorageBooking\" sb ON sf.id = sb.facility_id
          WHERE sf.provider_id = $1
        `, [userId]);

        stats = {
          facilitiesManaged: storageStats[0]?.facilities_managed || 0,
          bookingsReceived: storageStats[0]?.bookings_received || 0,
          revenue: parseFloat(storageStats[0]?.revenue || 0),
          totalSales: storageStats[0]?.bookings_received || 0,
          activeOrders: 0,
          pendingDeliveries: 0,
          escrowBalance: 0,
          availableBalance: parseFloat(storageStats[0]?.revenue || 0),
        };
        break;

      default:
        stats = {
          totalSales: 0,
          activeOrders: 0,
          pendingDeliveries: 0,
          revenue: 0,
          escrowBalance: 0,
          availableBalance: 0,
        };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
