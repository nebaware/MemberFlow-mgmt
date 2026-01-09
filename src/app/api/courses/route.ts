import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/auth-helpers';
import { dbQuery } from '@/lib/db/db';
import { learningManager } from '@/lib/managers/learning-manager';
import { securityMiddleware, withAuth } from '@/lib/security/security-middleware';
import { createSecureResponse } from '@/lib/security/security-headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isFree = searchParams.get('free');
    const featured = searchParams.get('featured');
    const instructorId = searchParams.get('instructorId');
    const status = searchParams.get('status') || 'approved';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    let query = `
      SELECT lm.*,
             u.name as instructor_name,
             u.profile_image as instructor_image,
             ip.average_rating as instructor_rating,
             cc.name as category_name,
             (SELECT COUNT(*) FROM course_enrollments WHERE module_id = lm.id) as enrollment_count,
             (SELECT AVG(rating) FROM course_reviews WHERE module_id = lm.id) as average_rating,
             (SELECT COUNT(*) FROM course_reviews WHERE module_id = lm.id) as review_count
      FROM learning_modules lm
      JOIN users u ON lm.educator_id = u.id
      LEFT JOIN instructor_profiles ip ON ip.user_id = u.id
      LEFT JOIN course_categories cc ON cc.name = lm.category
      WHERE lm.approval_status = $1
    `;

    const params: any[] = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND lm.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND lm.difficulty_level = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    if (isFree !== null) {
      query += ` AND lm.is_free = $${paramIndex}`;
      params.push(isFree === 'true');
      paramIndex++;
    }

    if (featured === 'true') {
      query += ` AND lm.featured = true`;
    }

    if (instructorId) {
      query += ` AND lm.educator_id = $${paramIndex}`;
      params.push(parseInt(instructorId));
      paramIndex++;
    }

    if (search) {
      query += ` AND (lm.title ILIKE $${paramIndex} OR lm.description ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT lm\.\*.*FROM/,
      'SELECT COUNT(DISTINCT lm.id) FROM'
    );
    const totalResult = await dbQuery(countQuery, params);
    const total = parseInt(totalResult[0].count);

    // Add ordering and pagination
    query += ` ORDER BY lm.featured DESC, lm.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const courses = await dbQuery(query, params);

    // Get course categories for filtering
    const categories = await dbQuery(
      'SELECT * FROM course_categories WHERE parent_id IS NULL ORDER BY sort_order'
    );

    return createSecureResponse({
      success: true,
      courses,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get courses error:', error);
    return createSecureResponse(
      { error: 'Failed to fetch courses', details: error.message },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['POST']
  }));

  if (securityResult) return securityResult;

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Check if user is an approved instructor
    const instructor = await dbQuery(
      'SELECT * FROM instructor_profiles WHERE user_id = $1',
      [user.id]
    );

    if (!instructor.length) {
      return createSecureResponse(
        { error: 'Only approved instructors can create courses' },
        403
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      difficultyLevel,
      estimatedDuration,
      price,
      isFree,
      prerequisites,
      learningObjectives,
      tags,
      instructorNotes
    } = body;

    // Validate required fields
    if (!title || !description || !category || !difficultyLevel) {
      return createSecureResponse(
        { error: 'Missing required fields' },
        400
      );
    }

    // Validate difficulty level
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficultyLevel)) {
      return createSecureResponse(
        { error: 'Invalid difficulty level' },
        400
      );
    }

    // Validate pricing
    if (!isFree && (!price || price <= 0)) {
      return createSecureResponse(
        { error: 'Price is required for paid courses' },
        400
      );
    }

    // Create course
    const result = await learningManager.createCourse(parseInt(user.id), {
      title,
      description,
      category,
      difficultyLevel,
      estimatedDuration: parseInt(estimatedDuration) || 60,
      price: isFree ? 0 : parseFloat(price),
      isFree: Boolean(isFree),
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      tags: tags || [],
      instructorNotes
    });

    if (!result.success) {
      return createSecureResponse(
        { error: result.error },
        400
      );
    }

    return createSecureResponse({
      success: true,
      courseId: result.courseId,
      message: 'Course created successfully and submitted for review'
    }, 201);

  } catch (error: any) {
    console.error('Create course error:', error);
    return createSecureResponse(
      { error: 'Failed to create course', details: error.message },
      500
    );
  }
}