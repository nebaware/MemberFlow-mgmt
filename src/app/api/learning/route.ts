import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET() {
  try {
    if (!isDbConfigured()) return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
  const rows = await dbQuery('SELECT id, title, description, content_type AS "contentType", content_body AS "contentBody", category, language, thumbnail, duration, price, reward_points AS "rewardPoints", created_at AS "createdAt" FROM learning_modules ORDER BY created_at DESC');
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
        const { title, description, contentType, contentBody, category, language, thumbnail, duration, price, rewardPoints } = body;
    if (!title || !description) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const rows = await dbQuery(
      `INSERT INTO learning_modules (title, description, content_type, content_body, category, language, thumbnail, duration, price, reward_points)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, title, description, content_type AS "contentType", content_body AS "contentBody", category, language, thumbnail, duration, price, reward_points AS "rewardPoints", created_at AS "createdAt"`,
      [title, description, contentType || null, contentBody || null, category || null, language || null, thumbnail || null, duration || null, price || 0, rewardPoints || 0]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
