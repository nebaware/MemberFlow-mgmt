
import { NextRequest, NextResponse } from 'next/server';
import { learningManager } from '@/lib/managers/learning-manager';
import { securityMiddleware, withAuth } from '@/lib/security/security-middleware';
import { createSecureResponse } from '@/lib/security/security-headers';
import { dbQuery } from '@/lib/db/db'; // Added
import { getAuthUser } from '@/lib/auth/auth-helpers'; // Added
import { ai } from '@/ai/genkit'; // Added

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    allowedMethods: ['GET']
  }));

  if (securityResult) return securityResult;

  try {
    // Verify authentication
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const { id } = await params;
    // Placeholder for GET logic, as the instruction only provided auth part
    return createSecureResponse({ message: `GET request for ID: ${id} by user: ${user.id} ` }, 200);

  } catch (error: any) {
    console.error('GET request error:', error);
    return createSecureResponse(
      { error: 'Failed to process GET request', details: error.message },
      500
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply security middleware with AI rate limiting
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'ai',
    allowedMethods: ['POST']
  }));

  if (securityResult) return securityResult;

  try {
    // Verify authentication
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return createSecureResponse({ error: 'Invalid course ID' }, 400);
    }

    const body = await request.json();
    const { question, lessonId, sessionType, language } = body;

    if (!question || question.trim().length === 0) {
      return createSecureResponse(
        { error: 'Question is required' },
        400
      );
    }

    if (question.length > 1000) {
      return createSecureResponse(
        { error: 'Question is too long (max 1000 characters)' },
        400
      );
    }

    // Check if user is enrolled in the course
    const enrollment = await learningManager.checkEnrollment(parseInt(user.id), courseId);
    if (!enrollment) {
      return createSecureResponse(
        { error: 'You must be enrolled in this course to use AI tutoring' },
        403
      );
    }

    // Get AI tutoring response
    const result = await learningManager.getAITutoring(
      parseInt(user.id),
      courseId,
      lessonId ? parseInt(lessonId) : null,
      question.trim(),
      sessionType || 'help',
      language || 'en'
    );

    if (!result.success) {
      return createSecureResponse(
        { error: result.error },
        500
      );
    }

    return createSecureResponse({
      success: true,
      response: result.response,
      sessionId: result.sessionId,
      message: 'AI tutoring response generated successfully'
    });

  } catch (error: any) {
    console.error('AI tutoring error:', error);
    return createSecureResponse(
      { error: 'Failed to get AI tutoring response', details: error.message },
      500
    );
  }
}

// Rate AI tutoring session feedback
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['PATCH']
  }));

  if (securityResult) return securityResult;

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { sessionId, satisfactionRating, wasHelpful, followUpNeeded } = body;

    if (!sessionId) {
      return createSecureResponse(
        { error: 'Session ID is required' },
        400
      );
    }

    if (satisfactionRating && (satisfactionRating < 1 || satisfactionRating > 5)) {
      return createSecureResponse(
        { error: 'Satisfaction rating must be between 1 and 5' },
        400
      );
    }

    // Update AI tutoring session with feedback
    await dbQuery(
      `UPDATE ai_tutoring_sessions SET
        satisfaction_rating = $1,
        was_helpful = $2,
        follow_up_needed = $3
       WHERE id = $4 AND user_id = $5`,
      [
        satisfactionRating || null,
        wasHelpful !== undefined ? wasHelpful : null,
        followUpNeeded !== undefined ? followUpNeeded : null,
        parseInt(sessionId),
        user.id
      ]
    );

    return createSecureResponse({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error: any) {
    console.error('AI tutoring feedback error:', error);
    return createSecureResponse(
      { error: 'Failed to submit feedback', details: error.message },
      500
    );
  }
}