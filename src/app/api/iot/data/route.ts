/**
 * IoT Device Data Ingestion API
 * Receives and stores sensor readings from IoT devices
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';
import { logger } from '@/lib/logger';

// POST /api/iot/data - Ingest sensor data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, data, timestamp } = body;

    if (!deviceId || !data) {
      return NextResponse.json(
        { error: 'deviceId and data are required' },
        { status: 400 }
      );
    }

    // Validate data is an object
    if (typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json(
        { error: 'data must be an object' },
        { status: 400 }
      );
    }

    // Store the reading
    const result = await dbQuery(
      `INSERT INTO iot_readings (device_id, data, timestamp, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [
        deviceId,
        JSON.stringify(data),
        timestamp || new Date().toISOString()
      ]
    );

    // Update device last_seen and status
    await dbQuery(
      `UPDATE iot_devices 
       SET last_seen = NOW(), status = 'online', updated_at = NOW()
       WHERE id = $1`,
      [deviceId]
    );

    logger.debug('IoT data ingested', { deviceId, dataKeys: Object.keys(data) });

    return NextResponse.json({ reading: result[0] }, { status: 201 });
  } catch (error) {
    logger.error('Failed to ingest IoT data', error);
    return NextResponse.json(
      { error: 'Failed to store sensor data' },
      { status: 500 }
    );
  }
}

// GET /api/iot/data - Get sensor readings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const since = searchParams.get('since'); // ISO timestamp

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    let query = `SELECT * FROM iot_readings WHERE device_id = $1`;
    const params: any[] = [deviceId];

    if (since) {
      query += ` AND timestamp >= $2`;
      params.push(since);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const readings = await dbQuery(query, params);

    return NextResponse.json({ readings });
  } catch (error) {
    logger.error('Failed to fetch IoT readings', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    );
  }
}
