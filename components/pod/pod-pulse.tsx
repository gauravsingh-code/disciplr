'use client';

import React from 'react';
import { Pod } from '@/types/ember';
import { Avatar } from '@/components/ui/avatar';
import { Sparkles, Users } from 'lucide-react';

interface PodPulseProps {
  pod: Pod;
  onOpenInvite?: () => void;
}

export function PodPulse({ pod, onOpenInvite }: PodPulseProps) {
  const checkedInMembers = pod.members.filter((m) => m.checkedInToday);
  const totalMembers = pod.members.length;
  const pulsePercent =
    totalMembers > 0 ? Math.round((checkedInMembers.length / totalMembers) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 shadow-xl">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Pulse Count & Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{pod.emoji}</span>
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-100 tracking-tight">
              {pod.name}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold">
              {pulsePercent}% Pulse
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            <strong className="text-zinc-200 font-semibold">
              {checkedInMembers.length} of {totalMembers}
            </strong>{' '}
            members showed up today.
          </p>
        </div>

        {/* Right: Member Avatars & Quick Invite */}
        <div className="flex items-center gap-3">
          {/* Member Stack */}
          <div className="flex -space-x-2 overflow-hidden items-center">
            {pod.members.map((member) => (
              <div
                key={member.userId}
                className="relative group cursor-pointer transition-transform hover:scale-110 hover:z-20"
                title={`${member.name} — ${member.checkedInToday ? 'Checked in today!' : 'Pending check-in'}`}
              >
                <Avatar
                  src={member.avatar}
                  name={member.name}
                  size="sm"
                  checkedInToday={member.checkedInToday}
                  className="border-2 border-zinc-900"
                />
              </div>
            ))}
          </div>

          {/* Invite Pill Button */}
          {pod.members.length < pod.maxMembers && onOpenInvite && (
            <button
              onClick={onOpenInvite}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
          )}
        </div>
      </div>

      {/* Pulse Progress Bar */}
      <div className="mt-4 w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${pulsePercent}%` }}
        />
      </div>
    </div>
  );
}
