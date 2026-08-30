'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CheckCircle2,
  Flame,
  Layers,
  UserCircle,
  Settings,
  Shield,
  Users,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { useEmber } from '@/context/ember-context';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onOpenHabitModal?: () => void;
  onOpenPodModal?: () => void;
  onOpenShieldModal?: () => void;
}

export function Sidebar({
  onOpenHabitModal,
  onOpenPodModal,
  onOpenShieldModal,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, habits, completedTodayHabitIds, activePod } = useEmber();

  const activeHabitsCount = habits.filter((h) => !h.isArchived).length;
  const remainingToday = Math.max(0, activeHabitsCount - completedTodayHabitIds.length);

  const mainLinks = [
    {
      label: 'Today',
      href: '/today',
      icon: CheckCircle2,
      badge: remainingToday > 0 ? `${remainingToday} due` : undefined,
    },
    {
      label: 'Pod Feed',
      href: '/pod',
      icon: Flame,
    },
    {
      label: 'Community Feed',
      href: '/feed',
      icon: MessageSquare,
    },
    {
      label: 'My Habits',
      href: '/habits',
      icon: Layers,
    },
    {
      label: 'Profile & Badges',
      href: '/profile',
      icon: UserCircle,
    },
    {
      label: 'Settings & Privacy',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between p-4 border-r border-zinc-800/80 bg-zinc-950/60 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Links */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Navigation
          </div>
          {mainLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/today' && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-orange-300 font-semibold border border-orange-500/25 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-orange-400' : 'text-zinc-400'
                    }`}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <Badge variant="ember" size="sm">
                    {link.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Pod Info Box */}
        {activePod && (
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Active Pod
              </span>
              <span className="text-sm">{activePod.emoji}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100 truncate">
                {activePod.name}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                {activePod.description}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <span className="text-xs text-zinc-400">
                {activePod.members.length} / {activePod.maxMembers} members
              </span>
              <button
                onClick={onOpenPodModal}
                className="text-xs font-semibold text-orange-400 hover:text-orange-300 cursor-pointer"
              >
                Invite +
              </button>
            </div>
          </div>
        )}

        {/* Streak Shield Card */}
        <div
          onClick={onOpenShieldModal}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-zinc-900 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
              <span className="text-xs font-bold text-indigo-200">Streak Shields</span>
            </div>
            <Badge variant="shield" size="sm">
              {user.streakShields.totalAvailable} left
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed group-hover:text-zinc-300">
            Guilt-free forgiveness: auto-applies on missed days to protect your momentum.
          </p>
        </div>
      </div>

      {/* User Mini Profile */}
      <div className="pt-4 border-t border-zinc-800/80">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition-colors"
        >
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <div className="truncate">
            <p className="text-xs font-bold text-zinc-100 truncate">{user.name}</p>
            <p className="text-[11px] text-zinc-400 truncate">@{user.username}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
