'use client';

import React, { useState } from 'react';
import { CheckInLog } from '@/types/ember';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ReactionBar } from '@/components/pod/reaction-bar';
import { CommentSection } from '@/components/pod/comment-section';
import { Flame, Clock, Maximize2, ShieldAlert } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

interface PodFeedItemProps {
  log: CheckInLog;
}

export function PodFeedItem({ log }: PodFeedItemProps) {
  const [photoZoomOpen, setPhotoZoomOpen] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 transition-all">
      {/* Header: User Avatar, Name, Habit, Timestamp */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={log.userAvatar}
            name={log.userName}
            size="md"
            checkedInToday={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-100">
                {log.userName}
              </span>
              <Badge variant="ember" size="sm" icon={<Flame className="w-3 h-3 text-orange-500 fill-orange-500" />}>
                Checked in
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
              <span>{log.habitEmoji}</span>
              <span className="font-medium text-zinc-300">{log.habitTitle}</span>
              <span>•</span>
              <span className="text-zinc-500">{log.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Photo Attachment */}
      {log.proofImageUrl && (
        <div className="relative rounded-xl overflow-hidden mb-3 border border-zinc-800/80 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={log.proofImageUrl}
            alt={`Check-in proof for ${log.habitTitle}`}
            className="w-full max-h-72 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <button
            onClick={() => setPhotoZoomOpen(true)}
            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reflection Note */}
      {log.note && (
        <div className="mb-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-xs text-zinc-200 leading-relaxed font-normal">
          &ldquo;{log.note}&rdquo;
        </div>
      )}

      {/* Reaction Bar */}
      <ReactionBar logId={log.id} reactions={log.reactions} />

      {/* Comments Section */}
      <CommentSection logId={log.id} comments={log.comments} />

      {/* Photo Zoom Modal */}
      {log.proofImageUrl && (
        <Modal
          isOpen={photoZoomOpen}
          onClose={() => setPhotoZoomOpen(false)}
          title={`${log.userName}'s Proof for ${log.habitTitle}`}
          maxWidth="lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={log.proofImageUrl}
            alt="Proof enlarged"
            className="w-full rounded-xl object-contain max-h-[70vh]"
          />
        </Modal>
      )}
    </div>
  );
}
