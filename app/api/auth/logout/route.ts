import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/utils/auth'

export async function GET(request: Request) {
  const url = new URL('/login?logout=true', request.url)
  const response = NextResponse.redirect(url)
  response.cookies.delete(AUTH_COOKIE_NAME)
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
    response.cookies.delete(AUTH_COOKIE_NAME)
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Logout failed.' },
      { status: 500 }
    )
  }
}
