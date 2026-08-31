'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Flame, MessageSquare, Layers, UserCircle, Settings } from 'lucide-react';
import { useEmber } from '@/context/ember-context';

export function BottomNav({ embedded = false }: { embedded?: boolean }) {
  const pathname = usePathname();
  const { completedTodayHabitIds, habits } = useEmber();

  const activeHabitsCount = habits.filter((h) => !h.isArchived).length;
  const remainingToday = Math.max(0, activeHabitsCount - completedTodayHabitIds.length);

  const navItems = [
    {
      label: 'Today',
      href: '/today',
      icon: CheckCircle2,
      badge: remainingToday > 0 ? remainingToday : undefined,
    },
    {
      label: 'Pod',
      href: '/pod',
      icon: Flame,
    },
    {
      label: 'Feed',
      href: '/feed',
      icon: MessageSquare,
    },
    {
      label: 'Habits',
      href: '/habits',
      icon: Layers,
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: UserCircle,
    },
  ];

  return (
    <nav
      className={
        embedded
          ? 'sticky bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 w-full shrink-0'
          : 'fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800/80 max-w-md mx-auto sm:max-w-none'
      }
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/today' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all select-none group ${
                isActive ? 'text-orange-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.7]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-orange-500 text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-zinc-950 animate-pulse-subtle">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium tracking-tight ${
                  isActive ? 'text-orange-400 font-semibold' : 'text-zinc-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-sm shadow-orange-500/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
