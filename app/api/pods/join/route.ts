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
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const cleanCode = inviteCode.trim().toUpperCase();

    // 1. Find Pod by code
    const { data: pod, error: findError } = await supabase
      .from('pods')
      .select('id, name, description, emoji, invite_code, creator_id, max_members')
      .or(`invite_code.eq.${cleanCode},id.eq.${cleanCode}`)
      .maybeSingle();

    if (findError || !pod) {
      return NextResponse.json({ error: 'Invalid invite code or Pod not found' }, { status: 404 });
    }

    // 2. Check existing membership
    const { data: existingMember } = await supabase
      .from('pod_memberships')
      .select('id')
      .eq('pod_id', pod.id)
      .eq('user_id', session.userId)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ message: 'Already a member of this Pod', pod });
    }

    // 3. Check 8-member cap
    const { count } = await supabase
      .from('pod_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('pod_id', pod.id);

    if (count !== null && count >= pod.max_members) {
      return NextResponse.json(
        { error: 'This Pod has reached its maximum size of 8 members.' },
        { status: 403 }
      );
    }

    // 4. Join Pod
    await supabase.from('pod_memberships').insert({
      pod_id: pod.id,
      user_id: session.userId,
      role: 'member',
    });

    return NextResponse.json({
      message: `Successfully joined ${pod.name}!`,
      pod,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to join pod' },
      { status: 500 }
    );
  }
}
