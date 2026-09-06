'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  Download,
  DollarSign,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  Flame,
  Layers,
  Star,
  Tag,
  ShieldCheck,
  FileText,
  Clock,
  Heart,
  ExternalLink,
  Plus,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useEmber } from '@/context/ember-context';

interface MockResource {
  id: string;
  title: string;
  description: string;
  category: 'Protocols' | 'Deep Work' | 'Fitness' | 'Mindset' | 'Pod Bundles';
  author: {
    name: string;
    avatar: string;
    streak: number;
    badge: string;
  };
  price: number; // 0 = Free
  format: string;
  downloads: number;
  rating: number;
  tags: string[];
}

const MOCK_RESOURCES: MockResource[] = [
  {
    id: 'res-1',
    title: 'The 75-Day Unbreakable Discipline Blueprint',
    description:
      'A battle-tested daily execution matrix covering morning physicals, zero-sugar diet tracking, and dual 45-min workout checkpoints.',
    category: 'Protocols',
    author: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      streak: 92,
      badge: 'Century Club',
    },
    price: 0,
    format: 'PDF Guide + Notion Template',
    downloads: 1420,
    rating: 4.9,
    tags: ['Accountability', 'Fitness', 'Habit Matrix'],
  },
  {
    id: 'res-2',
    title: 'Deep Work Engine: 90-Minute Focus Rituals',
    description:
      'Eliminate phone distractions and structure high-cognitive output blocks with custom audio prompts and transition checklists.',
    category: 'Deep Work',
    author: {
      name: 'Dr. Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      streak: 64,
      badge: 'Mindset Lead',
    },
    price: 249,
    format: 'Audio Guide + Obsidian Canvas',
    downloads: 890,
    rating: 5.0,
    tags: ['Flow State', 'ADHD-Friendly', 'Productivity'],
  },
  {
    id: 'res-3',
    title: 'Dopamine Reset & Circadian Sleep Architecture',
    description:
      'Step-by-step protocol to reset screen addiction, optimize morning sunlight capture, and fall asleep within 12 minutes every night.',
    category: 'Mindset',
    author: {
      name: 'Kavita Iyer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      streak: 45,
      badge: 'Wellness Pro',
    },
    price: 0,
    format: 'Printable Tracker + PDF',
    downloads: 2150,
    rating: 4.8,
    tags: ['Sleep', 'Screen Fasting', 'Recovery'],
  },
  {
    id: 'res-4',
    title: 'Pod Sprint Accelerator (Squad Challenge Pack)',
    description:
      'Turn your 3-8 person Pod into a competitive sprint league. Includes weekly stakes sheets, flex card themes, and peer penalty rules.',
    category: 'Pod Bundles',
    author: {
      name: 'Jordan Miller',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      streak: 110,
      badge: 'Pod Founder',
    },
    price: 399,
    format: 'Interactive Pod Config + Assets',
    downloads: 640,
    rating: 4.95,
    tags: ['Pod Challenge', 'Gamification', 'Stakes'],
  },
];

const CATEGORIES = [
  'All',
  'Protocols',
  'Deep Work',
  'Fitness',
  'Mindset',
  'Pod Bundles',
] as const;

