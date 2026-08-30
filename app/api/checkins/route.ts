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
    const { habitId, proofImageUrl, note, timezone = 'UTC' } = body;

    if (!habitId) {
      return NextResponse.json({ error: 'habitId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Fetch Habit
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', session.userId)
      .single();

    if (habitError || !habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // 2. Check if already checked in today
    const { data: existingLog } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', session.userId)
      .eq('logged_date', todayStr)
      .maybeSingle();

    if (existingLog) {
      // Toggle off / delete today's check-in
      await supabase.from('habit_logs').delete().eq('id', existingLog.id);

      const nextStreak = Math.max(0, habit.current_streak - 1);
      await supabase
        .from('habits')
        .update({ current_streak: nextStreak, updated_at: new Date().toISOString() })
        .eq('id', habitId);

      return NextResponse.json({
        checkedIn: false,
        currentStreak: nextStreak,
        message: 'Check-in cancelled for today',
      });
    }

    // 3. Insert Check-In Log
    const { data: newLog, error: logError } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: session.userId,
        status: true,
        proof_image_url: proofImageUrl || null,
        note: note || null,
        logged_date: todayStr,
        user_timezone: timezone,
      })
      .select()
      .single();

    if (logError || !newLog) {
      return NextResponse.json(
        { error: logError?.message || 'Failed to record check-in' },
        { status: 500 }
      );
    }

    // 4. Update Streak Counter
    const nextStreak = habit.current_streak + 1;
    const nextLongest = Math.max(habit.longest_streak, nextStreak);

    await supabase
      .from('habits')
      .update({
        current_streak: nextStreak,
        longest_streak: nextLongest,
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId);

    // 5. Check Milestone Badges (7, 30, 100 days)
    let unlockedBadge = null;
    if (nextStreak === 7 || nextStreak === 30 || nextStreak === 100) {
      const badgeKey =
        nextStreak === 7
          ? 'badge_7_spark'
          : nextStreak === 30
          ? 'badge_30_ember'
          : 'badge_100_beacon';

      const title =
        nextStreak === 7
          ? '7-Day Spark'
          : nextStreak === 30
          ? '30-Day Hearth'
          : '100-Day Beacon';

      const desc =
        nextStreak === 7
          ? '7 consecutive days of showing up consistently'
          : nextStreak === 30
          ? '30 days solid routine locked in'
          : '100 days mastery achieved';

      const icon = nextStreak === 7 ? '🔥' : nextStreak === 30 ? '✨' : '⚡';

      const { data: badge } = await supabase
        .from('milestone_badges')
        .insert({
          user_id: session.userId,
          habit_id: habitId,
          badge_key: badgeKey,
          title,
          description: desc,
          icon,
          threshold_days: nextStreak,
        })
        .select()
        .single();

      unlockedBadge = badge;
    }

    return NextResponse.json({
      checkedIn: true,
      log: newLog,
      currentStreak: nextStreak,
      longestStreak: nextLongest,
      unlockedBadge,
    });
  } catch (error: any) {
    console.error('Checkin API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal check-in error' },
      { status: 500 }
    );
  }
}
