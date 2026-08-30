import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/utils/auth'

export async function POST() {
  try {
    await clearSessionCookie()
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Logout failed.' },
      { status: 500 }
    )
  }
}
