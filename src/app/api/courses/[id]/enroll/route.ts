import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/auth-helpers';
import { learningManager } from '@/lib/managers/learning-manager';
import { createSecureResponse } from '@/lib/security/security-headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user is authenticated
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return createSecureResponse({ error: 'Invalid course ID' }, 400);
    }

    const body = await request.json();
    const { paymentMethod, discountCode, enrollmentType } = body;

    // Enroll in course
    const result = await learningManager.enrollInCourse({
      userId: parseInt(user.id),
      moduleId: courseId,
      paymentMethod,
      discountCode,
      enrollmentType: enrollmentType || 'individual'
    });

    if (!result.success) {
      return createSecureResponse(
        { error: result.error },
        400
      );
    }

    return createSecureResponse({
      success: true,
      enrollmentId: result.enrollmentId,
      message: 'Successfully enrolled in course'
    });

  } catch (error: any) {
    console.error('Course enrollment error:', error);
    return createSecureResponse(
      { error: 'Failed to enroll in course', details: error.message },
      500
    );
  }
}