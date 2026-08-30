'use client';

import React, { useState } from 'react';
import { Pod } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, Users, ShieldCheck, Plus } from 'lucide-react';

interface PodInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pod?: Pod | null;
}

export function PodInviteModal({
  isOpen,
  onClose,
  pod,
}: PodInviteModalProps) {
  const { createPod, joinPodByCode, activePod } = useEmber();
  const targetPod = pod || activePod;

  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'invite' | 'join' | 'create'>('invite');

  // Join State
  const [joinCode, setJoinCode] = useState('');
  const [joinStatus, setJoinStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Create State
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🔥');
  const [newDescription, setNewDescription] = useState('');

  const inviteLink = targetPod
    ? `https://disciplr.app/join/${targetPod.inviteCode}`
    : 'https://disciplr.app/join';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const res = joinPodByCode(joinCode);
    setJoinStatus(res);
    if (res.success) {
      setTimeout(() => {
        onClose();
        setJoinStatus(null);
        setJoinCode('');
      }, 1200);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createPod({
      name: newName,
      emoji: newEmoji,
      description: newDescription || 'Daily accountability circle.',
    });
    onClose();
    setNewName('');
    setNewDescription('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-400" />
          <span>Growth Network Circles</span>
        </div>
      }
      description="Disciplr Growth Networks are intentionally small (3–8 people) for high trust and zero performance pressure."
    >
      {/* Tabs */}
      <div className="flex bg-zinc-800/80 p-1 rounded-xl mb-4 border border-zinc-700/60">
        <button
          type="button"
          onClick={() => setTab('invite')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            tab === 'invite'
              ? 'bg-zinc-900 text-orange-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Invite Friends
        </button>
        <button
          type="button"
          onClick={() => setTab('join')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            tab === 'join'
              ? 'bg-zinc-900 text-orange-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Join via Code
        </button>
        <button
          type="button"
          onClick={() => setTab('create')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            tab === 'create'
              ? 'bg-zinc-900 text-orange-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Create New Pod
        </button>
      </div>

      {/* Tab 1: Invite */}
      {tab === 'invite' && targetPod && (
        <div className="space-y-4 animate-scale-in">
          <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-xs">
            <div className="flex items-center justify-between font-bold text-zinc-100">
              <span className="flex items-center gap-2">
                <span className="text-base">{targetPod.emoji}</span>
                <span>{targetPod.name}</span>
              </span>
              <span className="text-orange-400">
                {targetPod.members.length} / {targetPod.maxMembers} members
              </span>
            </div>
            <p className="text-zinc-400 mt-1">{targetPod.description}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Shareable Invite Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-300 select-all"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-zinc-300 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <span>
              <strong>Closed & Private:</strong> Strangers cannot search or browse this Pod. Only people with your invite link can join.
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Join by code */}
      {tab === 'join' && (
        <form onSubmit={handleJoin} className="space-y-4 animate-scale-in">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Enter Invite Code or Link
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="e.g. EMBER-DAWN-88 or READ-CALM-42"
              required
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 uppercase font-mono"
            />
          </div>

          {joinStatus && (
            <div
              className={`p-3 rounded-xl text-xs ${
                joinStatus.success
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {joinStatus.message}
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth>
            Join Pod
          </Button>
        </form>
      )}

      {/* Tab 3: Create Pod */}
      {tab === 'create' && (
        <form onSubmit={handleCreate} className="space-y-3.5 animate-scale-in">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Pod Name & Emoji
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-12 text-center text-lg p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100"
                maxLength={2}
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. 6AM Workout Squad, Thesis Writers"
                required
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Short Focus Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What are members holding each other accountable for?"
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 resize-none focus:outline-none focus:border-orange-500"
            />
          </div>

          <Button type="submit" variant="glow" fullWidth leftIcon={<Plus className="w-4 h-4" />}>
            Create Pod (Max 8 Members)
          </Button>
        </form>
      )}
    </Modal>
  );
}
