'use client';

import React from 'react';
import { useEmber } from '@/context/ember-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, Sparkles, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StreakShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StreakShieldModal({ isOpen, onClose }: StreakShieldModalProps) {
  const { user } = useEmber();
  const shields = user.streakShields;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
          <span>Forgiving Streaks & Streak Shields</span>
        </div>
      }
      description="Habit formation is a long-term journey. Missing one day does not erase your progress."
    >
      <div className="space-y-4">
        {/* Shield Count Big Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-900 border border-indigo-500/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mb-2 shadow-inner">
              <Shield className="w-8 h-8 text-indigo-300 fill-indigo-400/30" />
            </div>

            <div className="text-3xl font-extrabold text-white">
              {shields.totalAvailable}
            </div>
            <p className="text-xs font-semibold text-indigo-300 mt-0.5">
              Active Streak Shields Available
            </p>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
              Automatically protects your streak if you miss a scheduled day. No panic, no shame.
            </p>
          </div>
        </div>

        {/* Behavioral Science Explainer */}
        <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Backed by Habit Science (Lally et al., UCL)</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Controlled research shows automaticity takes ~66 days to form, and occasionally missing a single day does <em>not</em> significantly disrupt habit automaticity. Ember never punishes you with an instant zero reset when life happens.
          </p>
        </div>

        {/* Shield Protection History */}
        <div>
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
            Recent Shield Protections
          </h4>
          {shields.history.length === 0 ? (
            <div className="p-3 rounded-xl bg-zinc-900 text-center text-xs text-zinc-500">
              No shields used yet — your streaks are running strong!
            </div>
          ) : (
            <div className="space-y-2">
              {shields.history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200 truncate">
                        {item.habitTitle}
                      </span>
                      <span className="text-[10px] text-zinc-500">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="secondary" fullWidth onClick={onClose}>
          Got it
        </Button>
      </div>
    </Modal>
  );
}
