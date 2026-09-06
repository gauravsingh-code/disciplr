import { NextResponse } from 'next/server'
import { getSessionUser, clearSessionCookie } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const session = await getSessionUser()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .maybeSingle()

    if (error || !user || !user.is_active) {
      // User no longer exists in DB or deactivated: revoke cookie immediately
      const response = NextResponse.json({ error: 'User session expired or deleted.' }, { status: 401 })
      response.cookies.delete('auth_token')
      response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      })
      return response
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch session user.' },
      { status: 500 }
    )
  }
}
