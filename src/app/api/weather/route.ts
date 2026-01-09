import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET(request: Request) {
  try {
    if (!isDbConfigured()) return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    
    let query = `
      SELECT id, region, alert_type AS "type", severity, message, created_at AS "timestamp"
      FROM weather_alerts
      WHERE active = true
    `;
    
    const params: any[] = [];
    if (region) {
      query += ' AND region = $1';
      params.push(region);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 20';
    
    const rows = await dbQuery(query, params);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    
    const body = await request.json();
    const { region, alertType, severity, message, expiresAt } = body;
    
    if (!region || !alertType || !severity || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const rows = await dbQuery(
      `INSERT INTO weather_alerts (region, alert_type, severity, message, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, region, alert_type AS "type", severity, message, created_at AS "timestamp"`,
      [region, alertType, severity, message, expiresAt || null]
    );
    
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
