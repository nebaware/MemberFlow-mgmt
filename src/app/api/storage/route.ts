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
    const providerId = searchParams.get('providerId');
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const availability = searchParams.get('availability');

    let query = 'SELECT * FROM \"StorageFacility\"';
    const params: any[] = [];
    const conditions: string[] = [];

    if (providerId) {
      conditions.push(`provider_id = $${params.length + 1}`);
      params.push(providerId);
    }

    if (location) {
      conditions.push(`location ILIKE $${params.length + 1}`);
      params.push(`%${location}%`);
    }

    if (type) {
      conditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }

    if (availability) {
      conditions.push(`availability = $${params.length + 1}`);
      params.push(availability);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const facilities = await dbQuery(query, params);
    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error fetching storage facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage facilities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      providerId,
      name,
      location,
      type,
      capacity,
      capacityUnit,
      pricePerUnit,
      features,
    } = body;

    // Validate required fields
    if (!name || !location || !type || !capacity || !pricePerUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert new storage facility
    const result = await dbQuery(
      `INSERT INTO storage_facilities (
        provider_id,
        name,
        location,
        type,
        capacity,
        capacity_unit,
        available_capacity,
        price_per_unit,
        features,
        availability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        providerId || null,
        name,
        location,
        type,
        capacity,
        capacityUnit || 'tons',
        capacity, // Initially all capacity is available
        pricePerUnit,
        features || [],
        'Available',
      ]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating storage facility:', error);
    return NextResponse.json(
      { error: 'Failed to create storage facility' },
      { status: 500 }
    );
  }
}
