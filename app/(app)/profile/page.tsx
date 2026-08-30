'use client';

import React from 'react';
import { useEmber } from '@/context/ember-context';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ActivityCalendar } from '@/components/profile/activity-calendar';
import {
  Flame,
  Shield,
  Trophy,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, habits, completedTodayHabitIds, feedLogs } = useEmber();

  const activeHabits = habits.filter((h) => !h.isArchived);
  const longestStreakAcrossHabits = habits.length > 0
    ? Math.max(...habits.map((h) => h.longestStreak), 0)
    : 0;

  // 7-Day Consistency Representation
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hasCompletedToday = completedTodayHabitIds.length > 0;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <Avatar
            src={user.avatar}
            name={user.name || 'User'}
            size="xl"
            checkedInToday={hasCompletedToday}
            className="ring-4 ring-orange-500/30"
          />

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user.name || 'Member Profile'}</h1>
              {user.ageVerified && (
                <span className="text-xs text-orange-400 font-semibold bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/30">
                  16+ Verified
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">@{user.username || 'user'}</p>
            <p className="text-xs text-zinc-300 max-w-md pt-1">
              Building daily consistency with closed Pod accountability. Proof of work over public noise.
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Active Habits
            </span>
            <span className="text-xl font-extrabold text-white">
              {activeHabits.length}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Longest Streak
            </span>
            <span className="text-xl font-extrabold text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-orange-500" />
              {longestStreakAcrossHabits}d
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Streak Shields
            </span>
            <span className="text-xl font-extrabold text-indigo-400 flex items-center justify-center gap-1">
              <Shield className="w-4 h-4 fill-indigo-400/20" />
              {user.streakShields?.totalAvailable ?? 2}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Badges
            </span>
            <span className="text-xl font-extrabold text-amber-300 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" />
              {user.badges?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Annual LeetCode/GitHub-Style Habit Heatmap */}
      <ActivityCalendar
        logs={feedLogs}
        userId={user.id}
        completedTodayHabitIds={completedTodayHabitIds}
      />

      {/* 7-Day Consistency Heat-Map */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span>Weekly Consistency Rhythm</span>
          </h3>
          <span className="text-[11px] text-orange-400 font-semibold">
            {hasCompletedToday ? 'Active Today' : 'Show up today!'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {daysOfWeek.map((day, idx) => {
            const isToday = idx === (new Date().getDay() + 6) % 7; // Align Sun/Mon
            const active = isToday ? hasCompletedToday : false;

            return (
              <div
                key={day}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                  active
                    ? 'bg-zinc-900 border-orange-500/40'
                    : 'bg-zinc-900/40 border-zinc-800/60'
                }`}
              >
                <span className="text-[10px] text-zinc-400 font-semibold">{day}</span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                    active
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-zinc-950 shadow-md shadow-orange-500/20'
                      : 'bg-zinc-800/60 text-zinc-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Badges Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Milestone Badges (7 / 30 / 100 Days)</span>
          </h3>
          <span className="text-[11px] text-zinc-400">
            {user.badges?.length ?? 0} / 3 unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              threshold: 7,
              title: '7-Day Spark',
              desc: '7 days continuous momentum',
              icon: '🔥',
            },
            {
              threshold: 30,
              title: '30-Day Hearth',
              desc: '30 days solid ritual',
              icon: '✨',
            },
            {
              threshold: 100,
              title: '100-Day Beacon',
              desc: '100 days mastery',
              icon: '⚡',
            },
          ].map((badge) => {
            const isUnlocked = user.badges?.some(
              (b) => b.thresholdDays === badge.threshold
            );

            return (
              <div
                key={badge.threshold}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      isUnlocked
                        ? 'bg-amber-500/20 border border-amber-500/40'
                        : 'bg-zinc-800 border border-zinc-700'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">{badge.title}</h4>
                    <span className="text-[10px] text-zinc-400">
                      {isUnlocked ? 'Unlocked' : 'In Progress'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
