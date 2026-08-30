import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'community'; // 'pod' | 'community'
    const podId = searchParams.get('podId');

    const supabase = await createClient();

    let query = supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        media_url,
        pod_id,
        is_pod_only,
        likes_count,
        reposts_count,
        created_at,
        users:user_id(id, name, avatar_url),
        pods:pod_id(id, name, emoji)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (scope === 'pod' && podId) {
      query = query.eq('pod_id', podId);
    } else if (scope === 'community') {
      query = query.eq('is_pod_only', false);
    }

    const { data: rawPosts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ posts: [] });
    }

    const postIds = (rawPosts || []).map((p: any) => p.id);

    // Fetch user's liked posts in one query
    let userLikedPostIds = new Set<string>();
    let replyCountsMap: Record<string, number> = {};

    if (session && postIds.length > 0) {
      try {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', session.userId)
          .in('post_id', postIds);

        (likes || []).forEach((l: any) => userLikedPostIds.add(l.post_id));
      } catch {}
    }

    // Fetch reply counts
    if (postIds.length > 0) {
      try {
        const { data: replies } = await supabase
          .from('post_replies')
          .select('post_id');

        (replies || []).forEach((r: any) => {
          replyCountsMap[r.post_id] = (replyCountsMap[r.post_id] || 0) + 1;
        });
      } catch {}
    }

    const formattedPosts = (rawPosts || []).map((p: any) => {
      const author = Array.isArray(p.users) ? p.users[0] : p.users;
      const pod = Array.isArray(p.pods) ? p.pods[0] : p.pods;
      const authorName = author?.name || 'Community Member';

      return {
        id: p.id,
        userId: p.user_id,
        userName: authorName,
        userUsername: authorName.toLowerCase().replace(/\s+/g, '_'),
        userAvatar:
          author?.avatar_url ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        content: p.content,
        mediaUrl: p.media_url || undefined,
        podId: p.pod_id || undefined,
        podName: pod?.name || undefined,
        isPodOnly: !!p.is_pod_only,
        likesCount: Number(p.likes_count) || 0,
        hasLiked: userLikedPostIds.has(p.id),
        repliesCount: replyCountsMap[p.id] || 0,
        repostsCount: Number(p.reposts_count) || 0,
        hasReposted: false,
        createdAt: p.created_at,
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('Posts API GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, mediaUrl, podId, isPodOnly } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Post content cannot be empty' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim().slice(0, 500);

    const supabase = await createClient();

    // 1. Fetch current user info
    const { data: user } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .eq('id', session.userId)
      .maybeSingle();

    // 2. Insert Post
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: session.userId,
        content: trimmedContent,
        media_url: mediaUrl || null,
        pod_id: podId || null,
        is_pod_only: !!isPodOnly,
        likes_count: 0,
        reposts_count: 0,
      })
      .select()
      .single();

    if (insertError || !newPost) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to publish post' },
        { status: 500 }
      );
    }

    // 3. Fetch optional pod name
    let podName: string | undefined = undefined;
    if (podId) {
      const { data: pod } = await supabase
        .from('pods')
        .select('name')
        .eq('id', podId)
        .maybeSingle();
      podName = pod?.name;
    }

    const authorName = user?.name || session.name || 'Member';

    const formattedPost = {
      id: newPost.id,
      userId: newPost.user_id,
      userName: authorName,
      userUsername: authorName.toLowerCase().replace(/\s+/g, '_'),
      userAvatar:
        user?.avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      content: newPost.content,
      mediaUrl: newPost.media_url || undefined,
      podId: newPost.pod_id || undefined,
      podName,
      isPodOnly: newPost.is_pod_only,
      likesCount: 0,
      hasLiked: false,
      repliesCount: 0,
      repostsCount: 0,
      hasReposted: false,
      createdAt: newPost.created_at,
    };

    return NextResponse.json({ post: formattedPost }, { status: 201 });
  } catch (error: any) {
    console.error('Posts API POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal error creating post' },
      { status: 500 }
    );
  }
}
