import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user wallet balance
    const users = await dbQuery(
      `SELECT 
        wallet_balance as balance,
        0 as "escrowBalance"
      FROM users
      WHERE id = $1`,
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallet = users[0];

    return NextResponse.json({
      balance: parseFloat(wallet.balance) || 0,
      escrowBalance: parseFloat(wallet.escrowBalance) || 0,
    });
  } catch (err: any) {
    console.error('Wallet GET error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
