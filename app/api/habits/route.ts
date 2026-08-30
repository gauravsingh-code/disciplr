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
    const { data: habits, error } = await supabase
      .from('habits')
      .select(`
        id,
        user_id,
        title,
        emoji,
        frequency_type,
        frequency_days,
        times_per_week,
        reminder_time,
        is_private,
        current_streak,
        longest_streak,
        streak_shields_used,
        is_archived,
        created_at,
        habit_pods(pod_id)
      `)
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedHabits = (habits || []).map((h: any) => ({
      id: h.id,
      userId: h.user_id,
      title: h.title,
      emoji: h.emoji,
      frequency: {
        type: h.frequency_type,
        daysOfWeek: h.frequency_days,
        timesPerWeek: h.times_per_week,
      },
      reminderTime: h.reminder_time,
      isPrivate: h.is_private,
      sharedPodIds: (h.habit_pods || []).map((hp: any) => hp.pod_id),
      currentStreak: h.current_streak,
      longestStreak: h.longest_streak,
      streakShieldsUsed: h.streak_shields_used,
      isArchived: h.is_archived,
      createdAt: h.created_at,
    }));

    return NextResponse.json({ habits: formattedHabits });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch habits' },
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
    const { title, emoji, frequency, reminderTime, isPrivate, sharedPodIds } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Insert Habit
    const { data: newHabit, error: insertError } = await supabase
      .from('habits')
      .insert({
        user_id: session.userId,
        title: title.trim(),
        emoji: emoji || '⚡',
        frequency_type: frequency?.type || 'daily',
        frequency_days: frequency?.daysOfWeek || [],
        times_per_week: frequency?.timesPerWeek || 7,
        reminder_time: reminderTime || '08:00 AM',
        is_private: !!isPrivate,
        current_streak: 0,
        longest_streak: 0,
        streak_shields_used: 0,
        is_archived: false,
      })
      .select()
      .single();

    if (insertError || !newHabit) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create habit' },
        { status: 500 }
      );
    }

    // 2. Link shared Pods if not private
    if (!isPrivate && Array.isArray(sharedPodIds) && sharedPodIds.length > 0) {
      const links = sharedPodIds.map((podId: string) => ({
        habit_id: newHabit.id,
        pod_id: podId,
      }));
      await supabase.from('habit_pods').insert(links);
    }

    return NextResponse.json(
      {
        habit: {
          id: newHabit.id,
          userId: newHabit.user_id,
          title: newHabit.title,
          emoji: newHabit.emoji,
          frequency: {
            type: newHabit.frequency_type,
            daysOfWeek: newHabit.frequency_days,
            timesPerWeek: newHabit.times_per_week,
          },
          reminderTime: newHabit.reminder_time,
          isPrivate: newHabit.is_private,
          sharedPodIds: sharedPodIds || [],
          currentStreak: 0,
          longestStreak: 0,
          streakShieldsUsed: 0,
          isArchived: false,
          createdAt: newHabit.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal error creating habit' },
      { status: 500 }
    );
  }
}
