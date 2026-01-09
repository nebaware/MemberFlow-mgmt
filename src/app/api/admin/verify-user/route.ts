import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, status, note } = body;

    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update user verification status
    const verified = status === 'verified' ? 1 : 0;
    
    await dbQuery(
      `UPDATE users 
       SET verified = $1, verification_status = $2, updated_at = datetime('now')
       WHERE id = $3`,
      [verified, status, userId]
    );

    // Get user details for notification
    const userRows = await dbQuery(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [userId]
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      
      // Create notification for user
      const notificationTitle = status === 'verified' 
        ? 'Account Verified!' 
        : 'Verification Rejected';
      
      const notificationMessage = status === 'verified'
        ? 'Your account has been verified. You now have full access to all features.'
        : `Your verification was rejected. ${note || 'Please contact support for more information.'}`;

      await dbQuery(
        `INSERT INTO notifications (user_id, type, title, message, icon_name)
         VALUES ($1, 'SystemMessage', $2, $3, 'Shield')`,
        [userId, notificationTitle, notificationMessage]
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${status} successfully` 
    });
  } catch (err: any) {
    console.error('Verification error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
