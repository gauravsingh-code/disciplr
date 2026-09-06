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
  XCircle,
  AlertTriangle,
  Zap,
  ShoppingBag,
  TrendingUp,
  Award,
  Clock,
  Lock,
  Compass,
  Rocket,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200 overflow-hidden flex flex-col">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[520px] bg-orange-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] bg-amber-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 -left-40 w-[520px] h-[520px] bg-rose-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 w-full border-b border-zinc-800/60 bg-zinc-950/75 backdrop-blur-md sticky top-0">
        <nav className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-5 h-5 text-white animate-flame" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                  Disciplr
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                  Social Growth Platform
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#why-platform" className="hover:text-zinc-200 transition-colors">
              Social Growth
            </a>
            <a href="#problem" className="hover:text-zinc-200 transition-colors">
              The Problem
            </a>
            <a href="#features" className="hover:text-zinc-200 transition-colors">
              Growth Pillars
            </a>
            <a href="#creator-store" className="hover:text-zinc-200 transition-colors">
              Creator Store
            </a>
            <a href="#comparison" className="hover:text-zinc-200 transition-colors">
              Comparison
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="glow" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Join Platform
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center">
        {/* ========================================================================= */}
        {/* HERO SECTION: SOCIAL GROWTH PLATFORM */}
        {/* ========================================================================= */}
        <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center">
          {/* Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold mb-6 animate-slide-up shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>The Social Growth Platform for High Performers</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl leading-[1.08] text-white">
            Grow faster together with{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">
              real peer accountability.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Break free from lonely checklists and toxic doomscrolling. Disciplr is the social growth platform that pairs ambitious minds in private accountability pods, backs momentum with Proof of Work, and powers peer knowledge exchange.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button variant="glow" size="lg" fullWidth rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Growing Today
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth>
                Log In to Your Pod
              </Button>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400 font-medium">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span>Private 3–8 Person Pods</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Verifiable Proof of Work</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>UCL-Backed Streak Shields</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Creator Blueprint Store</span>
            </div>
          </div>

          {/* Interactive Live Pod Pulse Preview Card */}
          <div className="mt-14 w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 text-left border border-zinc-800/80 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-100">Founders & Builders Circle</h3>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 font-semibold px-2 py-0.5 rounded-full border border-zinc-700">
                      5 Members
                    </span>
                  </div>
                  <span className="text-xs text-orange-400 font-medium">
                    All members checked in • 100% Social Growth Pulse 🔥
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
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
                        14d streak 🔥
                      </Badge>
                    </div>
                    <span className="text-[11px] text-zinc-400">🚀 Deep Work Sprint • Shipped v1.2</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Verified Proof
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                &ldquo;Completed 3 hours of deep coding and merged our payment gateway. Day 14 straight with the pod!&rdquo;
              </p>

              {/* Reactions preview */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/40">
                    🔥 4
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                    🙌 3
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                    💪 2
                  </span>
                  <span className="text-[11px] text-zinc-500 hidden sm:inline">Pod mates cheered Priya</span>
                </div>
                <span className="text-[11px] text-orange-400 font-medium">Pod Momentum High</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: WHY A SOCIAL GROWTH PLATFORM? */}
        {/* ========================================================================= */}
        <section id="why-platform" className="w-full border-t border-zinc-800/80 bg-zinc-950/60 py-24 px-6 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
                <Rocket className="w-3.5 h-3.5" />
                <span>The Social Growth Paradigm</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Growth is not a solo sport.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                When you grow alongside peers who share your ambition, your discipline ceases to be a chore and becomes your identity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar A */}
              <div className="glass-card rounded-3xl p-7 border border-zinc-800 relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">Social Capital That Matters</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Forget empty vanity follower counts. Build true reputation and deep relationships based on who consistently shows up, does the work, and supports others.
                </p>
              </div>

              {/* Pillar B */}
              <div className="glass-card rounded-3xl p-7 border border-zinc-800 relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">Collective Positive Pressure</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Behavioral economics shows that peer expectations elevate personal performance. When your pod is on a 20-day streak, you won&apos;t let excuses win.
                </p>
              </div>

              {/* Pillar C */}
              <div className="glass-card rounded-3xl p-7 border border-zinc-800 relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">Peer Knowledge Exchange</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Exchange real routines, training splits, and study playbooks with members who have already solved the challenges you currently face.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: WHAT PROBLEM WE ARE SOLVING */}
        {/* ========================================================================= */}
        <section id="problem" className="w-full border-t border-zinc-800/80 bg-zinc-950 py-24 px-6 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>The Habit Execution Crisis</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                What problem are we solving?
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Traditional habit apps leave you isolated, while conventional social networks exploit your dopamine. Here is why existing solutions fail you:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Problem 1: Solo Tracking Trap */}
              <div className="glass-card rounded-3xl p-7 border border-rose-500/20 bg-gradient-to-b from-rose-950/20 to-zinc-900/60 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">The Isolation Trap</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">Solo Apps Die in Silence</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    When you are the only person who knows you set a goal, quitting costs nothing. You download a sleek tracker, use it for 8 days, skip once, and quietly delete it. Zero social accountability equals zero staying power.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80">
                  <div className="text-xs font-semibold text-rose-300">
                    ⚠️ 92% of solo habit apps are abandoned within 14 days.
                  </div>
                </div>
              </div>

              {/* Problem 2: Social Media Trap */}
              <div className="glass-card rounded-3xl p-7 border border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-zinc-900/60 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">The Vanity Trap</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">Social Feeds Are Performative</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Traditional social platforms reward superficial staging, influencer theatrics, and vanity likes. You log in to share progress and lose 45 minutes doomscrolling algorithmic feeds designed for ad revenue, not your personal growth.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80">
                  <div className="text-xs font-semibold text-amber-300">
                    📱 Algorithmic feeds monetize your distraction, not your growth.
                  </div>
                </div>
              </div>

              {/* Problem 3: Brittle Streaks Trap */}
              <div className="glass-card rounded-3xl p-7 border border-orange-500/20 bg-gradient-to-b from-orange-950/20 to-zinc-900/60 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">The Perfectionism Trap</span>
                    <h3 className="text-xl font-bold text-zinc-100 mt-1">Brittle All-or-Nothing Streaks</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Traditional apps reset a 60-day streak to zero because of a family emergency or travel day. This triggers the psychological &ldquo;abstinence violation effect&rdquo;—once the streak resets, people give up in demoralization.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80">
                  <div className="text-xs font-semibold text-orange-300">
                    📉 Rigidity kills consistency. Growth requires resilient design.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: GROWTH PILLARS (WHY JOIN US) */}
        {/* ========================================================================= */}
        <section id="features" className="w-full py-24 px-6 relative border-t border-zinc-800/80 bg-zinc-950/60">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Social Growth Engine</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Why Join Disciplr?
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Everything you need to turn aspirations into permanent behavioral change, powered by human psychology and peer trust.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="glass-card rounded-3xl p-8 space-y-4 border border-zinc-800 hover:border-orange-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md shadow-orange-500/10">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">
                  1. High-Trust Micro-Pods (3 to 8 Members)
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Based on Dunbar&apos;s social dynamics: circles under 8 people produce maximum accountability without performative fatigue. Your pod mates notice when you show up, celebrate your breakthroughs, and notice when you slip.
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Closed intimate circles • Zero public followers • 100% private</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-card rounded-3xl p-8 space-y-4 border border-zinc-800 hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">
                  2. Social Proof of Work (PoW) Receipts
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Check in with a single tap or upload quick photo receipts—your open terminal, gym weights, or highlighted book chapter. Build undeniable credibility in your pod without endless essays or staging.
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1-tap check-in • Fast photo receipts • Real action over words</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-card rounded-3xl p-8 space-y-4 border border-zinc-800 hover:border-indigo-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/10">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">
                  3. UCL Research-Backed Streak Shields
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Dr. Phillippa Lally&apos;s habit research at University College London proves that an occasional missed day does not disrupt long-term habit formation. Two weekly shields forgive life emergencies and protect your psychological momentum.
                </p>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2 weekly streak shields • Psychological resilience • No demoralizing resets</span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="glass-card rounded-3xl p-8 space-y-4 border border-zinc-800 hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">
                  4. Supportive Social Cheer Culture
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Celebrate each other with lightweight reaction chips (🔥👏💪🙌) and concise 200-character supportive notes. No algorithmic outrage, no flame wars—just pure mutual elevation.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero toxic trolling • Pure positive reinforcement • Team pulse synergy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: CREATOR STORE / RESOURCE MARKETPLACE */}
        {/* ========================================================================= */}
        <section id="creator-store" className="w-full py-24 px-6 border-t border-zinc-800/80 bg-zinc-950">
          <div className="max-w-5xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-orange-500/20 bg-gradient-to-b from-orange-950/20 via-zinc-900/60 to-zinc-950 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Creator Store & Peer Marketplace</span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Exchange battle-tested blueprints. Share your knowledge or monetize.
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Why start from scratch? Browse habit guides, fitness routines, and study systems crafted by top creators. Creators and coaches can upload resources for free or sell them directly to the community.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-orange-400" />
                      <span>Workout Splits</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-orange-400" />
                      <span>Deep Work Systems</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-orange-400" />
                      <span>Study & Coding Roadmaps</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
                  <Link href="/signup">
                    <Button variant="glow" size="lg" fullWidth rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Join as Creator or Member
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: COMPARISON MATRIX */}
        {/* ========================================================================= */}
        <section id="comparison" className="w-full py-24 px-6 border-t border-zinc-800/80 bg-zinc-950/80">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-orange-400" />
                <span>The Platform Advantage</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                How Disciplr Compares
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                See why a dedicated social growth platform outperforms solo apps and traditional feeds across every dimension.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[650px] glass-panel rounded-3xl border border-zinc-800/90 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-4 p-5 bg-zinc-900/80 border-b border-zinc-800 font-bold text-xs sm:text-sm text-zinc-300">
                  <div>Dimensions</div>
                  <div className="text-zinc-400">Solo Habit Apps</div>
                  <div className="text-zinc-400">Traditional Social Feeds</div>
                  <div className="text-orange-400 flex items-center gap-1.5 font-extrabold">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Disciplr Platform</span>
                  </div>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-4 p-5 border-b border-zinc-800/60 text-xs sm:text-sm items-center hover:bg-zinc-900/40 transition-colors">
                  <div className="font-semibold text-zinc-200">Social Dimension</div>
                  <div className="text-zinc-400">Isolated & Lonely</div>
                  <div className="text-zinc-400">Performative Clout & Ads</div>
                  <div className="text-emerald-400 font-semibold">High-Trust Growth Pods</div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-4 p-5 border-b border-zinc-800/60 text-xs sm:text-sm items-center hover:bg-zinc-900/40 transition-colors">
                  <div className="font-semibold text-zinc-200">Accountability</div>
                  <div className="text-zinc-400">Zero (Nobody notices)</div>
                  <div className="text-zinc-400">Passive likes from strangers</div>
                  <div className="text-emerald-400 font-semibold">Real peers checking daily</div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-4 p-5 border-b border-zinc-800/60 text-xs sm:text-sm items-center hover:bg-zinc-900/40 transition-colors">
                  <div className="font-semibold text-zinc-200">Streak Resilience</div>
                  <div className="text-zinc-400">1 Miss = Reset to 0</div>
                  <div className="text-zinc-400">No habit tracking</div>
                  <div className="text-emerald-400 font-semibold">2 Weekly Streak Shields</div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-4 p-5 border-b border-zinc-800/60 text-xs sm:text-sm items-center hover:bg-zinc-900/40 transition-colors">
                  <div className="font-semibold text-zinc-200">Proof Verification</div>
                  <div className="text-zinc-400">Unchecked checkboxes</div>
                  <div className="text-zinc-400">Filtered selfies</div>
                  <div className="text-emerald-400 font-semibold">1-Tap Proof of Work</div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-4 p-5 text-xs sm:text-sm items-center hover:bg-zinc-900/40 transition-colors">
                  <div className="font-semibold text-zinc-200">Knowledge Exchange</div>
                  <div className="text-zinc-400">None</div>
                  <div className="text-zinc-400">Scattered influencer reels</div>
                  <div className="text-emerald-400 font-semibold">Creator Blueprint Store</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CTA SECTION */}
        {/* ========================================================================= */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20">
          <div className="relative rounded-3xl glass-panel border border-orange-500/30 p-8 sm:p-14 text-center overflow-hidden ember-glow">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/15 via-amber-600/10 to-rose-600/15 pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-500 to-rose-500 mx-auto flex items-center justify-center shadow-xl shadow-orange-500/30">
                <Flame className="w-8 h-8 text-white animate-flame" />
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to accelerate your growth with a pod?
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Join ambitious builders, athletes, and students who leveled up by replacing broken solo habits with genuine peer accountability.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button variant="glow" size="lg" fullWidth rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Join the Social Growth Platform
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" fullWidth>
                    Log In to Your Account
                  </Button>
                </Link>
              </div>

              <p className="text-[11px] text-zinc-500 pt-2">
                Free for personal pods • Zero algorithms • 100% Focused on Real Growth
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 py-12 px-6 text-xs text-zinc-500 bg-zinc-950">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-zinc-300">Disciplr</span>
              <span className="text-zinc-500 ml-2">• The Social Growth Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/login" className="hover:text-zinc-200 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="hover:text-zinc-200 transition-colors">
              Join Platform
            </Link>
          </div>

          <p>© 2026 Disciplr. The Social Growth Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
