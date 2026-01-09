import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params;

    if (!sellerId) {
      return NextResponse.json(
        { error: 'sellerId is required' },
        { status: 400 }
      );
    }

    // Fetch orders that contain items from this seller
    const orders = await dbQuery(
      `SELECT DISTINCT
        o.*,
        SUM(oi.seller_amount) as seller_amount
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.seller_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [sellerId]
    );

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller orders' },
      { status: 500 }
    );
  }
}
