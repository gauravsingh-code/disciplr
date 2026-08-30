'use client';

import React, { useEffect } from 'react';
import { useEmber } from '@/context/ember-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Flame, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function MilestoneCelebration() {
  const { activeMilestone, dismissCelebration } = useEmber();

  useEffect(() => {
    if (activeMilestone) {
      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#f59e0b', '#fbbf24', '#ec4899', '#10b981'],
      });
    }
  }, [activeMilestone]);

  if (!activeMilestone) return null;

  return (
    <Modal
      isOpen={!!activeMilestone}
      onClose={dismissCelebration}
      maxWidth="sm"
    >
      <div className="text-center py-4 space-y-4">
        {/* Animated Badge Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-2xl animate-pulse-subtle" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-2xl shadow-orange-500/40 animate-scale-in">
            <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center text-4xl">
              {activeMilestone.icon}
            </div>
          </div>
        </div>

        {/* Milestone Headline */}
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/15 px-3 py-1 rounded-full border border-orange-500/30">
            Milestone Unlocked!
          </span>
          <h2 className="text-xl font-black text-white mt-2">
            {activeMilestone.title}
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-xs mx-auto leading-relaxed">
            {activeMilestone.description}
          </p>
        </div>

        {/* Pod Recognition Note */}
        <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-xs text-zinc-400">
          🎉 This milestone has been celebrated in your Pod feed!
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          <Button
            variant="glow"
            fullWidth
            onClick={dismissCelebration}
          >
            Keep the Fire Burning 🔥
          </Button>
        </div>
      </div>
    </Modal>
  );
}
