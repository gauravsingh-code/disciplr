'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEmber } from '@/context/ember-context';
import {
  Shield,
  Plus,
  Users,
  ChevronDown,
  Sparkles,
  Smartphone,
  Monitor,
  Flame,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onOpenHabitModal?: () => void;
  onOpenShieldModal?: () => void;
  onOpenPodModal?: () => void;
}

export function AppHeader({
  onOpenHabitModal,
  onOpenShieldModal,
  onOpenPodModal,
}: AppHeaderProps) {
  const pathname = usePathname();
  const {
    user,
    pods,
    activePod,
    setActivePodId,
    previewMode,
    setPreviewMode,
    completedTodayHabitIds,
    habits,
  } = useEmber();

  const [podDropdownOpen, setPodDropdownOpen] = useState(false);

  const activeHabitsCount = habits.filter((h) => !h.isArchived).length;
  const progressPercent =
    activeHabitsCount > 0
      ? Math.round((completedTodayHabitIds.length / activeHabitsCount) * 100)
      : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand & Pod Selector */}
        <div className="flex items-center gap-3">
          <Link
            href="/today"
            className="flex items-center gap-2 font-bold text-lg text-white group select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent font-extrabold tracking-tight">
              Ember
            </span>
          </Link>

          {/* Pod Switcher Dropdown */}
          {activePod && (
            <div className="relative">
              <button
                onClick={() => setPodDropdownOpen(!podDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition-all cursor-pointer"
              >
                <span className="text-sm">{activePod.emoji}</span>
                <span className="max-w-[110px] sm:max-w-[160px] truncate font-semibold">
                  {activePod.name}
                </span>
                <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded-md">
                  {activePod.members.length}/8
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {podDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPodDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 animate-scale-in">
                    <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Your Pods
                    </div>
                    <div className="space-y-1 my-1">
                      {pods.map((pod) => (
                        <button
                          key={pod.id}
                          onClick={() => {
                            setActivePodId(pod.id);
                            setPodDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            pod.id === activePod.id
                              ? 'bg-orange-500/15 text-orange-300 font-semibold border border-orange-500/20'
                              : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{pod.emoji}</span>
                            <span className="truncate">{pod.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 shrink-0">
                            {pod.members.length} members
                          </span>
                        </button>
                      ))}
                    </div>
                    {onOpenPodModal && (
                      <button
                        onClick={() => {
                          setPodDropdownOpen(false);
                          onOpenPodModal();
                        }}
                        className="w-full mt-1 flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs text-orange-400 hover:bg-orange-500/10 font-medium border border-orange-500/20 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Create or Join Pod</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Tools & Stats */}
        <div className="flex items-center gap-2">
          {/* Streak Shield Status Pill */}
          <button
            onClick={onOpenShieldModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
            title="Streak Shields protect your consistency if you ever miss a day"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
            <span>{user.streakShields.totalAvailable}</span>
            <span className="hidden md:inline text-[11px] font-normal text-indigo-300/80">
              Shields
            </span>
          </button>

          {/* Preview Viewport Switcher */}
          <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            <button
              onClick={() => setPreviewMode('responsive')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                previewMode === 'responsive'
                  ? 'bg-zinc-800 text-orange-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Responsive Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                previewMode === 'mobile'
                  ? 'bg-zinc-800 text-orange-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Mobile Device Simulation Frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Add Habit Button */}
          {onOpenHabitModal && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenHabitModal}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">New Habit</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
