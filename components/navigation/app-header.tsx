'use client';

import React from 'react';
import Link from 'next/link';
import { useEmber } from '@/context/ember-context';
import { Shield, Flame } from 'lucide-react';

interface AppHeaderProps {
  onOpenShieldModal?: () => void;
  onOpenPodModal?: () => void;
}

export function AppHeader({
  onOpenShieldModal,
}: AppHeaderProps) {
  const { user } = useEmber();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link href="/today" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent hidden sm:inline-block">
            Disciplr
          </span>
        </Link>

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


        </div>
      </div>
    </header>
  );
}
