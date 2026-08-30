import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: rawReplies, error } = await supabase
      .from('post_replies')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        users:user_id(id, name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return NextResponse.json({ replies: [] });
    }

    const replies = (rawReplies || []).map((r: any) => {
      const author = Array.isArray(r.users) ? r.users[0] : r.users;
      const authorName = author?.name || 'Community Member';

      return {
        id: r.id,
        postId: r.post_id,
        userId: r.user_id,
        userName: authorName,
        userUsername: authorName.toLowerCase().replace(/\s+/g, '_'),
        userAvatar:
          author?.avatar_url ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        content: r.content,
        createdAt: r.created_at,
      };
    });

    return NextResponse.json({ replies });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = await params;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Reply content cannot be empty' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim().slice(0, 280);

    const supabase = await createClient();

    // 1. Fetch user info
    const { data: user } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .eq('id', session.userId)
      .maybeSingle();

    // 2. Insert Reply
    const { data: newReply, error: insertError } = await supabase
      .from('post_replies')
      .insert({
        post_id: postId,
        user_id: session.userId,
        content: trimmedContent,
      })
      .select()
      .single();

    if (insertError || !newReply) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to post reply' },
        { status: 500 }
      );
    }

    const authorName = user?.name || session.name || 'Member';

    const formattedReply = {
      id: newReply.id,
      postId: newReply.post_id,
      userId: newReply.user_id,
      userName: authorName,
      userUsername: authorName.toLowerCase().replace(/\s+/g, '_'),
      userAvatar:
        user?.avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      content: newReply.content,
      createdAt: newReply.created_at,
    };

    return NextResponse.json({ reply: formattedReply }, { status: 201 });
  } catch (error: any) {
    console.error('Post Reply error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit reply' },
      { status: 500 }
    );
  }
}
