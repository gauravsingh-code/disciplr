'use client';

import React, { useState, useEffect } from 'react';
import { Post, PostReply } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle } from 'lucide-react';

interface ReplyThreadModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReplyThreadModal({ post, isOpen, onClose }: ReplyThreadModalProps) {
  const { user, replyToPost } = useEmber();
  const [replies, setReplies] = useState<PostReply[]>([]);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      setIsLoading(true);
      fetch(`/api/posts/${post.id}/replies`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.replies) {
            setReplies(data.replies);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setReplies([]);
      setNewReplyContent('');
    }
  }, [isOpen, post]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newReplyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const contentToSend = newReplyContent.trim();
    setNewReplyContent('');

    try {
      const created = await replyToPost(post.id, contentToSend);
      if (created) {
        setReplies((prev) => [...prev, created]);
      }
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conversation" maxWidth="md">
      <div className="space-y-4">
        {/* Parent Post Snapshot */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar src={post.userAvatar} name={post.userName} size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{post.userName}</span>
                <span className="text-[11px] text-zinc-500">@{post.userUsername}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-200 pl-8 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Replies List */}
        <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
          {isLoading ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              Loading replies...
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500 flex flex-col items-center gap-1">
              <MessageCircle className="w-5 h-5 text-zinc-600" />
              <span>No replies yet. Be the first to reply!</span>
            </div>
          ) : (
            replies.map((reply) => (
              <div
                key={reply.id}
                className="flex gap-2.5 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-left animate-fade-in"
              >
                <Avatar src={reply.userAvatar} name={reply.userName} size="sm" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">
                      {reply.userName}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      @{reply.userUsername}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed break-words">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Input Form */}
        <form
          onSubmit={handleSubmitReply}
          className="flex items-center gap-2 pt-2 border-t border-zinc-800/80"
        >
          <Avatar src={user.avatar} name={user.name} size="sm" className="shrink-0" />
          <input
            type="text"
            value={newReplyContent}
            onChange={(e) => setNewReplyContent(e.target.value)}
            placeholder="Post your reply..."
            maxLength={280}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!newReplyContent.trim()}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </Modal>
  );
}
