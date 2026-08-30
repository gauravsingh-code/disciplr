import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, emoji, frequency, reminderTime, isPrivate, sharedPodIds, isArchived } = body;

    const supabase = await createClient();

    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title.trim();
    if (emoji !== undefined) updates.emoji = emoji;
    if (frequency !== undefined) {
      updates.frequency_type = frequency.type;
      updates.frequency_days = frequency.daysOfWeek || [];
      updates.times_per_week = frequency.timesPerWeek || 7;
    }
    if (reminderTime !== undefined) updates.reminder_time = reminderTime;
    if (isPrivate !== undefined) updates.is_private = isPrivate;
    if (isArchived !== undefined) updates.is_archived = isArchived;

    const { data: updatedHabit, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.userId)
      .select()
      .single();

    if (error || !updatedHabit) {
      return NextResponse.json({ error: error?.message || 'Habit not found' }, { status: 404 });
    }

    // Update pod links if provided
    if (sharedPodIds !== undefined) {
      await supabase.from('habit_pods').delete().eq('habit_id', id);
      if (!isPrivate && Array.isArray(sharedPodIds) && sharedPodIds.length > 0) {
        const links = sharedPodIds.map((podId: string) => ({
          habit_id: id,
          pod_id: podId,
        }));
        await supabase.from('habit_pods').insert(links);
      }
    }

    return NextResponse.json({ habit: updatedHabit });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update habit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', session.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Habit deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
