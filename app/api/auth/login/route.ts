import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { comparePassword, createSessionToken, setSessionCookie } from '@/utils/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identifier, email, name, password } = body

    const loginIdentifier = (identifier || email || name || '').trim()

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email/Name and password are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find user by email or name
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, name, email, encrypted_password, description, is_active')
      .or(`email.eq.${loginIdentifier.toLowerCase()},name.eq.${loginIdentifier}`)
      .maybeSingle()

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Invalid email/name or password.' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated.' },
        { status: 403 }
      )
    }

    // Verify password match
    const isPasswordValid = await comparePassword(password, user.encrypted_password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email/name or password.' },
        { status: 401 }
      )
    }

    // Create session token and set HTTP-only cookie
    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
    })
    await setSessionCookie(token)

    const { encrypted_password, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: 'Logged in successfully',
        user: userWithoutPassword,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}
