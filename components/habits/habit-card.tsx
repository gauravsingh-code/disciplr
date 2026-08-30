'use client';

import React, { useState } from 'react';
import { Habit } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import {
  Check,
  Flame,
  Camera,
  Lock,
  Users,
  MoreVertical,
  Edit2,
  Archive,
  Trash2,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HabitCardProps {
  habit: Habit;
  onOpenProofModal: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
}

export function HabitCard({
  habit,
  onOpenProofModal,
  onEditHabit,
}: HabitCardProps) {
  const {
    completedTodayHabitIds,
    toggleCheckIn,
    archiveHabit,
    deleteHabit,
    pods,
  } = useEmber();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCompleted = completedTodayHabitIds.includes(habit.id);

  const formatFrequency = () => {
    if (habit.frequency.type === 'daily') return 'Daily';
    if (habit.frequency.type === 'specific_days') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return habit.frequency.daysOfWeek
        ?.map((d) => days[d])
        .join(', ') || 'Custom days';
    }
    return `${habit.frequency.timesPerWeek}x / week`;
  };

  const sharedPodsNames = pods
    .filter((p) => habit.sharedPodIds.includes(p.id))
    .map((p) => p.name)
    .join(', ');

  return (
    <div
      className={`relative p-4 rounded-2xl transition-all duration-300 ${
        isCompleted
          ? 'bg-zinc-900/90 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
          : 'glass-card'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Side: Check Button & Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* 1-Tap Check-In Trigger */}
          <button
            onClick={() => toggleCheckIn(habit.id)}
            className={`relative mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer active:scale-90 ${
              isCompleted
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/30'
                : 'bg-zinc-800/80 border border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/10 text-transparent hover:text-orange-400'
            }`}
            title={isCompleted ? 'Completed! Click to undo' : 'Tap to complete habit'}
          >
            <Check
              className={`w-5 h-5 transition-transform duration-200 ${
                isCompleted ? 'scale-100 stroke-[3]' : 'scale-75'
              }`}
            />
          </button>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl shrink-0">{habit.emoji}</span>
              <h3
                className={`text-sm sm:text-base font-bold truncate transition-colors ${
                  isCompleted ? 'text-zinc-200 line-through decoration-zinc-500' : 'text-zinc-100'
                }`}
              >
                {habit.title}
              </h3>
            </div>

            {/* Badges & Meta */}
            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-zinc-400">
              {/* Streak Badge */}
              <Badge
                variant={habit.currentStreak > 0 ? 'ember' : 'slate'}
                size="sm"
                icon={<Flame className={`w-3 h-3 ${habit.currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-zinc-500'}`} />}
              >
                {habit.currentStreak} day streak
              </Badge>

              {/* Schedule */}
              <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-zinc-500" />
                {habit.reminderTime || formatFrequency()}
              </span>

              {/* Visibility indicator */}
              {habit.isPrivate ? (
                <span
                  className="flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded"
                  title="Private habit (Only visible to you)"
                >
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-[11px] text-orange-400/80 bg-orange-500/10 px-1.5 py-0.5 rounded"
                  title={`Shared with Pods: ${sharedPodsNames || 'Active Pod'}`}
                >
                  <Users className="w-3 h-3" />
                  {sharedPodsNames || 'Pod'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Icons: Add Proof + Options Menu */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onOpenProofModal(habit)}
            className="p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 transition-all cursor-pointer"
            title="Attach photo proof or reflection note"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-40 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-30 animate-scale-in text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEditHabit(habit);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Habit</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      archiveHabit(habit.id);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{habit.isArchived ? 'Unarchive' : 'Archive'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (confirm('Delete this habit?')) deleteHabit(habit.id);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
