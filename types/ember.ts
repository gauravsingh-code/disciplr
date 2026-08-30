export type ReactionEmoji = '🔥' | '👏' | '💪' | '🙌' | '❤️' | '⚡';

export interface Reaction {
  id: string;
  emoji: ReactionEmoji;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export type FrequencyType = 'daily' | 'specific_days' | 'times_per_week';

export interface HabitFrequency {
  type: FrequencyType;
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, ... 6 = Sat
  timesPerWeek?: number;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  emoji: string;
  frequency: HabitFrequency;
  reminderTime: string; // e.g. "08:00 AM" or "20:00"
  isPrivate: boolean; // Private by default vs Pod-visible
  sharedPodIds: string[];
  currentStreak: number;
  longestStreak: number;
  streakShieldsUsed: number;
  isArchived: boolean;
  createdAt: string;
}

export interface CheckInLog {
  id: string;
  habitId: string;
  habitTitle: string;
  habitEmoji: string;
  userId: string;
  userName: string;
  userAvatar: string;
  loggedDate: string; // YYYY-MM-DD
  userTimezone: string;
  status: boolean; // completed
  proofImageUrl?: string;
  note?: string;
  reactions: Reaction[];
  comments: Comment[];
  createdAt: string;
}

export interface PodMember {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  joinedAt: string;
  role: 'creator' | 'member';
  checkedInToday: boolean;
  currentStreak: number;
}

export interface Pod {
  id: string;
  name: string;
  description: string;
  emoji: string;
  inviteCode: string;
  creatorId: string;
  members: PodMember[];
  maxMembers: number; // Defaults to 8
  createdAt: string;
}

export interface MilestoneBadge {
  id: string;
  habitId?: string;
  title: string;
  description: string;
  icon: string;
  thresholdDays: 7 | 30 | 100;
  unlockedAt?: string;
  isCelebrated?: boolean;
}

export interface StreakShield {
  totalAvailable: number;
  maxPerWeek: number;
  usedThisWeek: number;
  history: {
    date: string;
    habitTitle: string;
    reason: string;
  }[];
}

export interface NotificationSettings {
  reminders: boolean;
  podNudges: boolean;
  socialActivity: boolean;
  dailyDigest: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  ageVerified: boolean; // 16+
  activePodId?: string;
  streakShields: StreakShield;
  notifications: NotificationSettings;
  badges: MilestoneBadge[];
  createdAt: string;
}
