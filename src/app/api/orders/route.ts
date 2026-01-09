import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'purchases' or 'sales'
    const userId = session.user.id;

    let orders;

    if (type === 'sales') {
      // Get orders where user is the seller
      orders = await prisma.order.findMany({
        where: {
          sellerId: userId,
        },
        include: {
          items: true,
          buyer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Get orders where user is the buyer (default)
      orders = await prisma.order.findMany({
        where: {
          buyerId: userId,
        },
        include: {
          items: true,
          seller: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('Get orders error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: err.message },
      { status: 500 }
    );
  }
}

