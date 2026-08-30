'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEmber } from '@/context/ember-context';
import { HABIT_TEMPLATES } from '@/lib/mock-data';
import {
  Flame,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowRight,
  UserCheck,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUserProfile, createHabit, createPod, joinPodByCode } = useEmber();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account & Age
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(true);

  // Step 2: First Habit
  const [habitTitle, setHabitTitle] = useState('Morning Movement (Run / Gym)');
  const [habitEmoji, setHabitEmoji] = useState('🏃‍♂️');
  const [reminderTime, setReminderTime] = useState('07:00 AM');

  // Step 3: Pod Selection
  const [podChoice, setPodChoice] = useState<'create' | 'join' | 'solo'>('create');
  const [podName, setPodName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const handleComplete = () => {
    // 1. Update user profile
    updateUserProfile({
      name,
      username,
      ageVerified: ageConfirmed,
    });

    // 2. Create the first habit
    const createdHabit = createHabit({
      title: habitTitle,
      emoji: habitEmoji,
      frequency: { type: 'daily' },
      reminderTime,
      isPrivate: podChoice === 'solo',
      sharedPodIds: [],
    });

    // 3. Handle Pod
    if (podChoice === 'create') {
      createPod({
        name: podName || 'Daily Focus Pod',
        emoji: '🌅',
        description: 'Accountability circle for daily momentum.',
      });
    } else if (podChoice === 'join' && joinCode.trim()) {
      joinPodByCode(joinCode.trim());
    }

    router.push('/today');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Disciplr
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Build habits with small, trusted Growth Networks.
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-gradient-to-r from-orange-500 to-amber-400'
                    : s < step
                    ? 'w-4 bg-orange-500/40'
                    : 'w-4 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* STEP 1: Account & 16+ Gate */}
          {step === 1 && (
            <div className="space-y-5 animate-scale-in">
              <div>
                <h2 className="text-xl font-bold text-white">Create your profile</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Visible only to members of Pods you join. No public search.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Jordan Miller"
                    className="w-full px-3.5 py-2.5 bg-zinc-800/90 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Username
                  </label>
                  <div className="flex items-center bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 focus-within:border-orange-500">
                    <span className="text-zinc-500 text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="jordan_builds"
                      className="w-full py-2.5 pl-1 bg-transparent text-sm text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 16+ Age Gate Guardrail */}
                <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded accent-orange-500"
                  />
                  <div>
                    <span className="font-bold text-orange-300">
                      Age Confirmation (16+)
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      I confirm I am at least 16 years old to use Disciplr and participate in photo check-ins.
                    </p>
                  </div>
                </label>
              </div>

              <Button
                variant="primary"
                fullWidth
                disabled={!name || !username || !ageConfirmed}
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to First Habit
              </Button>
            </div>
          )}

          {/* STEP 2: First Habit */}
          {step === 2 && (
            <div className="space-y-5 animate-scale-in">
              <div>
                <h2 className="text-xl font-bold text-white">Choose your first habit</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Start with one keystone daily ritual. You can add more anytime.
                </p>
              </div>

              {/* Template selection chips */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Popular Keystone Habits
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HABIT_TEMPLATES.slice(0, 4).map((tmpl) => (
                    <button
                      key={tmpl.title}
                      type="button"
                      onClick={() => {
                        setHabitTitle(tmpl.title);
                        setHabitEmoji(tmpl.emoji);
                        setReminderTime(tmpl.defaultTime);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        habitTitle === tmpl.title
                          ? 'bg-orange-500/15 border-orange-500/50 text-orange-300 shadow-sm'
                          : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700/60'
                      }`}
                    >
                      <span className="text-lg block mb-1">{tmpl.emoji}</span>
                      <span className="text-xs font-bold line-clamp-1">
                        {tmpl.title.split(' (')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Name & Reminder */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Habit Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={habitEmoji}
                      onChange={(e) => setHabitEmoji(e.target.value)}
                      className="w-12 text-center text-lg p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100"
                    />
                    <input
                      type="text"
                      value={habitTitle}
                      onChange={(e) => setHabitTitle(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    Preferred Daily Reminder
                  </label>
                  <input
                    type="text"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" fullWidth onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={!habitTitle.trim()}
                  onClick={() => setStep(3)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next: Form a Pod
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Pod Setup */}
          {step === 3 && (
            <div className="space-y-5 animate-scale-in">
              <div>
                <h2 className="text-xl font-bold text-white">Join or create a Pod</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Research shows having 2–3 people around a habit doubles consistency.
                </p>
              </div>

              {/* 3 Options */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setPodChoice('create')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    podChoice === 'create'
                      ? 'bg-orange-500/15 border-orange-500/50 shadow-sm'
                      : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                      <span>🌅</span>
                      <span>Create a new Pod (3–8 people)</span>
                    </span>
                    {podChoice === 'create' && <Check className="w-4 h-4 text-orange-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Get an instant invite link to share with friends, gym buddies, or study partners.
                  </p>
                </button>

                {podChoice === 'create' && (
                  <div className="pl-4 pt-1 animate-slide-up">
                    <input
                      type="text"
                      value={podName}
                      onChange={(e) => setPodName(e.target.value)}
                      placeholder="Pod Name, e.g. Dawn Patrol"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPodChoice('join')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    podChoice === 'join'
                      ? 'bg-orange-500/15 border-orange-500/50 shadow-sm'
                      : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                      <span>🔗</span>
                      <span>I have an invite code or link</span>
                    </span>
                    {podChoice === 'join' && <Check className="w-4 h-4 text-orange-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Join an existing circle created by a friend.
                  </p>
                </button>

                {podChoice === 'join' && (
                  <div className="pl-4 pt-1 animate-slide-up">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Paste code: e.g. EMBER-DAWN-88"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono uppercase focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPodChoice('solo')}
                  className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    podChoice === 'solo'
                      ? 'bg-zinc-800 border-zinc-600'
                      : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-xs font-semibold text-zinc-300">
                    Start solo for now (invite friends later)
                  </span>
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" fullWidth onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="glow"
                  fullWidth
                  onClick={handleComplete}
                  rightIcon={<Flame className="w-4 h-4 text-white" />}
                >
                  Enter Ember 🔥
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
