'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  hashPassword,
  comparePassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from '@/utils/auth'

export type AuthState = {
  error?: string
  success?: string
}

export async function login(prevState: AuthState | void, formData: FormData): Promise<AuthState> {
  const identifier = ((formData.get('identifier') || formData.get('email') || formData.get('name')) as string)?.trim()
  const password = formData.get('password') as string

  if (!identifier || !password) {
    return { error: 'Email/Name and password are required.' }
  }

  const supabase = await createClient()

  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id, name, email, encrypted_password, is_active')
    .or(`email.eq.${identifier.toLowerCase()},name.eq.${identifier}`)
    .maybeSingle()

  if (findError || !user) {
    return { error: 'Invalid email/name or password.' }
  }

  if (!user.is_active) {
    return { error: 'Account is deactivated.' }
  }

  const isPasswordValid = await comparePassword(password, user.encrypted_password)

  if (!isPasswordValid) {
    return { error: 'Invalid email/name or password.' }
  }

  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
  })
  await setSessionCookie(token)

  revalidatePath('/', 'layout')
  redirect('/today')
}

export async function signup(prevState: AuthState | void, formData: FormData): Promise<AuthState> {
  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  const password = formData.get('password') as string
  const name = ((formData.get('name') || formData.get('username')) as string || '').trim()

  if (!email || !password || !name) {
    return { error: 'Email, password, and name are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  const supabase = await createClient()

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, name, email')
    .or(`email.eq.${email},name.eq.${name}`)
    .maybeSingle()

  if (existingUser) {
    return { error: 'An account with this email or name already exists.' }
  }

  const encrypted_password = await hashPassword(password)

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      name,
      email,
      encrypted_password,
      is_active: true,
    })
    .select('id, name, email')
    .single()

  if (insertError || !newUser) {
    return { error: insertError?.message || 'Failed to create user account.' }
  }

  const token = await createSessionToken({
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
  })
  await setSessionCookie(token)

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function logout() {
  await clearSessionCookie()
  revalidatePath('/', 'layout')
  redirect('/login')
}
