'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/navigation/app-header';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { Sidebar } from '@/components/navigation/sidebar';
import { HabitModal } from '@/components/habits/habit-modal';
import { ProofModal } from '@/components/habits/proof-modal';
import { PodInviteModal } from '@/components/pod/pod-invite-modal';
import { StreakShieldModal } from '@/components/gamification/streak-shield-card';
import { MilestoneCelebration } from '@/components/gamification/milestone-celebration';
import { useEmber } from '@/context/ember-context';
import { Habit } from '@/types/ember';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Guard against browser back-forward cache (bfcache) after signout
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetch('/api/auth/me')
          .then((res) => {
            if (!res.ok) {
              window.location.replace('/login');
            }
          })
          .catch(() => {
            window.location.replace('/login');
          });
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofTargetHabit, setProofTargetHabit] = useState<Habit | null>(null);

  const [podModalOpen, setPodModalOpen] = useState(false);
  const [podModalMode, setPodModalMode] = useState<'invite_only' | 'join_create'>('invite_only');
  const [shieldModalOpen, setShieldModalOpen] = useState(false);

  const handleOpenEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setHabitModalOpen(true);
  };

  const handleOpenProofModal = (habit: Habit) => {
    setProofTargetHabit(habit);
    setProofModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      {/* Top Header */}
      <AppHeader
        onOpenShieldModal={() => setShieldModalOpen(true)}
        onOpenPodModal={() => {
          setPodModalMode('join_create');
          setPodModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center w-full">
        <div className="flex-1 flex max-w-6xl mx-auto w-full">
          {/* Desktop Sidebar */}
          <Sidebar
            onOpenHabitModal={() => {
              setHabitToEdit(null);
              setHabitModalOpen(true);
            }}
            onOpenPodModal={() => {
              setPodModalMode('invite_only');
              setPodModalOpen(true);
            }}
            onOpenShieldModal={() => setShieldModalOpen(true)}
          />

          {/* Main Viewport */}
          <main key={pathname} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl pb-24 md:pb-12">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav (Visible on mobile screens) */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Global Modals */}
      <HabitModal
        isOpen={habitModalOpen}
        onClose={() => {
          setHabitModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
      />

      <ProofModal
        isOpen={proofModalOpen}
        onClose={() => {
          setProofModalOpen(false);
          setProofTargetHabit(null);
        }}
        habit={proofTargetHabit}
      />

      <PodInviteModal
        isOpen={podModalOpen}
        onClose={() => setPodModalOpen(false)}
        initialMode={podModalMode}
      />

      <StreakShieldModal
        isOpen={shieldModalOpen}
        onClose={() => setShieldModalOpen(false)}
      />

      <MilestoneCelebration />
    </div>
  );
}
