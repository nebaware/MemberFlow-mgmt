import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    // Group items by seller
    const itemsBySeller: Record<string, any[]> = {};
    for (const item of items) {
      if (!itemsBySeller[item.sellerId]) {
        itemsBySeller[item.sellerId] = [];
      }
      itemsBySeller[item.sellerId].push(item);
    }

    const createdOrders = [];

    // Create an order for each seller
    for (const sellerId of Object.keys(itemsBySeller)) {
      const sellerItems = itemsBySeller[sellerId];
      const totalAmount = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 1. Check if column seller_id exists in orders, if not add it safely handled via db
      try {
        await dbQuery('ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES users(id);', []);
      } catch (e) {
        // ignore if fails
      }

      // 2. Insert Order
      const orderRows = await dbQuery(
        `INSERT INTO orders (order_number, buyer_id, seller_id, total_amount, net_amount, status, payment_status, delivery_address)
         VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', $6)
         RETURNING id, order_number, buyer_id, seller_id, total_amount, status, payment_status`,
        [orderNumber, parseInt(session.user.id, 10) || 1, parseInt(sellerId, 10) || 1, totalAmount, totalAmount, JSON.stringify(shippingAddress)]
      );

      const order = orderRows[0];
      const orderId = order.id;

      // 3. Insert Order Items
      const createdItems = [];
      for (const item of sellerItems) {
        const itemRows = await dbQuery(
          `INSERT INTO order_items (order_id, product_id, seller_id, product_name, quantity, unit_price, total_price, seller_amount, platform_commission)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, product_id, quantity, unit_price, total_price`,
          [
            orderId,
            parseInt(item.productId, 10) || 1,
            parseInt(sellerId, 10) || 1,
            item.title || item.name || 'Product',
            item.quantity,
            item.price,
            item.price * item.quantity,
            item.price * item.quantity * 0.95, // 95% to seller
            item.price * item.quantity * 0.05  // 5% platform fee
          ]
        );
        createdItems.push(itemRows[0]);
      }

      createdOrders.push({
        ...order,
        items: createdItems
      });
    }

    return NextResponse.json({ success: true, orders: createdOrders }, { status: 201 });
  } catch (err: any) {
    console.error('Create order error:', err);
    return NextResponse.json(
      { error: 'Failed to create order', details: err.message },
      { status: 500 }
    );
  }
}
