import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    let activities = [];

    switch (role) {
      case 'farmer':
      case 'tool_seller':
        // Seller activities
        activities = await dbQuery(`
          SELECT 
            o.id,
            'sale' as type,
            CONCAT('Order #', o.order_number, ' - ', o.status) as description,
            o.updated_at as timestamp,
            SUM(oi.seller_amount) as amount,
            o.status
          FROM orders o
          INNER JOIN \"OrderItem\" oi ON o.id = oi.order_id
          WHERE oi.seller_id = $1
          GROUP BY o.id, o.order_number, o.status, o.updated_at
          ORDER BY o.updated_at DESC
          LIMIT $2
        `, [userId, limit]);
        break;

      case 'buyer':
        // Buyer activities
        activities = await dbQuery(`
          SELECT 
            id,
            'purchase' as type,
            CONCAT('Order #', order_number, ' - ', status) as description,
            updated_at as timestamp,
            total_amount as amount,
            status
          FROM orders
          WHERE buyer_id = $1
          ORDER BY updated_at DESC
          LIMIT $2
        `, [userId, limit]);
        break;

      case 'transporter':
        // Transporter activities
        activities = await dbQuery(`
          SELECT 
            id,
            'delivery' as type,
            CONCAT('Delivery #', id, ' - ', status) as description,
            updated_at as timestamp,
            delivery_fee as amount,
            status
          FROM transportation_requests
          WHERE transporter_id = $1
          ORDER BY updated_at DESC
          LIMIT $2
        `, [userId, limit]);
        break;

      case 'educator':
        // Educator activities
        activities = await dbQuery(`
          SELECT 
            ulp.id,
            'enrollment' as type,
            CONCAT('Student enrolled in ', lm.title) as description,
            ulp.enrolled_at as timestamp,
            0 as amount,
            CASE WHEN ulp.completed THEN 'completed' ELSE 'in_progress' END as status
          FROM user_learning_progress ulp
          INNER JOIN learning_modules lm ON ulp.module_id = lm.id
          WHERE lm.created_by = $1
          ORDER BY ulp.enrolled_at DESC
          LIMIT $2
        `, [userId, limit]);
        break;

      case 'storage_provider':
        // Storage provider activities
        activities = await dbQuery(`
          SELECT 
            sb.id,
            'booking' as type,
            CONCAT('Booking at ', sf.name, ' - ', sb.status) as description,
            sb.created_at as timestamp,
            sb.total_cost as amount,
            sb.status
          FROM storage_bookings sb
          INNER JOIN storage_facilities sf ON sb.facility_id = sf.id
          WHERE sf.provider_id = $1
          ORDER BY sb.created_at DESC
          LIMIT $2
        `, [userId, limit]);
        break;

      default:
        activities = [];
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching dashboard activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
