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
    const { logId, emoji } = body;

    if (!logId || !emoji) {
      return NextResponse.json({ error: 'logId and emoji are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check existing reaction
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('log_id', logId)
      .eq('user_id', session.userId)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id);
      return NextResponse.json({ action: 'removed', emoji });
    } else {
      const { data: created } = await supabase
        .from('reactions')
        .insert({
          log_id: logId,
          user_id: session.userId,
          emoji,
        })
        .select()
        .single();

      return NextResponse.json({ action: 'added', reaction: created });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process reaction' },
      { status: 500 }
    );
  }
}
