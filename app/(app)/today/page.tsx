'use client';

import React, { useState } from 'react';
import { useEmber } from '@/context/ember-context';
import { HabitCard } from '@/components/habits/habit-card';
import { HabitModal } from '@/components/habits/habit-modal';
import { ProofModal } from '@/components/habits/proof-modal';
import { Habit } from '@/types/ember';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function TodayPage() {
  const {
    habits,
    completedTodayHabitIds,
    user,
    activePod,
  } = useEmber();

  const [activeFilter, setActiveFilter] = useState<'all' | 'remaining' | 'completed'>('all');
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofHabit, setProofHabit] = useState<Habit | null>(null);

  const activeHabits = habits.filter((h) => !h.isArchived);
  const completedCount = activeHabits.filter((h) =>
    completedTodayHabitIds.includes(h.id)
  ).length;
  const totalCount = activeHabits.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredHabits = activeHabits.filter((h) => {
    const isDone = completedTodayHabitIds.includes(h.id);
    if (activeFilter === 'remaining') return !isDone;
    if (activeFilter === 'completed') return isDone;
    return true;
  });

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Header & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Today&apos;s Rituals
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Focus on showing up. One tap to check in.
          </p>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditHabit(null);
            setHabitModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Habit
        </Button>
      </div>

      {/* Progress & Momentum Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-300">
                Daily Completion
              </span>
              <Badge variant={progressPercent === 100 ? 'emerald' : 'ember'} size="sm">
                {completedCount}/{totalCount} Completed
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              {progressPercent === 100
                ? '🔥 All habits locked in for today! Great consistency.'
                : `${totalCount - completedCount} habit${
                    totalCount - completedCount === 1 ? '' : 's'
                  } remaining today.`}
            </p>
          </div>

          {/* Progress Circular Display */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 font-extrabold text-orange-400 text-sm shadow-inner shrink-0">
            {progressPercent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
        <div className="flex gap-1">
          {[
            { id: 'all', label: 'All Habits', count: totalCount },
            { id: 'remaining', label: 'Remaining', count: totalCount - completedCount },
            { id: 'completed', label: 'Completed', count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-zinc-800 text-orange-400 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {activePod && (
          <Link
            href="/pod"
            className="hidden sm:flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors"
          >
            <span>View Pod Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Habit Cards List */}
      {filteredHabits.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto text-xl">
            ✨
          </div>
          <h3 className="text-sm font-bold text-zinc-200">
            {activeFilter === 'remaining'
              ? 'All clear for today!'
              : 'No habits found'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {activeFilter === 'remaining'
              ? 'You have completed all scheduled rituals for today.'
              : 'Create your first daily habit to start building consistency.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditHabit(null);
              setHabitModalOpen(true);
            }}
          >
            Create a Habit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEditHabit={(h) => {
                setEditHabit(h);
                setHabitModalOpen(true);
              }}
              onOpenProofModal={(h) => {
                setProofHabit(h);
                setProofModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals for Today page */}
      <HabitModal
        isOpen={habitModalOpen}
        onClose={() => {
          setHabitModalOpen(false);
          setEditHabit(null);
        }}
        habitToEdit={editHabit}
      />

      <ProofModal
        isOpen={proofModalOpen}
        onClose={() => {
          setProofModalOpen(false);
          setProofHabit(null);
        }}
        habit={proofHabit}
      />
    </div>
  );
}
