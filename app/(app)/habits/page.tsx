'use client';

import React, { useState } from 'react';
import { useEmber } from '@/context/ember-context';
import { HabitModal } from '@/components/habits/habit-modal';
import { Habit } from '@/types/ember';
import {
  Layers,
  Plus,
  Flame,
  Clock,
  Lock,
  Users,
  Edit2,
  Archive,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HabitsPage() {
  const { habits, archiveHabit, deleteHabit, pods } = useEmber();
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const activeHabits = habits.filter((h) => !h.isArchived);
  const archivedHabits = habits.filter((h) => h.isArchived);
  const displayedHabits = showArchived ? archivedHabits : activeHabits;

  const handleEdit = (habit: Habit) => {
    setHabitToEdit(habit);
    setHabitModalOpen(true);
  };

  const formatSchedule = (habit: Habit) => {
    if (habit.frequency.type === 'daily') return 'Every Day';
    if (habit.frequency.type === 'specific_days') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return habit.frequency.daysOfWeek?.map((d) => days[d]).join(', ') || 'Custom';
    }
    return `${habit.frequency.timesPerWeek}x / week`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Habit Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure frequencies, reminder times, and closed Pod visibility.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setHabitToEdit(null);
            setHabitModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Habit
        </Button>
      </div>

      {/* Tabs: Active vs Archived */}
      <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 w-fit">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !showArchived
              ? 'bg-zinc-800 text-orange-400 shadow-sm border border-zinc-700/60'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Active Habits ({activeHabits.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            showArchived
              ? 'bg-zinc-800 text-orange-400 shadow-sm border border-zinc-700/60'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Archived ({archivedHabits.length})
        </button>
      </div>

      {/* Habits List */}
      {displayedHabits.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center space-y-3">
          <Layers className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-200">
            {showArchived ? 'No archived habits' : 'No active habits'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {showArchived
              ? 'When you archive habits they will be safely preserved here.'
              : 'Add your first ritual to start building your consistency streak.'}
          </p>
          {!showArchived && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setHabitToEdit(null);
                setHabitModalOpen(true);
              }}
            >
              Add New Habit
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedHabits.map((habit) => {
            const sharedPods = pods.filter((p) =>
              habit.sharedPodIds.includes(p.id)
            );

            return (
              <div
                key={habit.id}
                className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{habit.emoji}</span>
                    <div>
                      <h3 className="text-base font-bold text-zinc-100">
                        {habit.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {habit.reminderTime} • {formatSchedule(habit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <Badge variant="ember" size="sm" icon={<Flame className="w-3 h-3 text-orange-500 fill-orange-500" />}>
                      {habit.currentStreak}d Streak (Best: {habit.longestStreak}d)
                    </Badge>

                    {habit.isPrivate ? (
                      <Badge variant="slate" size="sm" icon={<Lock className="w-3 h-3" />}>
                        Private Habit
                      </Badge>
                    ) : (
                      <Badge variant="emerald" size="sm" icon={<Users className="w-3 h-3" />}>
                        {sharedPods.length > 0
                          ? `Shared in ${sharedPods.map((p) => p.name).join(', ')}`
                          : 'Public Pod'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(habit)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <button
                    onClick={() => archiveHabit(habit.id)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title={habit.isArchived ? 'Restore Habit' : 'Archive Habit'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Permanently delete this habit?')) {
                        deleteHabit(habit.id);
                      }
                    }}
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Habit Modal */}
      <HabitModal
        isOpen={habitModalOpen}
        onClose={() => {
          setHabitModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
      />
    </div>
  );
}
