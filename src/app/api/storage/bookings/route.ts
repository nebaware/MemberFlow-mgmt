import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    const userId = searchParams.get('userId');
    const facilityId = searchParams.get('facilityId');
    const status = searchParams.get('status');
    
    let query = `
      SELECT 
        sb.*,
        sf.name as facility_name,
        sf.provider_id,
        u.name as user_name
      FROM storage_bookings sb
      JOIN storage_facilities sf ON sb.facility_id = sf.id
      JOIN users u ON sb.user_id = u.id
    `;
    
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (providerId) {
      conditions.push(`sf.provider_id = $${params.length + 1}`);
      params.push(providerId);
    }
    
    if (userId) {
      conditions.push(`sb.user_id = $${params.length + 1}`);
      params.push(userId);
    }
    
    if (facilityId) {
      conditions.push(`sb.facility_id = $${params.length + 1}`);
      params.push(facilityId);
    }
    
    if (status) {
      conditions.push(`sb.booking_status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sb.created_at DESC';
    
    const bookings = await dbQuery(query, params);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching storage bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      facilityId,
      quantity,
      durationMonths,
      totalCost,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!userId || !facilityId || !quantity || !durationMonths || !totalCost || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if facility has enough capacity
    const [facility] = await dbQuery(
      'SELECT available_capacity FROM storage_facilities WHERE id = $1',
      [facilityId]
    );

    if (!facility || parseFloat(facility.available_capacity) < parseFloat(quantity)) {
      return NextResponse.json(
        { error: 'Insufficient capacity available' },
        { status: 400 }
      );
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(durationMonths));

    // Insert new booking
    const result = await dbQuery(
      `INSERT INTO storage_bookings (
        user_id,
        facility_id,
        quantity,
        duration_months,
        total_cost,
        payment_method,
        payment_status,
        booking_status,
        start_date,
        end_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId,
        facilityId,
        quantity,
        durationMonths,
        totalCost,
        paymentMethod,
        'Pending',
        'Pending',
        startDate,
        endDate,
      ]
    );

    // Update facility available capacity
    await dbQuery(
      `UPDATE storage_facilities 
       SET available_capacity = available_capacity - $1 
       WHERE id = $2`,
      [quantity, facilityId]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating storage booking:', error);
    return NextResponse.json(
      { error: 'Failed to create storage booking' },
      { status: 500 }
    );
  }
}
