import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentId, transactionId, paymentMethod } = body;

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    // Update enrollment payment status
    const updated = await dbQuery(
      `UPDATE course_enrollments 
       SET payment_status = $1, 
           payment_transaction_id = $2,
           payment_method = $3,
           payment_completed_at = datetime('now')
       WHERE id = $4
       RETURNING *`,
      ['paid', transactionId, paymentMethod, enrollmentId]
    );

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const enrollment = updated[0];

    // Create transaction record
    await dbQuery(
      `INSERT INTO transactions (user_id, type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        enrollment.user_id,
        'Payment',
        enrollment.amount_paid,
        `Course enrollment payment for module ${enrollment.module_id}`,
        'Completed'
      ]
    );

    // Get module details for revenue tracking
    const modules = await dbQuery(
      'SELECT * FROM learning_modules WHERE id = $1',
      [enrollment.module_id]
    );

    if (modules && modules.length > 0) {
      const module = modules[0];
      const educatorId = module.educator_id;
      const coursePrice = parseFloat(enrollment.amount_paid);
      
      // Platform takes 15% commission on courses
      const platformCommission = coursePrice * 0.15;
      const educatorEarning = coursePrice - platformCommission;

      // Record platform revenue
      await dbQuery(
        `INSERT INTO platform_revenue (revenue_type, amount, percentage, description)
         VALUES ($1, $2, $3, $4)`,
        [
          'service_fee',
          platformCommission,
          15,
          `Course enrollment commission for module ${enrollment.module_id}`
        ]
      );

      // Credit educator wallet if educator exists
      if (educatorId) {
        await dbQuery(
          'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
          [educatorEarning, educatorId]
        );

        // Create earning transaction for educator
        await dbQuery(
          `INSERT INTO transactions (user_id, type, amount, description, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            educatorId,
            'Earning',
            educatorEarning,
            `Course enrollment earning for module ${enrollment.module_id}`,
            'Completed'
          ]
        );
      }
    }

    return NextResponse.json({
      message: 'Payment confirmed successfully',
      enrollment: updated[0]
    });

  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment', details: error.message },
      { status: 500 }
    );
  }
}
