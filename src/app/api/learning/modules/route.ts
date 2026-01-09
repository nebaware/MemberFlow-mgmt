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
    const educatorId = searchParams.get('educatorId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM learning_modules';
    const params: any[] = [];
    const conditions: string[] = [];

    if (educatorId) {
      conditions.push(`educator_id = $${params.length + 1}`);
      params.push(educatorId);
    }

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const modules = await dbQuery(query, params);
    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error fetching learning modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning modules' },
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
      educatorId,
      title,
      description,
      category,
      level,
      content,
      videoUrl,
      durationMinutes,
      price,
      isFree,
    } = body;

    // Validate required fields
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Insert new learning module
    const result = await dbQuery(
      `INSERT INTO learning_modules (
        educator_id,
        title,
        description,
        category,
        level,
        content,
        video_url,
        duration_minutes,
        price,
        is_free,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        educatorId || null,
        title,
        description || null,
        category,
        level || 'Beginner',
        content || null,
        videoUrl || null,
        durationMinutes || null,
        price || 0,
        isFree !== undefined ? isFree : true,
        'draft',
      ]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating learning module:', error);
    return NextResponse.json(
      { error: 'Failed to create learning module' },
      { status: 500 }
    );
  }
}
