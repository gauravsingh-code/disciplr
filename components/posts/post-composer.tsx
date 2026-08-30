'use client';

import React, { useState } from 'react';
import { useEmber } from '@/context/ember-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Image as ImageIcon,
  Sparkles,
  Users,
  Globe,
  Send,
  X,
  Smile,
} from 'lucide-react';

interface PostComposerProps {
  onPostCreated?: () => void;
  defaultPodOnly?: boolean;
}

const EMOJI_SUGGESTIONS = ['🔥', '💪', '⚡', '🙌', '🎯', '✨', '🚀', '🧘‍♂️', '📖'];

export function PostComposer({ onPostCreated, defaultPodOnly = false }: PostComposerProps) {
  const { user, activePod, createPost } = useEmber();

  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isPodOnly, setIsPodOnly] = useState(defaultPodOnly);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charLimit = 500;
  const remainingChars = charLimit - content.length;
  const isOverLimit = remainingChars < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        podId: isPodOnly ? activePod?.id : undefined,
        isPodOnly,
      });

      setContent('');
      setMediaUrl('');
      setShowImageInput(false);
      onPostCreated?.();
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setContent((prev) => `${prev} ${emoji}`);
  };

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 border border-zinc-800/80 shadow-xl space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Top: Avatar & Textarea */}
        <div className="flex gap-3 items-start">
          <Avatar
            src={user.avatar}
            name={user.name || 'You'}
            size="md"
            className="shrink-0 ring-2 ring-orange-500/20"
          />

          <div className="flex-1 min-w-0 space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isPodOnly && activePod
                  ? `Share an update with ${activePod.name}...`
                  : "What ritual did you conquer today? Share your thoughts..."
              }
              rows={3}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none"
            />

            {/* Media Image Preview */}
            {mediaUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 max-h-60 group">
                <img
                  src={mediaUrl}
                  alt="Attachment preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-950/80 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Image URL Input Drawer */}
            {showImageInput && !mediaUrl && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 animate-scale-in">
                <ImageIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste image URL (e.g. https://...)"
                  className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowImageInput(false)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Emoji Strip */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar pl-11">
          {EMOJI_SUGGESTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              className="p-1 hover:bg-zinc-800 rounded-lg text-sm transition-transform hover:scale-110 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Bottom Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-2">
            {/* Image Attachment Toggle */}
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                mediaUrl || showImageInput
                  ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="Add Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            {/* Visibility Scope Pill: Pod Only vs Community */}
            {activePod && (
              <button
                type="button"
                onClick={() => setIsPodOnly(!isPodOnly)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPodOnly
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Toggle Visibility"
              >
                {isPodOnly ? (
                  <>
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activePod.name}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Community</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Character Counter */}
            <span
              className={`text-[11px] font-semibold ${
                isOverLimit
                  ? 'text-rose-400 font-bold'
                  : remainingChars <= 50
                  ? 'text-amber-400'
                  : 'text-zinc-500'
              }`}
            >
              {remainingChars}
            </span>

            {/* Publish Button */}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!content.trim() || isOverLimit}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
