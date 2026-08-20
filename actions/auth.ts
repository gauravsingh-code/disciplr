'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type AuthState = {
  error?: string
  success?: string
}

export async function login(prevState: AuthState | void, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: AuthState | void, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  if (!email || !password || !username) {
    return { error: 'Email, password, and username are required.' }
  }

  // Username validation (alphanumeric, underscores, hyphens, min 3 chars)
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  if (!usernameRegex.test(username)) {
    return { error: 'Username must be 3-20 characters long and contain only letters, numbers, underscores, or hyphens.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If Supabase is configured with email confirmation
  if (data?.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'An account with this email already exists.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
