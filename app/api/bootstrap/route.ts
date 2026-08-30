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

    // 2. Fetch User Habits (with shared Pods)
    const { data: habits } = await supabase
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

    // 3. Fetch Today's Check-ins (logged_date = current date UTC / local)
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: todayLogs } = await supabase
      .from('habit_logs')
      .select('habit_id, status')
      .eq('user_id', session.userId)
      .eq('logged_date', todayStr);

    const completedTodayHabitIds = (todayLogs || [])
      .filter((l: any) => l.status)
      .map((l: any) => l.habit_id);

    // 4. Fetch User's Pod Memberships & Pods
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
          checkedInToday: false, // Calculated dynamically
          currentStreak: 5,
        })),
      }));

    // 5. Fetch Streak Shields
    const { data: shieldData } = await supabase
      .from('streak_shields')
      .select('*')
      .eq('user_id', session.userId)
      .maybeSingle();

    const streakShields = shieldData
      ? {
          totalAvailable: shieldData.total_available,
          maxPerWeek: shieldData.max_per_week,
          usedThisWeek: shieldData.used_this_week,
          history: shieldData.history || [],
        }
      : {
          totalAvailable: 2,
          maxPerWeek: 2,
          usedThisWeek: 0,
          history: [],
        };

    // 6. Fetch Milestone Badges
    const { data: badges } = await supabase
      .from('milestone_badges')
      .select('*')
      .eq('user_id', session.userId);

    const formattedBadges = (badges || []).map((b: any) => ({
      id: b.id,
      habitId: b.habit_id,
      title: b.title,
      description: b.description,
      icon: b.icon,
      thresholdDays: b.threshold_days,
      unlockedAt: b.unlocked_at,
      isCelebrated: b.is_celebrated,
    }));

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
