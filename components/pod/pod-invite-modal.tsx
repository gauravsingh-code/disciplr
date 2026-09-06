'use client';

import React, { useState, useCallback } from 'react';
import { Pod } from '@/types/ember';
import { useEmber } from '@/context/ember-context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  Copy,
  Check,
  Users,
  ShieldCheck,
  Plus,
  Search,
  Loader2,
  Key,
} from 'lucide-react';

interface PodInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pod?: Pod | null;
  initialMode?: 'invite_only' | 'join_create';
}

interface SearchedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export function PodInviteModal({
  isOpen,
  onClose,
  pod,
  initialMode,
}: PodInviteModalProps) {
  const { createPod, joinPodByCode, activePod } = useEmber();
  const targetPod = pod || activePod;

  const [tab, setTab] = useState<'invite' | 'join' | 'create'>(
    initialMode === 'invite_only' ? 'invite' : 'join'
  );

  // Sync tab whenever modal opens or initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialMode === 'invite_only') {
        setTab('invite');
      } else if (initialMode === 'join_create') {
        setTab('join');
      }
    }
  }, [isOpen, initialMode]);

  // ── Invite tab state ──────────────────────────────────────────────────────
  const [codeCopied, setCodeCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);

  const handleCopyCode = () => {
    if (!targetPod) return;
    navigator.clipboard.writeText(targetPod.inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    setSelectedUser(null);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.users ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // ── Join tab state ────────────────────────────────────────────────────────
  const [joinCode, setJoinCode] = useState('');
  const [joinStatus, setJoinStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // ── Create tab state ──────────────────────────────────────────────────────
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🔥');
  const [newDescription, setNewDescription] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const res = await joinPodByCode(joinCode);
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
          <span>
            {initialMode === 'invite_only' ? 'Invite to Pod' : 'Join or Create a Pod'}
          </span>
        </div>
      }
      description={
        initialMode === 'invite_only'
          ? 'Share your invite code or find a member by name.'
          : 'Disciplr Growth Networks are intentionally small (3–8 people) for high trust and zero performance pressure.'
      }
    >
      {/* Tabs — only shown when not invite_only */}
      {initialMode !== 'invite_only' && (
        <div className="flex bg-zinc-800/80 p-1 rounded-xl mb-4 border border-zinc-700/60">
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
      )}

      {/* ── Tab: Invite ───────────────────────────────────────────────────── */}
      {tab === 'invite' && targetPod && (
        <div className="space-y-4 animate-scale-in">
          {/* Pod info pill */}
          <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-zinc-100">
              <span className="text-base">{targetPod.emoji}</span>
              <span>{targetPod.name}</span>
            </span>
            <span className="text-orange-400 font-semibold">
              {targetPod.members.length} / {targetPod.maxMembers} members
            </span>
          </div>

          {/* Invite Code block */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-orange-400" />
              Invite Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 bg-zinc-900 border border-orange-500/30 rounded-xl font-mono text-sm font-bold text-orange-300 tracking-widest select-all text-center">
                {targetPod.inviteCode}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyCode}
                leftIcon={codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {codeCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Share this code with someone — they enter it to join your pod.
            </p>
          </div>

          {/* Search by username */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              Find by Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type a name or @username..."
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 pr-9"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
              )}
            </div>

            {/* Search results */}
            {searchResults.length > 0 && !selectedUser && (
              <div className="mt-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900 overflow-hidden divide-y divide-zinc-800/60">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setSearchResults([]);
                      setSearchQuery(u.name);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                  >
                    <Avatar src={u.avatar} name={u.name} size="xs" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-100">{u.name}</p>
                      <p className="text-[11px] text-zinc-500">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected user — show the code to share */}
            {selectedUser && (
              <div className="mt-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar src={selectedUser.avatar} name={selectedUser.name} size="xs" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-100">{selectedUser.name}</p>
                    <p className="text-[11px] text-zinc-500">@{selectedUser.username}</p>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Ask <span className="text-zinc-200 font-semibold">{selectedUser.name}</span> to enter this invite code:
                </p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 font-mono text-xs font-bold text-orange-300 tracking-widest border border-zinc-800 text-center">
                    {targetPod.inviteCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 cursor-pointer text-zinc-300 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedUser(null); setSearchQuery(''); }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer underline"
                >
                  Clear selection
                </button>
              </div>
            )}

            {/* No results */}
            {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && !selectedUser && (
              <p className="text-[11px] text-zinc-500 mt-1.5">No users found for &quot;{searchQuery}&quot;</p>
            )}
          </div>

          {/* Privacy notice */}
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-zinc-300 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <span>
              <strong>Closed &amp; Private:</strong> Strangers cannot search or browse this Pod. Only people with your invite code can join.
            </span>
          </div>
        </div>
      )}

      {/* ── Tab: Join by code ─────────────────────────────────────────────── */}
      {tab === 'join' && (
        <form onSubmit={handleJoin} className="space-y-4 animate-scale-in">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Enter Invite Code
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="e.g. EMBER-DAWN-88"
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

      {/* ── Tab: Create pod ───────────────────────────────────────────────── */}
      {tab === 'create' && (
        <form onSubmit={handleCreate} className="space-y-3.5 animate-scale-in">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Pod Name &amp; Emoji
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
                placeholder="e.g. 6AM Workout Squad"
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
