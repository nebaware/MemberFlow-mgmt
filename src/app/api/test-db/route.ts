import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/auth-helpers';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);

        // Only admins can test database connection
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const result = await dbQuery('SELECT NOW()');
        return NextResponse.json({ success: true, time: result[0] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
