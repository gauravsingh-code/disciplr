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

    // Find user by email, username, or name
    let user: any = null
    let findError: any = null

    const lookupRes = await supabase
      .from('users')
      .select('id, name, user_name, email, encrypted_password, description, is_active')
      .or(`email.eq.${loginIdentifier.toLowerCase()},name.eq.${loginIdentifier},user_name.eq.${loginIdentifier.toLowerCase()}`)
      .maybeSingle()

    if (lookupRes.error) {
      // Fallback if user_name column does not exist yet
      const fallbackRes = await supabase
        .from('users')
        .select('id, name, email, encrypted_password, description, is_active')
        .or(`email.eq.${loginIdentifier.toLowerCase()},name.eq.${loginIdentifier}`)
        .maybeSingle()
      user = fallbackRes.data
      findError = fallbackRes.error
    } else {
      user = lookupRes.data
      findError = lookupRes.error
    }

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Invalid email, username, or password.' },
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
        { error: 'Invalid email, username, or password.' },
        { status: 401 }
      )
    }

    const finalUsername = user.user_name || user.username || user.name.toLowerCase().replace(/\s+/g, '_')

    // Create session token and set HTTP-only cookie
    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      username: finalUsername,
    })
    await setSessionCookie(token)

    const { encrypted_password, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: 'Logged in successfully',
        user: {
          ...userWithoutPassword,
          username: finalUsername,
        },
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
