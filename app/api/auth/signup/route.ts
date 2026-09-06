import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { hashPassword, createSessionToken, setSessionCookie } from '@/utils/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, username, email, password, description, profile_img, avatar_url } = body
    const finalProfileImg = profile_img || avatar_url || null

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
    const rawUsername = (username || cleanName.toLowerCase().replace(/[^a-z0-9_]/g, '')).trim().toLowerCase()
    const cleanUsername = rawUsername.replace(/\s+/g, '_').slice(0, 30)

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long.' },
        { status: 400 }
      )
    }

    // Check if user already exists (try checking with user_name; fall back if column is missing)
    let existingUser: any = null
    const checkRes = await supabase
      .from('users')
      .select('id, name, email, user_name')
      .or(`email.eq.${cleanEmail},name.eq.${cleanName},user_name.eq.${cleanUsername}`)
      .maybeSingle()

    if (checkRes.error) {
      // Fallback query if user_name column is not present yet
      const fallbackCheck = await supabase
        .from('users')
        .select('id, name, email')
        .or(`email.eq.${cleanEmail},name.eq.${cleanName}`)
        .maybeSingle()
      existingUser = fallbackCheck.data
    } else {
      existingUser = checkRes.data
    }

    if (existingUser) {
      let conflictField = 'email, name, or username'
      const matchedUsername = existingUser.user_name || existingUser.username
      if (existingUser.email?.toLowerCase() === cleanEmail) conflictField = 'email'
      else if (matchedUsername?.toLowerCase() === cleanUsername) conflictField = 'username'
      else if (existingUser.name?.toLowerCase() === cleanName.toLowerCase()) conflictField = 'name'

      return NextResponse.json(
        { error: `A user with this ${conflictField} already exists.` },
        { status: 409 }
      )
    }

    // Hash password
    const encrypted_password = await hashPassword(password)

    // Prepare insert payload using user_name
    const userPayload: Record<string, any> = {
      name: cleanName,
      user_name: cleanUsername,
      email: cleanEmail,
      encrypted_password,
      description: description || null,
      is_active: true,
    }

    if (finalProfileImg) {
      userPayload.profile_img = finalProfileImg
      userPayload.avatar_url = finalProfileImg
    }

    // Insert user into custom users table
    let insertResult = await supabase
      .from('users')
      .insert(userPayload)
      .select('id, name, user_name, email, avatar_url, profile_img, description, is_active, created_at')
      .single()

    // Fallback logic if a column (user_name, profile_img vs avatar_url) is not yet migrated in PostgreSQL
    if (insertResult.error) {
      console.warn('Signup insert with full payload failed, trying fallbacks:', insertResult.error.message)
      
      const payloadProfileImgOnly: Record<string, any> = {
        name: cleanName,
        user_name: cleanUsername,
        email: cleanEmail,
        encrypted_password,
        description: description || null,
        is_active: true,
        ...(finalProfileImg ? { profile_img: finalProfileImg } : {}),
      }

      insertResult = await supabase
        .from('users')
        .insert(payloadProfileImgOnly)
        .select()
        .single()

      if (insertResult.error) {
        console.warn('Signup insert with user_name failed, retrying without user_name:', insertResult.error.message)
        const basePayload: Record<string, any> = {
          name: cleanName,
          email: cleanEmail,
          encrypted_password,
          description: description || null,
          is_active: true,
        }
        if (finalProfileImg) {
          basePayload.profile_img = finalProfileImg
        }
        insertResult = await supabase
          .from('users')
          .insert(basePayload)
          .select()
          .single()
      }
    }

    const newUser = insertResult.data
    const insertError = insertResult.error

    if (insertError || !newUser) {
      console.error('Signup DB error:', insertError)
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create user record.' },
        { status: 500 }
      )
    }

    const finalUsername = (newUser as any).user_name || (newUser as any).username || cleanUsername

    // Create session token and set HTTP-only cookie
    const token = await createSessionToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: finalUsername,
    })
    await setSessionCookie(token)

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          ...newUser,
          username: finalUsername,
        },
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
