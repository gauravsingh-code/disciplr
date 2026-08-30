'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  Shield,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Camera,
  HeartHandshake,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200 overflow-hidden flex flex-col">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 w-full max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            Disciplr
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign Up
            </Button>
          </Link>
          <Link href="/today" className="hidden sm:inline-block">
            <Button variant="outline" size="sm">
              Demo
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-6 pt-12 pb-24 text-center flex flex-col items-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold mb-6 animate-slide-up shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Growth Network for Small Circles (3–8 People)</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl leading-[1.1] text-white">
          Build habits with people who{' '}
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">
            actually care.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Proof of work over public noise. Check in with one tap, share lightweight proof with your Growth Network, and stay consistent with forgiving streak shields.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="glow" size="lg" fullWidth rightIcon={<ArrowRight className="w-5 h-5" />}>
              Join Growth Network
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" fullWidth>
              Log In to Pod
            </Button>
          </Link>
          <Link href="/today" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" fullWidth leftIcon={<Flame className="w-5 h-5 text-orange-400" />}>
              Explore Demo
            </Button>
          </Link>
        </div>

        {/* Interactive App Teaser Card */}
        <div className="mt-14 w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 text-left border border-zinc-800/80 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌅</span>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Dawn Patrol Pod</h3>
                <span className="text-xs text-orange-400 font-medium">
                  4 of 4 checked in today (100% Pulse)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="shield" size="sm">
                2 Shields Left
              </Badge>
            </div>
          </div>

          {/* Sample Check-In Feed Item */}
          <div className="mt-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar
                  name="Priya Sharma"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80"
                  size="sm"
                  checkedInToday={true}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">Priya Sharma</span>
                    <Badge variant="ember" size="sm">
                      12d streak 🔥
                    </Badge>
                  </div>
                  <span className="text-[11px] text-zinc-400">🧘‍♀️ Morning Vinyasa • 45m ago</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              &ldquo;Finished 45 mins before work emails flooded in! Feeling energized.&rdquo;
            </p>

            {/* Reactions preview */}
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60">
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/40">
                🔥 3
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                🙌 2
              </span>
              <span className="text-[11px] text-zinc-500">Jordan & Wei cheered</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Section */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full">
          <div className="glass-card rounded-3xl p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Pods, Not Followers</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Closed circles of 3–8 trusted friends. No algorithm, no public discoverability, no vanity metric chasing.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Forgiving Streak Shields</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Backed by habit formation research (UCL). Missing a single day never resets your momentum to zero.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Proof, Not Performance</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              1-tap check-in by default. Optional lightweight photo proof and notes in 2 taps without social fatigue.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Encouragement First</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Lightweight reactions (🔥👏💪🙌) and supportive 200-character comments. Zero guilt or doom copy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 py-8 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-zinc-400">Disciplr • Growth Network</span>
          </div>
          <p>© 2026 Disciplr Growth Network. All habits private by default.</p>
        </div>
      </footer>
    </div>
  );
}
