import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, moduleId, paymentMethod } = body;

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'User ID and Module ID are required' },
        { status: 400 }
      );
    }

    // Get module details
    const modules = await dbQuery(
      'SELECT * FROM learning_modules WHERE id = $1',
      [moduleId]
    );

    if (!modules || modules.length === 0) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    const module = modules[0];
    const price = parseFloat(module.price) || 0;

    // Check if already enrolled
    const existingEnrollment = await dbQuery(
      'SELECT * FROM course_enrollments WHERE user_id = $1 AND module_id = $2',
      [userId, moduleId]
    );

    if (existingEnrollment && existingEnrollment.length > 0) {
      const enrollment = existingEnrollment[0];
      return NextResponse.json({
        message: 'Already enrolled',
        enrollment,
        alreadyEnrolled: true
      });
    }

    // If course is free, enroll directly
    if (price === 0) {
      const enrollment = await dbQuery(
        `INSERT INTO course_enrollments (user_id, module_id, payment_status, amount_paid, payment_completed_at)
         VALUES ($1, $2, $3, $4, datetime('now'))
         RETURNING *`,
        [userId, moduleId, 'paid', 0]
      );

      return NextResponse.json({
        message: 'Enrolled successfully in free course',
        enrollment: enrollment[0],
        requiresPayment: false
      });
    }

    // For paid courses, create pending enrollment
    const enrollment = await dbQuery(
      `INSERT INTO course_enrollments (user_id, module_id, payment_status, payment_method, amount_paid)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, moduleId, 'pending', paymentMethod || 'pending', price]
    );

    return NextResponse.json({
      message: 'Enrollment created, payment required',
      enrollment: enrollment[0],
      requiresPayment: true,
      amount: price
    });

  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll', details: error.message },
      { status: 500 }
    );
  }
}

// Check enrollment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'User ID and Module ID are required' },
        { status: 400 }
      );
    }

    const enrollment = await dbQuery(
      'SELECT * FROM course_enrollments WHERE user_id = $1 AND module_id = $2',
      [userId, moduleId]
    );

    if (!enrollment || enrollment.length === 0) {
      return NextResponse.json({
        enrolled: false,
        paymentStatus: null
      });
    }

    return NextResponse.json({
      enrolled: true,
      paymentStatus: enrollment[0].payment_status,
      enrollment: enrollment[0]
    });

  } catch (error: any) {
    console.error('Check enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollment', details: error.message },
      { status: 500 }
    );
  }
}
