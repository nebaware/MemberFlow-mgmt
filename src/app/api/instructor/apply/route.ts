import { NextRequest, NextResponse } from 'next/server';

import { dbQuery } from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/auth-helpers';
import { createSecureResponse } from '@/lib/security/security-headers';
import { securityMiddleware, withAuth } from '@/lib/security/security-middleware';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getAuthUser(request);

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to apply' },
        { status: 401 }
      );
    }

    // Check if user is verified
    const verificationDetails = await dbQuery('SELECT verification_level FROM users WHERE id = $1', [user.id]);
    const verificationLevel = verificationDetails.length > 0 ? verificationDetails[0].verification_level : 'unverified';

    if (verificationLevel !== 'verified') {
      return NextResponse.json(
        { error: 'Account verification required to apply as instructor' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      bio,
      expertiseAreas,
      experienceYears,
      educationBackground,
      certifications,
      portfolioUrl,
      sampleContentUrl,
      motivation,
      teachingPhilosophy
    } = body;

    // Validate required fields
    if (!bio || !expertiseAreas || !experienceYears || !educationBackground || !motivation) {
      return createSecureResponse(
        { error: 'Missing required fields' },
        400
      );
    }

    // Check if user already has an application
    const existingApplication = await dbQuery(
      'SELECT id, application_status FROM instructor_applications WHERE user_id = $1',
      [user.id]
    );

    if (existingApplication.length > 0) {
      const status = existingApplication[0].application_status;
      if (status === 'pending') {
        return NextResponse.json(
          { error: 'Application already submitted and pending review' },
          { status: 400 }
        );
      } else if (status === 'approved') {
        return NextResponse.json(
          { error: 'You are already an approved instructor' },
          { status: 400 }
        );
      }
      // If rejected or revision required, allow resubmission by updating existing record
    }

    // Create or update instructor application
    let applicationId;
    if (existingApplication.length > 0) {
      // Update existing application
      await dbQuery(
        `UPDATE instructor_applications SET
          bio = $1, expertise_areas = $2, experience_years = $3,
          education_background = $4, certifications = $5, portfolio_url = $6,
          sample_content_url = $7, motivation = $8, teaching_philosophy = $9,
          application_status = 'pending', applied_at = NOW(),
          reviewed_by = NULL, review_notes = NULL, reviewed_at = NULL
         WHERE user_id = $10`,
        [
          bio,
          JSON.stringify(expertiseAreas),
          parseInt(experienceYears),
          educationBackground,
          certifications,
          portfolioUrl,
          sampleContentUrl,
          motivation,
          teachingPhilosophy,
          user.id
        ]
      );
      applicationId = existingApplication[0].id;
    } else {
      // Create new application
      const result = await dbQuery(
        `INSERT INTO instructor_applications (
          user_id, bio, expertise_areas, experience_years,
          education_background, certifications, portfolio_url,
          sample_content_url, motivation, teaching_philosophy
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          user.id,
          bio,
          JSON.stringify(expertiseAreas),
          parseInt(experienceYears),
          educationBackground,
          certifications,
          portfolioUrl,
          sampleContentUrl,
          motivation,
          teachingPhilosophy
        ]
      );
      applicationId = result[0].id;
    }

    // Get user details for notification
    const userDetails = await dbQuery('SELECT name FROM users WHERE id = $1', [user.id]);
    const userName = userDetails.length > 0 ? userDetails[0].name : 'User';

    // Create notification for admins
    const admins = await dbQuery('SELECT id FROM users WHERE role = $1', ['admin']);
    for (const admin of admins) {
      await dbQuery(
        `INSERT INTO notifications (user_id, type, title, message, icon_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          admin.id,
          'instructor_application',
          'New Instructor Application',
          `${userName} has applied to become an instructor. Review required.`,
          'UserCheck'
        ]
      );
    }

    // Create notification for user
    await dbQuery(
      `INSERT INTO notifications (user_id, type, title, message, icon_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        'application_submitted',
        'Instructor Application Submitted',
        'Your instructor application has been submitted successfully. We will review it within 3-5 business days.',
        'Clock'
      ]
    );

    return createSecureResponse({
      success: true,
      applicationId,
      message: 'Instructor application submitted successfully'
    }, 201);

  } catch (error: any) {
    console.error('Instructor application error:', error);
    return createSecureResponse(
      { error: 'Failed to submit application', details: error.message },
      500
    );
  }
}

export async function GET(request: NextRequest) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['GET']
  }));

  if (securityResult) return securityResult;

  try {
    // Verify user is authenticated
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's instructor application status
    const application = await dbQuery(
      `SELECT ia.*, u.name as reviewer_name
       FROM instructor_applications ia
       LEFT JOIN users u ON ia.reviewed_by = u.id
       WHERE ia.user_id = $1`,
      [user.id]
    );

    // Check if user is already an approved instructor
    const instructorProfile = await dbQuery(
      'SELECT * FROM instructor_profiles WHERE user_id = $1',
      [user.id]
    );

    return createSecureResponse({
      success: true,
      application: application.length > 0 ? application[0] : null,
      isInstructor: instructorProfile.length > 0,
      instructorProfile: instructorProfile.length > 0 ? instructorProfile[0] : null
    });

  } catch (error: any) {
    console.error('Get instructor application error:', error);
    return createSecureResponse(
      { error: 'Failed to get application status', details: error.message },
      500
    );
  }
}