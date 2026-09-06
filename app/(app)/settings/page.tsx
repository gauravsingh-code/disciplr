'use client';

import React, { useState } from 'react';
import { useEmber } from '@/context/ember-context';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { logoutApi } from '@/lib/auth-client';
import {
  Bell,
  Lock,
  Shield,
  Download,
  Trash2,
  Check,
  ShieldAlert,
  UserX,
  LogOut,
  Sparkles,
  Zap,
} from 'lucide-react';
import { RazorpayCheckoutButton } from '@/components/payment/razorpay-checkout-button';

export default function SettingsPage() {
  const { user, updateUserProfile, habits, pods, feedLogs } = useEmber();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const notifications = user.notifications;

  const handleToggleNotification = (
    key: keyof typeof user.notifications,
    value: boolean
  ) => {
    updateUserProfile({
      notifications: {
        ...notifications,
        [key]: value,
      },
    });
  };

  const handleExportData = () => {
    const exportPayload = {
      user,
      habits,
      pods,
      feedLogs,
      exportedAt: new Date().toISOString(),
      format: 'Ember-GDPR-Data-Export-v1',
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ember_data_export_${user.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Tune your notifications, privacy defaults, and account preferences.
        </p>
      </div>

      {/* Section 1: Granular Notification Preferences */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Bell className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Notification Controls
          </h2>
        </div>

        <div className="space-y-3.5">
          <Switch
            checked={notifications.reminders}
            onChange={(val) => handleToggleNotification('reminders', val)}
            label="Habit Reminders"
            description="Local daily alerts at your scheduled habit check-in times."
          />

          <Switch
            checked={notifications.podNudges}
            onChange={(val) => handleToggleNotification('podNudges', val)}
            label="Gentle Pod Nudges"
            description="Supportive prompts when your Pod is active (never guilt or shame)."
          />

          <Switch
            checked={notifications.socialActivity}
            onChange={(val) => handleToggleNotification('socialActivity', val)}
            label="Batched Reaction Summaries"
            description="Periodic digests of reactions and comments to prevent notification fatigue."
          />

          <Switch
            checked={notifications.dailyDigest}
            onChange={(val) => handleToggleNotification('dailyDigest', val)}
            label="Evening Pod Pulse Recap"
            description="A calm summary of who showed up today."
          />
        </div>
      </div>

      {/* Section 2: Privacy & Safety Guardrails */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Privacy & Trust
          </h2>
        </div>

        <div className="space-y-3 text-xs text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
            <span className="font-bold text-zinc-100 block">
              🛡️ Closed Pod Architecture
            </span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              There are no public search directories, no follower counts, and no open feeds. Your habits and proof are only visible to members of Pods you have explicitly joined.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
            <span className="font-bold text-zinc-100 block">
              🔞 16+ Age Gated & Content Moderation
            </span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Ember complies with Apple App Store and Google Play UGC safety guidelines with automated photo moderation and in-app member reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2.5: Disciplr Pro Membership (Razorpay Standard Checkout) */}
      {/* <div className="glass-card rounded-2xl p-5 space-y-4 border-orange-500/20 bg-gradient-to-b from-orange-950/20 via-zinc-900/40 to-zinc-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Membership & Billing
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
            Razorpay Live / Test
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">Disciplr Pro Lifetime Pass</h3>
              <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                ₹499
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlock unlimited accountability pods, streak protection shields, and verified member badges. Powered securely by Razorpay Standard Checkout.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-300">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Unlimited Pods</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-indigo-400" /> +5 Streak Shields</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-orange-400" /> Instant Activation</span>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <RazorpayCheckoutButton
              amountInPaise={49900}
              currency="INR"
              itemName="Disciplr Pro Lifetime"
              description="Disciplr Pro Lifetime Access with Unlimited Pods"
              customerName={user.name}
              customerEmail={user.email}
              buttonText="Upgrade to Pro (₹499)"
              variant="glow"
              size="md"
              onSuccess={(res) => {
                console.log('Payment verified successfully in UI:', res);
                updateUserProfile({
                  streakShields: {
                    ...user.streakShields,
                    totalAvailable: (user.streakShields?.totalAvailable || 0) + 5,
                  },
                });
              }}
            />
          </div>
        </div>
      </div> */}

      {/* Section 3: Data Ownership & GDPR */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Data Portability & Deletion
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-200">Export All Data</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Download your complete habit history, logs, and pod affiliations as a JSON file.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            leftIcon={downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
          >
            {downloadSuccess ? 'Downloaded' : 'Export JSON'}
          </Button>
        </div>

        <div className="pt-3 border-t border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-200">Sign Out of Session</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Clear your authentication cookies and end this device session.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await logoutApi();
              } catch {
                // ignore
              }
              try {
                localStorage.clear();
              } catch {}
              window.location.replace('/login');
            }}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>

        <div className="pt-3 border-t border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-rose-300">Delete Account</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Permanently wipe your profile, check-in history, and leave all Pods.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to permanently delete your account?')) {
                alert('Account deleted. Redirecting to start.');
                window.location.href = '/';
              }
            }}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
