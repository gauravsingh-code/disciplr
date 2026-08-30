'use client';

import React, { useState } from 'react';
import { Comment } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import { Avatar } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  logId: string;
  comments: Comment[];
}

export function CommentSection({ logId, comments }: CommentSectionProps) {
  const { user, addComment } = useEmber();
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(comments.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment(logId, content);
    setContent('');
    setIsOpen(true);
  };

  return (
    <div className="pt-2 border-t border-zinc-800/60 mt-3 space-y-2.5">
      {/* Toggle Comments Button */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>
            {comments.length === 0
              ? 'Leave encouragement'
              : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
          </span>
        </button>
      </div>

      {/* Expanded Comments List */}
      {isOpen && (
        <div className="space-y-2 pt-1 animate-slide-up">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50 text-xs"
            >
              <Avatar
                src={comment.userAvatar}
                name={comment.userName}
                size="xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-zinc-200 truncate">
                    {comment.userName}
                  </span>
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {comment.createdAt}
                  </span>
                </div>
                <p className="text-zinc-300 mt-0.5 text-xs leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {/* New Comment Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
            <Avatar src={user.avatar} name={user.name} size="xs" />
            <div className="relative flex-1">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 200))}
                placeholder="Send a word of encouragement..."
                className="w-full px-3 py-1.5 pr-8 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={!content.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-orange-400 disabled:text-zinc-600 hover:text-orange-300 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
