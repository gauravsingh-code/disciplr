'use client';

import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  checkedInToday?: boolean;
  className?: string;
}

export function Avatar({
  src,
  name,
  size = 'md',
  checkedInToday,
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeDimensions = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base font-medium',
    xl: 'w-16 h-16 text-lg font-bold',
  }[size];

  const ringStyles =
    checkedInToday !== undefined
      ? checkedInToday
        ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-zinc-950'
        : 'ring-1 ring-zinc-700'
      : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${sizeDimensions} ${ringStyles} ${className} bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50`}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold text-zinc-300 tracking-wider">
          {getInitials(name)}
        </span>
      )}
      {checkedInToday && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-zinc-950" />
      )}
    </div>
  );
}
