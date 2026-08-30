import { NextResponse } from 'next/server'
import { getSessionUser } from '@/utils/auth'
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
      .select('id, name, email, description, is_active, created_at, updated_at')
      .eq('id', session.userId)
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch session user.' },
      { status: 500 }
    )
  }
}
