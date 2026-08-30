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

    // 1. Fetch User Record
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, description, is_active, created_at')
      .eq('id', session.userId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch User Habits (robust simple query)
    const { data: rawHabits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (habitsError) {
      console.warn('Habits fetch warning:', habitsError);
    }

    // Attempt to fetch habit_pods links safely
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
      } catch {
        // ignore if habit_pods table does not exist
      }
    }

    const formattedHabits = (rawHabits || []).map((h: any) => ({
      id: h.id,
      userId: h.user_id,
      title: h.title || 'Untitled Ritual',
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

    // 3. Fetch Today's Check-ins (logged_date = current date UTC / local)
    const todayStr = new Date().toISOString().split('T')[0];
    let completedTodayHabitIds: string[] = [];
    try {
      const { data: todayLogs } = await supabase
        .from('habit_logs')
        .select('habit_id, status')
        .eq('user_id', session.userId)
        .eq('logged_date', todayStr);

      completedTodayHabitIds = (todayLogs || [])
        .filter((l: any) => l.status)
        .map((l: any) => l.habit_id);
    } catch {}

    // 4. Fetch User's Pod Memberships & Pods
    let pods: any[] = [];
    try {
      const { data: memberships } = await supabase
        .from('pod_memberships')
        .select('pod_id, role, joined_at')
        .eq('user_id', session.userId);

      const podIds = (memberships || []).map((m: any) => m.pod_id);
      if (podIds.length > 0) {
        const { data: rawPods } = await supabase
          .from('pods')
          .select('*')
          .in('id', podIds);

        pods = (rawPods || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          emoji: p.emoji || '🌅',
          inviteCode: p.invite_code,
          creatorId: p.creator_id,
          maxMembers: p.max_members || 8,
          createdAt: p.created_at,
          members: [
            {
              userId: user.id,
              name: user.name,
              username: user.name.toLowerCase().replace(/\s+/g, '_'),
              avatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              joinedAt: p.created_at,
              role: p.creator_id === user.id ? 'creator' : 'member',
              checkedInToday: completedTodayHabitIds.length > 0,
              currentStreak: 1,
            },
          ],
        }));
      }
    } catch {}

    // 5. Fetch Streak Shields
    let streakShields = {
      totalAvailable: 2,
      maxPerWeek: 2,
      usedThisWeek: 0,
      history: [] as any[],
    };
    try {
      const { data: shieldData } = await supabase
        .from('streak_shields')
        .select('*')
        .eq('user_id', session.userId)
        .maybeSingle();

      if (shieldData) {
        streakShields = {
          totalAvailable: shieldData.total_available ?? 2,
          maxPerWeek: shieldData.max_per_week ?? 2,
          usedThisWeek: shieldData.used_this_week ?? 0,
          history: Array.isArray(shieldData.history) ? shieldData.history : [],
        };
      }
    } catch {}

    // 6. Fetch Milestone Badges
    let formattedBadges: any[] = [];
    try {
      const { data: badges } = await supabase
        .from('milestone_badges')
        .select('*')
        .eq('user_id', session.userId);

      formattedBadges = (badges || []).map((b: any) => ({
        id: b.id,
        habitId: b.habit_id,
        title: b.title,
        description: b.description,
        icon: b.icon,
        thresholdDays: b.threshold_days,
        unlockedAt: b.unlocked_at,
        isCelebrated: b.is_celebrated,
      }));
    } catch {}

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.name.toLowerCase().replace(/\s+/g, '_'),
        email: user.email,
        avatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        ageVerified: true,
        activePodId: pods[0]?.id || undefined,
        streakShields,
        notifications: {
          reminders: true,
          podNudges: true,
          socialActivity: true,
          dailyDigest: false,
        },
        badges: formattedBadges,
        createdAt: user.created_at,
      },
      habits: formattedHabits,
      pods,
      completedTodayHabitIds,
    });
  } catch (error: any) {
    console.error('Bootstrap API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load bootstrap data.' },
      { status: 500 }
    );
  }
}
