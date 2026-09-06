'use client';

import React, { useState, useRef } from 'react';
import { useEmber } from '@/context/ember-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post } from '@/types/ember';
import {
  Image as ImageIcon,
  Sparkles,
  Users,
  Globe,
  Send,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface PostComposerProps {
  onPostCreated?: (post: Post) => void;
  defaultPodOnly?: boolean;
  /** Hard-bind the post to a specific pod (hides the visibility toggle) */
  podId?: string;
}


export function PostComposer({ onPostCreated, defaultPodOnly = false, podId: hardPodId }: PostComposerProps) {
  const { user, activePod, createPost } = useEmber();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [localPreview, setLocalPreview] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPodOnly, setIsPodOnly] = useState(defaultPodOnly);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charLimit = 500;
  const remainingChars = charLimit - content.length;
  const isOverLimit = remainingChars < 0;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadError(null);
    setIsUploadingMedia(true);

    // Keep immediate local preview in browser memory so it never disappears or flickers
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'posts_images');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload photo');
      }

      setMediaUrl(data.url);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setUploadError(err?.message || 'Failed to upload photo');
      setLocalPreview('');
      setMediaUrl('');
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setLocalPreview('');
    setMediaUrl('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isOverLimit || isSubmitting || isUploadingMedia) return;

    setIsSubmitting(true);
    try {
      // If a hard podId is supplied (pod page), always post to that pod
      const resolvedPodId = hardPodId ?? (isPodOnly ? activePod?.id : undefined);
      const resolvedIsPodOnly = hardPodId ? true : isPodOnly;

      const created = await createPost({
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        podId: resolvedPodId,
        isPodOnly: resolvedIsPodOnly,
      });

      setContent('');
      setLocalPreview('');
      setMediaUrl('');
      setUploadError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (created) onPostCreated?.(created);
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
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
                hardPodId
                  ? 'Send a message to this pod...'
                  : isPodOnly && activePod
                  ? `Share an update with ${activePod.name}...`
                  : 'What ritual did you conquer today? Share your thoughts...'
              }
              rows={3}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none"
            />

            {/* Media Image Preview with Upload State */}
            {(localPreview || mediaUrl) && (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 max-h-60 group bg-zinc-900/80">
                <img
                  src={localPreview || mediaUrl}
                  alt="Attachment preview"
                  className={`w-full h-full object-cover transition-opacity ${
                    isUploadingMedia ? 'opacity-50' : 'opacity-100'
                  }`}
                />

                {isUploadingMedia ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 text-xs text-orange-400 font-semibold shadow-lg">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading photo...</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-950/80 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="text-xs text-rose-400 flex items-center gap-1.5 py-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>


        {/* Bottom Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-2">
            {/* Hidden Native File Input for Gallery / Device File Selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* Gallery Photo Selection Button */}
            <button
              type="button"
              disabled={isUploadingMedia}
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                localPreview || mediaUrl
                  ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="Upload image from gallery"
            >
              {isUploadingMedia ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isUploadingMedia ? 'Uploading...' : 'Photo'}
              </span>
            </button>

            {/* Visibility toggle — hidden when podId is hard-bound */}
            {!hardPodId && activePod && (
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
            {/* Hard-bound pod indicator */}
            {hardPodId && (
              <span className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Pod only
              </span>
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
              disabled={!content.trim() || isOverLimit || isUploadingMedia}
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
