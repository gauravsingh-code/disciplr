'use client';

import React, { useState } from 'react';
import { useEmber } from '@/context/ember-context';
import { PodPulse } from '@/components/pod/pod-pulse';
import { PodFeedItem } from '@/components/pod/pod-feed-item';
import { PodInviteModal } from '@/components/pod/pod-invite-modal';
import { Users, Flame, Plus, ShieldCheck, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

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

  const currentPod = activePod || pods[0] || null;

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
        />
      </div>
    );
  }

  // Filter feed logs for this pod or member
  const podFeedLogs = feedLogs.filter((log) => {
    if (selectedMemberId) {
      return log.userId === selectedMemberId;
    }
    // Check if the log belongs to any member of this active Pod
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

      {/* Chronological Feed Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Chronological Pod Stream</span>
          </h3>
          <span className="text-[11px] text-zinc-500">
            No algorithms • Closed circle
          </span>
        </div>

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

      {/* Invite Modal */}
      <PodInviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        pod={activePod}
      />
    </div>
  );
}
