import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db-sqlite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, reason, description } = body;

        if (!orderId || !reason || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify order belongs to user
        const order = await dbQuery(
            'SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
            [orderId, session.user.id]
        );

        if (!order || order.length === 0) {
            return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 });
        }

        // Create dispute
        const result = await dbQuery(
            `INSERT INTO disputes (order_id, raiser_id, reason, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [orderId, session.user.id, reason, description]
        );

        return NextResponse.json(result[0], { status: 201 });
    } catch (error: any) {
        console.error('Failed to create dispute:', error);
        return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query = `
      SELECT d.*, 
             u.name as raiser_name, 
             u.email as raiser_email,
             o.total_price as order_amount
      FROM disputes d
      JOIN users u ON d.raiser_id = u.id
      JOIN orders o ON d.order_id = o.id
    `;

        const params: any[] = [];

        // If not admin, only show own disputes
        if (session.user.role !== 'admin') {
            query += ' WHERE d.raiser_id = $1';
            params.push(session.user.id);
        }

        query += ' ORDER BY d.created_at DESC';

        const disputes = await dbQuery(query, params);

        return NextResponse.json(disputes);
    } catch (error: any) {
        console.error('Failed to fetch disputes:', error);
        return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
    }
}
