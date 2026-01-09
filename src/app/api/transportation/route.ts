import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/auth-helpers';

export async function GET(request: NextRequest) {
  // Verify authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const transporterId = searchParams.get('transporterId');
    const userId = searchParams.get('userId');

    // Use transporterId or userId
    const id = transporterId || userId;

    if (!id) {
      return NextResponse.json(
        { error: 'transporterId or userId is required' },
        { status: 400 }
      );
    }

    // Fetch transportation records for this transporter
    const transportations = await dbQuery(
      `SELECT 
        t.*,
        o.order_number,
        o.buyer_id,
        u.name as buyer_name
      FROM \"Transportation\" t
      LEFT JOIN orders o ON t.order_id = o.id
      LEFT JOIN users u ON o.buyer_id = u.id
      WHERE t.transporter_id = $1
      ORDER BY t.created_at DESC`,
      [id]
    );

    return NextResponse.json(transportations);
  } catch (error) {
    console.error('Error fetching transportation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transportation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      orderId,
      transporterId,
      pickupLocation,
      dropoffLocation,
      productName,
      deliveryFee,
      scheduledDate,
    } = body;

    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !productName || !deliveryFee) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert new transportation request
    const result = await dbQuery(
      `INSERT INTO \"Transportation\" (
        order_id,
        transporter_id,
        pickup_location,
        dropoff_location,
        product_name,
        delivery_fee,
        scheduled_date,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        orderId || null,
        transporterId || null,
        pickupLocation,
        dropoffLocation,
        productName,
        deliveryFee,
        scheduledDate || null,
        'pending',
      ]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating transportation request:', error);
    return NextResponse.json(
      { error: 'Failed to create transportation request' },
      { status: 500 }
    );
  }
}
