import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Sprint reviews are no longer supported. Use Submit Done on the board.' }, { status: 410 })
}
