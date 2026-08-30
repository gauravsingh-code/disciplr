import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

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

    const supabase = await createClient();

    // 1. Check if user already liked this post
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.userId)
      .maybeSingle();

    let hasLiked = false;

    if (existingLike) {
      // Unlike: delete row
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.userId);

      hasLiked = false;
    } else {
      // Like: insert row
      await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: session.userId,
      });

      hasLiked = true;
    }

    // 2. Count total likes for this post
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    const totalLikes = count || 0;

    // Update likes_count column on posts table
    await supabase
      .from('posts')
      .update({ likes_count: totalLikes })
      .eq('id', postId);

    return NextResponse.json({
      success: true,
      hasLiked,
      likesCount: totalLikes,
    });
  } catch (error: any) {
    console.error('Post Like error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to toggle post like' },
      { status: 500 }
    );
  }
}
