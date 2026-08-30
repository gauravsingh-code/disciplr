import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { logId, content } = body;

    if (!logId || !content?.trim()) {
      return NextResponse.json({ error: 'logId and content are required' }, { status: 400 });
    }

    const cappedContent = content.trim().slice(0, 200);
    const supabase = await createClient();

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        log_id: logId,
        user_id: session.userId,
        content: cappedContent,
      })
      .select(`
        id,
        content,
        user_id,
        created_at,
        user:users(id, name, avatar_url)
      `)
      .single();

    if (error || !comment) {
      return NextResponse.json({ error: error?.message || 'Failed to post comment' }, { status: 500 });
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        userId: comment.user_id,
        userName: (comment as any).user?.name || session.name,
        userAvatar: (comment as any).user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        createdAt: 'Just now',
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal comment error' },
      { status: 500 }
    );
  }
}