export default function ResourcesPage() {
  const { user } = useEmber();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<MockResource | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');

  const filteredResources = MOCK_RESOURCES.filter((res) => {
    const matchesCategory =
      selectedCategory === 'All' || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail && !user?.email) return;
    setIsWaitlistSubmitted(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Banner with Ambient Glow */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-b from-orange-950/20 via-zinc-900/60 to-zinc-950 p-6 sm:p-10 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          {/* Coming Soon Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            <span>Resource Hub & Creator Exchange</span>
            <span className="text-zinc-500">•</span>
            <span className="text-orange-400 font-bold uppercase tracking-wider text-[10px]">
              Coming Soon
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100 leading-tight">
            Share Your Blueprint.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
              Empower Others.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed">
            A peer-to-peer marketplace where disciplined builders upload habit routines,
            printable trackers, Notion templates, and challenges. Distribute for free or
            monetize your systems.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Upload a Resource (Preview)
            </Button>

            <a
              href="#waitlist"
              className="px-4 py-2.5 rounded-xl border border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Join Creator Waitlist
            </a>
          </div>
        </div>
      </div>

      {/* Purpose of This Menu / Tab */}
      <div className="rounded-3xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/30 via-zinc-900/80 to-purple-950/20 p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span>
            <span>Purpose of This Tab</span>
          </div>
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
            Peer-to-Peer Knowledge & Creator Economy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Creator Side */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <UploadCloud className="w-4 h-4" />
              <h4>1. Creators Share & Sell Resources</h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Anyone can upload battle-tested habit protocols, workout blueprints, Notion workspaces, or PDF guides. You choose the model: share it <strong>100% free</strong> to build your influence, or <strong>sell it for a custom price</strong> (e.g. ₹199 / $2.99) to earn directly from your systems.
            </p>
          </div>

          {/* Buyer / Member Side */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Download className="w-4 h-4" />
              <h4>2. Members Take Free or Buy Premium</h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Browse top-rated resources built by 100+ day streak leaders. If a resource is <strong>free, claim it instantly with 0 cost</strong>. If paid, complete secure checkout with 1 tap. Every claimed resource can be imported directly into your personal habits and Pod challenges.
            </p>
          </div>
        </div>

        {/* Workflow Steps Indicator */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[10px]">1</span>
            <span>Upload Resource</span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">→</span>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">2</span>
            <span>Set Price (Free or ₹)</span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">→</span>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">3</span>
            <span>Community Claims or Buys</span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">→</span>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-[10px]">4</span>
            <span>Import to Pod Habits</span>
          </div>
        </div>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 relative group hover:border-orange-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-100 mb-1">Upload in Minutes</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Upload PDFs, Notion workspace links, audio prompts, or habit packs. Your content, your rules.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 relative group hover:border-amber-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-100 mb-1">Free or Custom Price</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Offer your resources 100% free to give back to the community, or monetize with instant 1-tap checkout.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-zinc-800/80 relative group hover:border-rose-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-100 mb-1">Direct Pod Integration</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Members can auto-import bought or claimed blueprints directly into their daily Disciplr habits with 1 tap.
          </p>
        </div>
      </div>

      {/* Interactive Catalog Preview Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              Explore Marketplace Catalog (Preview)
            </h2>
            <p className="text-xs text-zinc-400">
              Browse templates and blueprints from top creators in the network.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blueprints & guides..."
              className="w-full pl-9 pr-3.5 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="glass-card rounded-2xl p-5 border border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-all group"
          >
            <div className="space-y-3">
              {/* Card Header: Category & Price Badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-zinc-900/80 text-[11px] font-medium border-zinc-700 text-zinc-300"
                >
                  {res.category}
                </Badge>

                {res.price === 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    Free
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-tight">
                    ₹{res.price}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-orange-300 transition-colors line-clamp-1">
                  {res.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                  {res.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {res.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-zinc-900 text-[10px] text-zinc-400 border border-zinc-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer: Author & Action Button */}
            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Avatar src={res.author.avatar} name={res.author.name} size="xs" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{res.author.name}</p>
                  <p className="text-[10px] text-orange-400 font-mono flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {res.author.streak}d streak
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setSelectedResource(res)}
                variant="outline"
                className="text-xs border-zinc-700 bg-zinc-900/60 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
              >
                {res.price === 0 ? 'Claim Free (Preview)' : 'Buy (Preview)'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Creator Waitlist / Notification Callout */}
      <div
        id="waitlist"
        className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-900 to-zinc-950 p-6 sm:p-8 shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Be the First to Publish on Disciplr
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Are you a pod creator or high-streak habit builder? Sign up for our Creator Beta.
              You will get zero commission fees for the first 6 months and verified creator status.
            </p>
          </div>

          {isWaitlistSubmitted ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>You are on the creator early access list!</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder={user?.email || 'Enter your email...'}
                className="px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
              />
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shrink-0"
              >
                Join Waitlist
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Creator Upload Blueprint Preview Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Upload a Resource</h3>
                  <p className="text-xs text-zinc-400">Creator Portal Preview</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Resource Title</label>
                <input
                  type="text"
                  placeholder="e.g. 30-Day Morning Cold Plunge & Breathwork Protocol"
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Category</label>
                  <select className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-orange-500">
                    <option>Protocols</option>
                    <option>Deep Work</option>
                    <option>Fitness</option>
                    <option>Mindset</option>
                    <option>Pod Bundles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Pricing Model</label>
                  <select className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-orange-500">
                    <option>100% Free (Community)</option>
                    <option>Paid (₹199 / $2.49)</option>
                    <option>Paid (₹499 / $5.99)</option>
                    <option>Paid (₹999 / $11.99)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Upload File or External Link</label>
                <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-6 text-center hover:border-orange-500 transition-colors cursor-pointer bg-zinc-950/40">
                  <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="font-semibold text-zinc-200">Drag and drop your PDF, Notion export, or template</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Supports PDF, ZIP, Markdown, JSON, MP3 up to 50MB</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] leading-relaxed">
                🚀 <strong>Creator Portal Status:</strong> The full publishing pipeline and payout setup is launching soon. Pre-register your interest above to be among the first creators featured on the home carousel!
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-xs border-zinc-700"
              >
                Close Preview
              </Button>
              <Button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setIsWaitlistSubmitted(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
              >
                Notify Me on Launch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Detail & Purchase Preview Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-[10px]">
                    {selectedResource.category}
                  </Badge>
                  {selectedResource.price === 0 ? (
                    <span className="text-emerald-400 text-xs font-bold uppercase">Free Resource</span>
                  ) : (
                    <span className="text-orange-400 text-xs font-bold">₹{selectedResource.price}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-zinc-100">{selectedResource.title}</h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-zinc-300 leading-relaxed">{selectedResource.description}</p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Deliverable Format</span>
                  <span className="font-semibold text-zinc-200">{selectedResource.format}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Downloads & Rating</span>
                  <span className="font-semibold text-zinc-200">
                    ⭐ {selectedResource.rating} ({selectedResource.downloads} claimed)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800">
                <Avatar
                  src={selectedResource.author.avatar}
                  name={selectedResource.author.name}
                  size="sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-200 text-xs">
                      {selectedResource.author.name}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Verified Creator • {selectedResource.author.streak}-Day Active Streak
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                ⏳ <strong>Checkout Integration:</strong> Instant Razorpay purchase and 1-tap download links will activate as soon as the Resource Hub officially launches!
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedResource(null)}
                className="text-xs border-zinc-700"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setSelectedResource(null);
                  setIsWaitlistSubmitted(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
              >
                Join Waitlist for This Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
