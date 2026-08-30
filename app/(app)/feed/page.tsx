'use client';

import React, { useState } from 'react';
import { useEmber } from '@/context/ember-context';
import { PostComposer } from '@/components/posts/post-composer';
import { PostCard } from '@/components/posts/post-card';
import { ReplyThreadModal } from '@/components/posts/reply-thread-modal';
import { Post } from '@/types/ember';
import { Sparkles, Users, Globe, MessageSquare } from 'lucide-react';

export default function FeedPage() {
  const { posts, activePod } = useEmber();
  const [feedScope, setFeedScope] = useState<'all' | 'pod'>('all');
  const [activeReplyPost, setActiveReplyPost] = useState<Post | null>(null);

  const displayedPosts =
    feedScope === 'pod' && activePod
      ? posts.filter((p) => p.podId === activePod.id || p.isPodOnly)
      : posts;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header with Title & Feed Scope Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Community Stream</span>
            <Sparkles className="w-5 h-5 text-orange-400" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Share reflections, celebrate consistency, and connect with your Pod.
          </p>
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center p-1 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
          <button
            onClick={() => setFeedScope('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              feedScope === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>All Posts</span>
          </button>
          {activePod && (
            <button
              onClick={() => setFeedScope('pod')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                feedScope === 'pod'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{activePod.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Twitter/X Style Post Composer */}
      <PostComposer defaultPodOnly={feedScope === 'pod'} />

      {/* Stream List */}
      <div className="space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center border border-zinc-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">No posts in this stream yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Be the first to share a reflection, celebrate a habit victory, or ask your pod for advice!
            </p>
          </div>
        ) : (
          displayedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenReplies={(p) => setActiveReplyPost(p)}
            />
          ))
        )}
      </div>

      {/* Reply Thread Modal */}
      <ReplyThreadModal
        post={activeReplyPost}
        isOpen={!!activeReplyPost}
        onClose={() => setActiveReplyPost(null)}
      />
    </div>
  );
}
