'use client';

import React, { useState } from 'react';
import { useEmber } from '@/context/ember-context';
import { PostComposer } from '@/components/posts/post-composer';
import { PostCard } from '@/components/posts/post-card';
import { ReplyThreadModal } from '@/components/posts/reply-thread-modal';
import { Post } from '@/types/ember';
import { Sparkles, MessageSquare } from 'lucide-react';

export default function FeedPage() {
  const { posts } = useEmber();
  const [activeReplyPost, setActiveReplyPost] = useState<Post | null>(null);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <span>Community Stream</span>
          <Sparkles className="w-5 h-5 text-orange-400" />
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Share reflections, celebrate consistency, and connect with everyone.
        </p>
      </div>

      {/* Post Composer */}
      <PostComposer />

      {/* Stream List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center border border-zinc-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">No posts yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Be the first to share a reflection or celebrate a habit victory!
            </p>
          </div>
        ) : (
          posts.map((post) => (
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
