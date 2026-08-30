'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useEmber } from '@/context/ember-context';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Flame,
  Shield,
  Smartphone,
  Monitor,
  ChevronDown,
  Plus,
  Users,
  Check,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenShieldModal?: () => void;
  onOpenPodModal?: () => void;
}

export function AppHeader({
  onOpenShieldModal,
  onOpenPodModal,
}: AppHeaderProps) {
  const {
    user,
    activePod,
    activePodId,
    pods,
    setActivePodId,
    previewMode,
    setPreviewMode,
  } = useEmber();

  const [podDropdownOpen, setPodDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Pod Selector */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/today" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent hidden sm:inline-block">
              Ember
            </span>
          </Link>

          {/* Pod Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPodDropdownOpen(!podDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
            >
              <span className="text-sm">
                {activePodId === 'me' || !activePod ? '👤' : activePod.emoji}
              </span>
              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                {activePodId === 'me' || !activePod ? 'Me (Personal)' : activePod.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {podDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setPodDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-20 animate-scale-in space-y-1">
                  {/* Personal Option: Me */}
                  <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Habit Scope
                  </div>
                  <button
                    onClick={() => {
                      setActivePodId('me');
                      setPodDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      activePodId === 'me' || (!activePod && !activePodId)
                        ? 'bg-orange-500/10 text-orange-400 font-bold border border-orange-500/30'
                        : 'text-zinc-300 hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">👤</span>
                      <div>
                        <div className="font-semibold text-white">Me (Personal)</div>
                        <div className="text-[10px] text-zinc-400">Only your habits & rituals</div>
                      </div>
                    </div>
                    {(activePodId === 'me' || (!activePod && !activePodId)) && (
                      <Check className="w-3.5 h-3.5 shrink-0 text-orange-400" />
                    )}
                  </button>

                  {/* Section: Your Pods */}
                  <div className="pt-2 border-t border-zinc-800/80 px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Your Pods</span>
                    <span>({pods.length}/3)</span>
                  </div>

                  <div className="space-y-1 my-1">
                    {pods.length === 0 ? (
                      <div className="p-2 text-[11px] text-zinc-500 text-center">
                        No pods joined yet
                      </div>
                    ) : (
                      pods.map((p) => {
                        const isSelected = activePodId !== 'me' && p.id === activePod?.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActivePodId(p.id);
                              setPodDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500/10 text-orange-400 font-bold border border-orange-500/30'
                                : 'text-zinc-300 hover:bg-zinc-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span>{p.emoji}</span>
                              <span className="truncate">{p.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-orange-400" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => {
                        setPodDropdownOpen(false);
                        onOpenPodModal?.();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      <span>Join or Create Pod</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Shield Status Badge (Clickable) */}
          <button
            onClick={onOpenShieldModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 text-xs font-semibold transition-all cursor-pointer group"
          >
            <Shield className="w-3.5 h-3.5 fill-indigo-400/20 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>
              {user.streakShields?.totalAvailable ?? 2}{' '}
              <span className="hidden sm:inline">Shields</span>
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
        </div>
      </div>
    </header>
  );
}
