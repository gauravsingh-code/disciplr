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
    const podId = searchParams.get('podId');

    const supabase = await createClient();

    // Query habit logs
    let query = supabase
      .from('habit_logs')
      .select(`
        id,
        habit_id,
        user_id,
        status,
        proof_image_url,
        note,
        logged_date,
        user_timezone,
        created_at,
        habit:habits(title, emoji, is_private),
        user:users(id, name, avatar_url),
        reactions(
          id,
          emoji,
          user_id,
          created_at,
          user:users(id, name, avatar_url)
        ),
        comments(
          id,
          content,
          user_id,
          created_at,
          user:users(id, name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedFeed = (logs || []).map((l: any) => ({
      id: l.id,
      habitId: l.habit_id,
      habitTitle: l.habit?.title || 'Habit Check-In',
      habitEmoji: l.habit?.emoji || '⚡',
      userId: l.user_id,
      userName: l.user?.name || 'Pod Member',
      userAvatar: l.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      loggedDate: l.logged_date,
      userTimezone: l.user_timezone,
      status: l.status,
      proofImageUrl: l.proof_image_url,
      note: l.note,
      reactions: (l.reactions || []).map((r: any) => ({
        id: r.id,
        emoji: r.emoji,
        userId: r.user_id,
        userName: r.user?.name || 'Member',
        userAvatar: r.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
      comments: (l.comments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        userId: c.user_id,
        userName: c.user?.name || 'Member',
        userAvatar: c.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
      createdAt: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    return NextResponse.json({ feed: formattedFeed });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch pod feed' },
      { status: 500 }
    );
  }
}
