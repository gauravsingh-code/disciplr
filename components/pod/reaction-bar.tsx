'use client';

import React, { useState } from 'react';
import { Reaction, ReactionEmoji } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import { Avatar } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';

interface ReactionBarProps {
  logId: string;
  reactions: Reaction[];
}

const AVAILABLE_EMOJIS: ReactionEmoji[] = ['🔥', '👏', '💪', '🙌', '❤️', '⚡'];

export function ReactionBar({ logId, reactions }: ReactionBarProps) {
  const { user, addReaction } = useEmber();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Group reactions by emoji
  const grouped = AVAILABLE_EMOJIS.map((emoji) => {
    const matching = reactions.filter((r) => r.emoji === emoji);
    const hasUserReacted = matching.some((r) => r.userId === user.id);
    return {
      emoji,
      users: matching,
      count: matching.length,
      hasUserReacted,
    };
  }).filter((g) => g.count > 0);

  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-2">
      {/* Existing Reaction Badges */}
      {grouped.map((group) => (
        <button
          key={group.emoji}
          onClick={() => addReaction(logId, group.emoji)}
          className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer select-none active:scale-95 ${
            group.hasUserReacted
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
              : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700/80'
          }`}
        >
          <span className="text-sm">{group.emoji}</span>
          <span className="font-semibold text-[11px]">{group.count}</span>

          {/* Member avatars who reacted preview tooltip */}
          <div className="hidden group-hover:flex absolute bottom-full left-0 mb-1.5 items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg shadow-xl z-30 pointer-events-none animate-scale-in">
            {group.users.slice(0, 3).map((u) => (
              <span key={u.id} className="text-[10px] text-zinc-300 font-medium whitespace-nowrap">
                {u.userName.split(' ')[0]}
              </span>
            ))}
            {group.users.length > 3 && (
              <span className="text-[10px] text-zinc-500">+{group.users.length - 3}</span>
            )}
          </div>
        </button>
      ))}

      {/* Add Reaction Button & Picker */}
      <div className="relative">
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-all cursor-pointer active:scale-95"
          title="Add encouragement reaction"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {pickerOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setPickerOpen(false)}
            />
            <div className="absolute left-0 bottom-full mb-2 flex items-center gap-1 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-40 animate-scale-in">
              {AVAILABLE_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    addReaction(logId, emoji);
                    setPickerOpen(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-zinc-800 rounded-xl transition-transform hover:scale-125 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
