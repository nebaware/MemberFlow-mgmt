import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch order
    const orders = await dbQuery(
      `SELECT 
        o.id,
        o.order_number as "orderNumber",
        o.buyer_id as "buyerId",
        o.total_amount as "totalAmount",
        o.platform_fee as "platformFee",
        o.delivery_fee as "deliveryFee",
        o.net_amount as "netAmount",
        o.status,
        o.payment_status as "paymentStatus",
        o.payment_method as "paymentMethod",
        o.delivery_address as "shippingAddress",
        o.delivery_type as "deliveryType",
        o.created_at as "createdAt",
        o.updated_at as "updatedAt"
      FROM orders o
      WHERE o.id = $1`,
      [id]
    );

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Fetch order items
    const items = await dbQuery(
      `SELECT 
        oi.id,
        oi.product_id as "productId",
        oi.product_name as "productName",
        oi.unit_price as price,
        oi.quantity,
        oi.total_price as subtotal,
        oi.seller_id as "sellerId",
        oi.seller_amount as "sellerAmount",
        p.images[1] as "productImage"
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [id]
    );

    return NextResponse.json({
      ...order,
      items: items.map((item: any) => ({
        ...item,
        productImage: item.productImage || 'https://placehold.co/100x100.png',
      })),
    });
  } catch (err: any) {
    console.error('Order GET by ID error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, deliveryDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      queryParams.push(status);
    }

    if (paymentStatus) {
      updates.push(`payment_status = $${paramCount++}`);
      queryParams.push(paymentStatus);
    }

    if (deliveryDate) {
      updates.push(`delivery_date = $${paramCount++}`);
      queryParams.push(deliveryDate);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    queryParams.push(id);

    const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await dbQuery(query, queryParams);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error('Order PATCH error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
