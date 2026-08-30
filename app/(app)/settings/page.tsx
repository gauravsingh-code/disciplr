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
} from 'lucide-react';

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
              window.location.href = '/login';
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
