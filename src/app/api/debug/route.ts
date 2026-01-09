import { NextResponse } from 'next/server'

export async function GET() {
  // Return DATABASE_URL server-side for debug (dev-only)
  try {
    const url = process.env.DATABASE_URL ?? null
    return NextResponse.json({ databaseUrl: url })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
