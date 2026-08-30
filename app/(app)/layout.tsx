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
  const { previewMode } = useEmber();

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
        onOpenPodModal={() => setPodModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center w-full">
        {previewMode === 'mobile' ? (
          /* Mobile Simulation Container */
          <div className="py-6 px-3 flex justify-center items-start w-full">
            <div className="w-full max-w-[420px] min-h-[820px] bg-zinc-950 border-[6px] border-zinc-800 rounded-[40px] shadow-2xl shadow-black/80 overflow-hidden relative flex flex-col">
              {/* Dynamic Island / Camera Notch */}
              <div className="w-full flex justify-center pt-2 pb-1 bg-zinc-950 shrink-0 select-none">
                <div className="w-24 h-4 bg-zinc-800 rounded-full" />
              </div>

              {/* Scrollable Viewport with key={pathname} to force re-render on back navigation */}
              <div key={pathname} className="flex-1 overflow-y-auto pb-20 p-4">
                {children}
              </div>

              {/* Bottom Nav inside mobile frame */}
              <BottomNav />
            </div>
          </div>
        ) : (
          /* Responsive Desktop & Mobile View */
          <div className="flex-1 flex max-w-6xl mx-auto w-full">
            {/* Desktop Sidebar */}
            <Sidebar
              onOpenHabitModal={() => {
                setHabitToEdit(null);
                setHabitModalOpen(true);
              }}
              onOpenPodModal={() => setPodModalOpen(true)}
              onOpenShieldModal={() => setShieldModalOpen(true)}
            />

            {/* Main Viewport with key={pathname} to force re-render on back navigation */}
            <main key={pathname} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl pb-24 md:pb-12">
              {children}
            </main>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav (Visible on small screens in responsive mode) */}
      {previewMode === 'responsive' && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}

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
      />

      <StreakShieldModal
        isOpen={shieldModalOpen}
        onClose={() => setShieldModalOpen(false)}
      />

      <MilestoneCelebration />
    </div>
  );
}
