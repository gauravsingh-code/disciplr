'use client';

import React, { useState } from 'react';
import { Post } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import { Avatar } from '@/components/ui/avatar';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Trash2,
  Users,
  Globe,
  Check,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onOpenReplies?: (post: Post) => void;
}

export function PostCard({ post, onOpenReplies }: PostCardProps) {
  const { user, likePost, deletePost } = useEmber();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user.id === post.userId;

  // Format relative timestamp
  const formatTime = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (diffSec < 60) return 'just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d`;
      return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likePost(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      await deletePost(post.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="glass-panel rounded-3xl p-4 sm:p-5 border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-200 shadow-lg space-y-3 group">
      {/* Header: Author Info & Scope Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={post.userAvatar}
            name={post.userName}
            size="md"
            className="shrink-0 ring-2 ring-zinc-800"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
                {post.userName}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                @{post.userUsername || 'user'}
              </span>
              <span className="text-zinc-600 text-xs">·</span>
              <time className="text-xs text-zinc-500">
                {formatTime(post.createdAt)}
              </time>
            </div>

            {/* Scope / Pod tag */}
            {post.isPodOnly && post.podName ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 mt-0.5">
                <Users className="w-2.5 h-2.5" />
                {post.podName}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 font-medium mt-0.5">
                <Globe className="w-2.5 h-2.5 text-zinc-600" />
                Public
              </span>
            )}
          </div>
        </div>

        {/* Delete if author */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Delete post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content Text */}
      <div className="pl-12 text-sm text-zinc-200 leading-relaxed break-words whitespace-pre-line">
        {post.content}
      </div>

      {/* Media Image (if present) */}
      {post.mediaUrl && (
        <div className="pl-12">
          <div className="rounded-2xl overflow-hidden border border-zinc-800/80 max-h-96 bg-zinc-900">
            <img
              src={post.mediaUrl}
              alt="Post attachment"
              className="w-full h-full object-cover hover:scale-[1.01] transition-transform"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Interactive Action Bar (Twitter / X style) */}
      <div className="pl-12 pt-1 flex items-center justify-between max-w-md text-zinc-500">
        {/* Reply Action */}
        <button
          onClick={() => onOpenReplies?.(post)}
          className="flex items-center gap-1.5 text-xs hover:text-orange-400 transition-colors p-1.5 -ml-1.5 rounded-xl hover:bg-orange-500/10 cursor-pointer group/btn"
          title="Reply"
        >
          <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span className="text-[11px] font-semibold">{post.repliesCount || ''}</span>
        </button>

        {/* Repost Action */}
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 text-xs hover:text-emerald-400 transition-colors p-1.5 rounded-xl hover:bg-emerald-500/10 cursor-pointer group/btn"
          title="Repost"
        >
          <Repeat2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span className="text-[11px] font-semibold">{post.repostsCount || ''}</span>
        </button>

        {/* Like Heart Action */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors p-1.5 rounded-xl cursor-pointer group/btn ${
            post.hasLiked
              ? 'text-rose-500 hover:bg-rose-500/10'
              : 'hover:text-rose-400 hover:bg-rose-500/10'
          }`}
          title="Like"
        >
          <Heart
            className={`w-4 h-4 transition-all group-hover/btn:scale-125 ${
              post.hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
            }`}
          />
          <span className="text-[11px] font-semibold">{post.likesCount || ''}</span>
        </button>

        {/* Share Action */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs hover:text-indigo-400 transition-colors p-1.5 rounded-xl hover:bg-indigo-500/10 cursor-pointer group/btn"
          title="Copy Link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          )}
        </button>
      </div>
    </article>
  );
}
