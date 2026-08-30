import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: memberships } = await supabase
      .from('pod_memberships')
      .select(`
        role,
        joined_at,
        pod:pods(
          id,
          name,
          description,
          emoji,
          invite_code,
          creator_id,
          max_members,
          created_at,
          pod_memberships(
            user_id,
            role,
            joined_at,
            user:users(id, name, avatar_url)
          )
        )
      `)
      .eq('user_id', session.userId);

    const pods = (memberships || [])
      .map((m: any) => m.pod)
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        emoji: p.emoji,
        inviteCode: p.invite_code,
        creatorId: p.creator_id,
        maxMembers: p.max_members,
        createdAt: p.created_at,
        members: (p.pod_memberships || []).map((pm: any) => ({
          userId: pm.user_id,
          name: pm.user?.name || 'Member',
          username: pm.user?.name ? pm.user.name.toLowerCase().replace(/\s+/g, '_') : 'member',
          avatar: pm.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          joinedAt: pm.joined_at,
          role: pm.role,
          checkedInToday: false,
          currentStreak: 5,
        })),
      }));

    return NextResponse.json({ pods });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch pods' },
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
    const { name, description, emoji } = body;

    if (!name) {
      return NextResponse.json({ error: 'Pod name is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const inviteCode = `EMBER-${Math.random().toString(36).substring(2, 6).toUpperCase()}-08`;

    // 1. Create Pod
    const { data: newPod, error: podError } = await supabase
      .from('pods')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        emoji: emoji || '🌅',
        invite_code: inviteCode,
        creator_id: session.userId,
        max_members: 8,
      })
      .select()
      .single();

    if (podError || !newPod) {
      return NextResponse.json(
        { error: podError?.message || 'Failed to create pod' },
        { status: 500 }
      );
    }

    // 2. Add creator membership
    await supabase.from('pod_memberships').insert({
      pod_id: newPod.id,
      user_id: session.userId,
      role: 'creator',
    });

    return NextResponse.json(
      {
        pod: {
          id: newPod.id,
          name: newPod.name,
          description: newPod.description,
          emoji: newPod.emoji,
          inviteCode: newPod.invite_code,
          creatorId: newPod.creator_id,
          maxMembers: 8,
          createdAt: newPod.created_at,
          members: [
            {
              userId: session.userId,
              name: session.name,
              username: session.name.toLowerCase().replace(/\s+/g, '_'),
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              joinedAt: new Date().toISOString(),
              role: 'creator',
              checkedInToday: false,
              currentStreak: 1,
            },
          ],
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal error creating pod' },
      { status: 500 }
    );
  }
}
