import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET(request: Request) {
  try {
    if (!isDbConfigured()) return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const email = searchParams.get('email');

    if (userId) {
      const rows = await dbQuery(
        `SELECT id, email, name, role, phone, location, profile_image AS "profileImage", 
                wallet_balance AS "walletBalance", escrow_balance AS "escrowBalance", 
                created_at AS "createdAt"
         FROM users WHERE id = $1`,
        [userId]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(rows[0]);
    }

    if (email) {
      const rows = await dbQuery(
        `SELECT id, email, name, role, phone, location, profile_image AS "profileImage", 
                wallet_balance AS "walletBalance", escrow_balance AS "escrowBalance", 
                created_at AS "createdAt"
         FROM users WHERE email = $1`,
        [email]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(rows[0]);
    }

    // List all users (admin only - add auth check in production)
    const rows = await dbQuery(
      `SELECT id, email, name, role, location, created_at AS "createdAt"
       FROM users ORDER BY created_at DESC LIMIT 100`
    );

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
    const { email, name, role, phone, location } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await dbQuery('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const rows = await dbQuery(
      `INSERT INTO users (email, name, role, phone, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, phone, location, wallet_balance AS "walletBalance", 
                 escrow_balance AS "escrowBalance", created_at AS "createdAt"`,
      [email, name, role, phone || null, location || null]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isDbConfigured()) return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });

    const body = await request.json();
    const { userId, name, phone, location, profileImage } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      params.push(location);
    }
    if (profileImage !== undefined) {
      updates.push(`profile_image = $${paramIndex++}`);
      params.push(profileImage);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = now()`);
    params.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const rows = await dbQuery(query, params);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
