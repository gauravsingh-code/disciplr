'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'ember' | 'gold' | 'emerald' | 'slate' | 'outline' | 'shield';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = 'ember',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-full',
  }[size];

  const variantStyles = {
    ember:
      'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10',
    gold: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    emerald:
      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    slate: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60',
    outline: 'bg-transparent text-zinc-400 border border-zinc-700/60',
    shield:
      'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeStyles} ${variantStyles} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
