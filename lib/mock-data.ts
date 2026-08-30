import { CheckInLog, Habit, Pod, UserProfile } from '@/types/ember';

export const INITIAL_USER: UserProfile = {
  id: '',
  name: '',
  username: '',
  email: '',
  avatar: '',
  ageVerified: false,
  activePodId: undefined,
  streakShields: {
    totalAvailable: 2,
    maxPerWeek: 2,
    usedThisWeek: 0,
    history: [],
  },
  notifications: {
    reminders: true,
    podNudges: true,
    socialActivity: true,
    dailyDigest: false,
  },
  badges: [],
  createdAt: new Date().toISOString(),
};

export const INITIAL_PODS: Pod[] = [];

export const INITIAL_HABITS: Habit[] = [];

export const INITIAL_FEED_LOGS: CheckInLog[] = [];

export const HABIT_TEMPLATES = [
  { title: 'Morning Movement (Run / Gym / Yoga)', emoji: '🏃‍♂️', defaultTime: '07:00 AM' },
  { title: 'Deep Work (2hr Focus Block)', emoji: '⚡', defaultTime: '09:00 AM' },
  { title: 'Read 20 Pages Non-Fiction', emoji: '📖', defaultTime: '09:00 PM' },
  { title: 'Hydrate 3 Liters Daily', emoji: '💧', defaultTime: '12:00 PM' },
  { title: 'Zero Social Media Before Noon', emoji: '📵', defaultTime: '08:00 AM' },
  { title: 'Daily Gratitude & Journaling', emoji: '✍️', defaultTime: '10:00 PM' },
];
