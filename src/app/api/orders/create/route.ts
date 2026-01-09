import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog, AuditActions } from '@/lib/db/audit-logger';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Create an order for each seller (multi-vendor support)
    for (const sellerId of Object.keys(itemsBySeller)) {
      const sellerItems = itemsBySeller[sellerId];
      const totalAmount = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const order = await prisma.order.create({
        data: {
          buyerId: session.user.id,
          sellerId: sellerId,
          totalAmount: totalAmount,
          status: 'pending',
          paymentStatus: 'pending',
          deliveryStatus: 'pending',
          escrowStatus: 'held',
          shippingAddress: JSON.stringify(shippingAddress),
          items: {
            create: sellerItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      createdOrders.push(order);

      // Audit log
      await createAuditLog({
        userId: session.user.id,
        action: AuditActions.ORDER_CREATED,
        entityType: 'Order',
        entityId: order.id,
        changes: {
          buyerId: order.buyerId,
          sellerId: order.sellerId,
          totalAmount: order.totalAmount,
          itemCount: order.items.length,
        },
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
