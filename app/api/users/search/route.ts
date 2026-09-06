import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawQ = (searchParams.get('q') || '').trim();
    const q = rawQ.startsWith('@') ? rawQ.slice(1).trim() : rawQ;

    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const supabase = await createClient();

    let { data, error } = await supabase
      .from('users')
      .select('id, name, user_name, profile_img')
      .or(`name.ilike.%${q}%,user_name.ilike.%${q}%`)
      .neq('id', session.userId) // exclude self
      .limit(8);

    if (error) {
      // Fallback query if user_name column is not present
      const fb = await supabase
        .from('users')
        .select('id, name, profile_img')
        .ilike('name', `%${q}%`)
        .neq('id', session.userId)
        .limit(8);
      data = fb.data as any;
      error = fb.error;
    }

    if (error) {
      return NextResponse.json({ users: [] });
    }

    const users = (data || []).map((u: { id: string; name: string; user_name?: string | null; username?: string | null; profile_img: string | null }) => ({
      id: u.id,
      name: u.name,
      username: u.user_name || u.username || u.name.toLowerCase().replace(/\s+/g, '_'),
      avatar: u.profile_img || '',
    }));

    return NextResponse.json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
