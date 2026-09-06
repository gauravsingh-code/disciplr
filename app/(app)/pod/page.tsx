'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEmber } from '@/context/ember-context';
import { PodPulse } from '@/components/pod/pod-pulse';
import { PodFeedItem } from '@/components/pod/pod-feed-item';
import { PodInviteModal } from '@/components/pod/pod-invite-modal';
import { PostComposer } from '@/components/posts/post-composer';
import { PostCard } from '@/components/posts/post-card';
import { ReplyThreadModal } from '@/components/posts/reply-thread-modal';
import { Post } from '@/types/ember';
import {
  Users,
  Flame,
  Plus,
  MessageCircle,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-zinc-800/60 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-zinc-800 rounded-full w-28" />
          <div className="h-2.5 bg-zinc-800/70 rounded-full w-16" />
        </div>
      </div>
      <div className="space-y-2 pl-12">
        <div className="h-3 bg-zinc-800 rounded-full w-full" />
        <div className="h-3 bg-zinc-800 rounded-full w-3/4" />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PodPage() {
  const {
    activePod,
    pods,
    feedLogs,
    setActivePodId,
    user,
  } = useEmber();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeReplyPost, setActiveReplyPost] = useState<Post | null>(null);

  // Pod-scoped posts — local state, isolated per pod
  const [podPosts, setPodPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const currentPod = activePod || pods[0] || null;

  // Fetch posts whenever the active pod changes
  const fetchPodPosts = useCallback(async (podId: string) => {
    setPostsLoading(true);
    setPostsError(null);
    setPodPosts([]);
    try {
      const res = await fetch(`/api/posts?scope=pod&podId=${podId}`);
      if (!res.ok) throw new Error('Failed to load pod posts');
      const data = await res.json();
      setPodPosts(data.posts ?? []);
    } catch (err: unknown) {
      setPostsError(err instanceof Error ? err.message : 'Could not load posts');
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPod?.id) {
      fetchPodPosts(currentPod.id);
    }
  }, [currentPod?.id, fetchPodPosts]);

  // ─── No Pod State ────────────────────────────────────────────────────────────
  if (!currentPod) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-2xl">
          👥
        </div>
        <h2 className="text-xl font-bold text-zinc-100">No Active Growth Networks</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Disciplr is designed for small circles of 3–8 people. Create or join a Growth Network to start sharing accountability.
        </p>
        <Button
          variant="primary"
          onClick={() => setInviteModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create or Join a Pod
        </Button>
        <PodInviteModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          initialMode="invite_only"
        />
      </div>
    );
  }

  // Filter check-in logs for this pod/member
  const podFeedLogs = feedLogs.filter((log) => {
    if (selectedMemberId) return log.userId === selectedMemberId;
    return currentPod.members.some((m) => m.userId === log.userId);
  });

  return (
    <div className="space-y-6">
      {/* Pod Selector Pills (if multiple pods) */}
      {pods.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {pods.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePodId(p.id);
                setSelectedMemberId(null);
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                p.id === currentPod.id
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span>{p.emoji}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Pod Pulse Header */}
      <PodPulse
        pod={currentPod}
        onOpenInvite={() => setInviteModalOpen(true)}
      />

      {/* ── Pod Messages Section ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
            <span>Pod Messages</span>
          </h3>
          <span className="text-[11px] text-zinc-600">Pod members only</span>
        </div>

        {/* Post Composer — hard-bound to this pod */}
        <PostComposer
          podId={currentPod.id}
          defaultPodOnly
          onPostCreated={(newPost) => {
            // Optimistic prepend — already done in context, but we also update local state
            setPodPosts((prev) => {
              const already = prev.some((p) => p.id === newPost.id);
              return already ? prev : [newPost, ...prev];
            });
          }}
        />

        {/* Posts List */}
        {postsLoading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : postsError ? (
          <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-2">
            <p className="text-sm font-semibold text-rose-400">{postsError}</p>
            <button
              onClick={() => fetchPodPosts(currentPod.id)}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : podPosts.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-300">No messages yet</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Be the first to post something in{' '}
              <span className="text-zinc-300 font-semibold">{currentPod.name}</span>!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {podPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenReplies={(p) => setActiveReplyPost(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Check-In Activity Stream ─────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Member Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedMemberId(null)}
            className={`shrink-0 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedMemberId === null
                ? 'bg-zinc-800 text-orange-400 border border-zinc-700/80 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60'
            }`}
          >
            All Activity ({podFeedLogs.length})
          </button>

          {currentPod.members.map((member) => (
            <button
              key={member.userId}
              onClick={() =>
                setSelectedMemberId(
                  selectedMemberId === member.userId ? null : member.userId
                )
              }
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedMemberId === member.userId
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800/80'
              }`}
            >
              <Avatar src={member.avatar} name={member.name} size="xs" />
              <span>{member.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Chronological Check-In Feed */}
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Check-In Stream</span>
        </h3>

        {podFeedLogs.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 text-center space-y-2">
            <MessageCircle className="w-8 h-8 text-zinc-500 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-200">No check-ins yet</h4>
            <p className="text-xs text-zinc-400">
              When members log their daily habits, they will appear here.
            </p>
          </div>
        ) : (
          podFeedLogs.map((log) => <PodFeedItem key={log.id} log={log} />)
        )}
      </div>

      {/* Reply Thread Modal */}
      <ReplyThreadModal
        post={activeReplyPost}
        isOpen={!!activeReplyPost}
        onClose={() => setActiveReplyPost(null)}
      />

      {/* Invite Modal */}
      <PodInviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        pod={activePod}
        initialMode="invite_only"
      />
    </div>
  );
}
