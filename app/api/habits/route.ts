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
    const { data: rawHabits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error querying habits:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let habitPodsMap: Record<string, string[]> = {};
    const habitIds = (rawHabits || []).map((h: any) => h.id);
    if (habitIds.length > 0) {
      try {
        const { data: hpData } = await supabase
          .from('habit_pods')
          .select('habit_id, pod_id')
          .in('habit_id', habitIds);

        if (hpData) {
          hpData.forEach((hp: any) => {
            if (!habitPodsMap[hp.habit_id]) {
              habitPodsMap[hp.habit_id] = [];
            }
            habitPodsMap[hp.habit_id].push(hp.pod_id);
          });
        }
      } catch {}
    }

    const formattedHabits = (rawHabits || []).map((h: any) => ({
      id: h.id,
      userId: h.user_id,
      title: h.title,
      emoji: h.emoji || '⚡',
      frequency: {
        type: h.frequency_type || 'daily',
        daysOfWeek: Array.isArray(h.frequency_days) ? h.frequency_days : [],
        timesPerWeek: h.times_per_week || 7,
      },
      reminderTime: h.reminder_time || '08:00 AM',
      isPrivate: !!h.is_private,
      sharedPodIds: habitPodsMap[h.id] || [],
      currentStreak: Number(h.current_streak) || 0,
      longestStreak: Number(h.longest_streak) || 0,
      streakShieldsUsed: Number(h.streak_shields_used) || 0,
      isArchived: !!h.is_archived,
      createdAt: h.created_at || new Date().toISOString(),
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
      try {
        const links = sharedPodIds.map((podId: string) => ({
          habit_id: newHabit.id,
          pod_id: podId,
        }));
        await supabase.from('habit_pods').insert(links);
      } catch {}
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
