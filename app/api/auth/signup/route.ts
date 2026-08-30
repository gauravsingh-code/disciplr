import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { hashPassword, createSessionToken, setSessionCookie } from '@/utils/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, description } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = name.trim()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, name, email')
      .or(`email.eq.${cleanEmail},name.eq.${cleanName}`)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email or name already exists.' },
        { status: 409 }
      )
    }

    // Hash password
    const encrypted_password = await hashPassword(password)

    // Insert user into custom users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: cleanName,
        email: cleanEmail,
        encrypted_password,
        description: description || null,
        is_active: true,
      })
      .select('id, name, email, description, is_active, created_at')
      .single()

    if (insertError || !newUser) {
      console.error('Signup DB error:', insertError)
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create user record.' },
        { status: 500 }
      )
    }

    // Create session token and set HTTP-only cookie
    const token = await createSessionToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    })
    await setSessionCookie(token)

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: newUser,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}
