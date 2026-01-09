import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const educatorId = searchParams.get('educatorId');
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');
    
    let query = `
      SELECT 
        e.*,
        lm.title as module_title,
        lm.educator_id,
        u.name as student_name
      FROM enrollments e
      JOIN learning_modules lm ON e.module_id = lm.id
      JOIN users u ON e.user_id = u.id
    `;
    
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (educatorId) {
      conditions.push(`lm.educator_id = $${params.length + 1}`);
      params.push(educatorId);
    }
    
    if (userId) {
      conditions.push(`e.user_id = $${params.length + 1}`);
      params.push(userId);
    }
    
    if (moduleId) {
      conditions.push(`e.module_id = $${params.length + 1}`);
      params.push(moduleId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY e.enrolled_at DESC';
    
    const enrollments = await dbQuery(query, params);
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, moduleId } = body;

    // Validate required fields
    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'userId and moduleId are required' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await dbQuery(
      'SELECT * FROM enrollments WHERE user_id = $1 AND module_id = $2',
      [userId, moduleId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Already enrolled in this module' },
        { status: 400 }
      );
    }

    // Insert new enrollment
    const result = await dbQuery(
      `INSERT INTO enrollments (user_id, module_id, progress, completed)
       VALUES ($1, $2, 0, false)
       RETURNING *`,
      [userId, moduleId]
    );

    // Update enrollment count in learning_modules
    await dbQuery(
      `UPDATE learning_modules 
       SET enrollment_count = enrollment_count + 1 
       WHERE id = $1`,
      [moduleId]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}
