'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CheckInLog,
  Habit,
  MilestoneBadge,
  Pod,
  ReactionEmoji,
  UserProfile,
  Post,
  PostReply,
} from '@/types/ember';
import {
  INITIAL_FEED_LOGS,
  INITIAL_HABITS,
  INITIAL_PODS,
  INITIAL_USER,
} from '@/lib/mock-data';

interface EmberContextType {
  user: UserProfile;
  habits: Habit[];
  pods: Pod[];
  activePod: Pod | null;
  activePodId: string;
  feedLogs: CheckInLog[];
  posts: Post[];
  completedTodayHabitIds: string[];
  activeMilestone: MilestoneBadge | null;
  previewMode: 'mobile' | 'responsive';
  setPreviewMode: (mode: 'mobile' | 'responsive') => void;
  setActivePodId: (podId: string) => void;
  toggleCheckIn: (
    habitId: string,
    options?: { proofImageUrl?: string; note?: string }
  ) => void;
  addReaction: (logId: string, emoji: ReactionEmoji) => void;
  addComment: (logId: string, content: string) => void;
  createHabit: (newHabit: Omit<Habit, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'streakShieldsUsed' | 'isArchived' | 'createdAt'>) => Habit;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  archiveHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  createPost: (data: { content: string; mediaUrl?: string; podId?: string; isPodOnly?: boolean }) => Promise<Post | null>;
  likePost: (postId: string) => void;
  replyToPost: (postId: string, content: string) => Promise<PostReply | null>;
  deletePost: (postId: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
  createPod: (data: { name: string; description: string; emoji: string }) => Pod;
  joinPodByCode: (code: string) => { success: boolean; message: string; pod?: Pod };
  leavePod: (podId: string) => void;
  removePodMember: (podId: string, memberUserId: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  dismissCelebration: () => void;
  triggerStreakShield: (habitTitle: string) => void;
  resetAllToDefault: () => void;
}

const EmberContext = createContext<EmberContextType | undefined>(undefined);

const STORAGE_KEY = 'disciplr_ember_state_v2_live';

export function EmberProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [pods, setPods] = useState<Pod[]>(INITIAL_PODS);
  const [feedLogs, setFeedLogs] = useState<CheckInLog[]>(INITIAL_FEED_LOGS);
  const [posts, setPosts] = useState<Post[]>([]);
  const [completedTodayHabitIds, setCompletedTodayHabitIds] = useState<string[]>([]);
  const [activePodId, setActivePodIdState] = useState<string>('');
  const [activeMilestone, setActiveMilestone] = useState<MilestoneBadge | null>(null);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'responsive'>('responsive');
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        if (data?.posts) {
          setPosts(data.posts);
        }
      }
    } catch {}
  };

  // Hydrate from localStorage first, then sync live backend data if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) setUser(parsed.user);
        if (parsed.habits) setHabits(parsed.habits);
        if (parsed.pods) setPods(parsed.pods);
        if (parsed.feedLogs) setFeedLogs(parsed.feedLogs);
        if (parsed.posts) setPosts(parsed.posts);
        if (parsed.completedTodayHabitIds)
          setCompletedTodayHabitIds(parsed.completedTodayHabitIds);
        if (parsed.activePodId) setActivePodIdState(parsed.activePodId);
      }
    } catch {
      // fallback to initial state
    }

    // Attempt to bootstrap from live backend API
    fetch('/api/bootstrap')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          if (Array.isArray(data.habits)) {
            setHabits(data.habits);
          }
          if (Array.isArray(data.pods) && data.pods.length > 0) {
            setPods(data.pods);
            if (!activePodId) setActivePodIdState(data.pods[0].id);
          }
          if (Array.isArray(data.completedTodayHabitIds)) {
            setCompletedTodayHabitIds(data.completedTodayHabitIds);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoaded(true);
      });

    // Also fetch habits directly to ensure complete sync
    fetch('/api/habits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.habits)) {
          setHabits(data.habits);
        }
      })
      .catch(() => {});

    // Also fetch live Pod feed
    fetch('/api/feed')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.feed && data.feed.length > 0) {
          setFeedLogs(data.feed);
        }
      })
      .catch(() => {});

    // Fetch initial community posts
    refreshPosts();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          habits,
          pods,
          feedLogs,
          completedTodayHabitIds,
          activePodId,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [user, habits, pods, feedLogs, completedTodayHabitIds, activePodId, isLoaded]);

  const activePod =
    activePodId === 'me'
      ? null
      : pods.find((p) => p.id === activePodId) || pods[0] || null;

  const setActivePodId = (podId: string) => {
    setActivePodIdState(podId);
    setUser((prev) => ({ ...prev, activePodId: podId }));
  };

  const toggleCheckIn = (
    habitId: string,
    options?: { proofImageUrl?: string; note?: string }
  ) => {
    const isAlreadyCompleted = completedTodayHabitIds.includes(habitId);
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    // Optimistic Update
    if (isAlreadyCompleted) {
      setCompletedTodayHabitIds((prev) => prev.filter((id) => id !== habitId));
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, currentStreak: Math.max(0, h.currentStreak - 1) }
            : h
        )
      );
      setFeedLogs((prev) =>
        prev.filter(
          (log) => !(log.habitId === habitId && log.userId === user.id && log.loggedDate === new Date().toISOString().split('T')[0])
        )
      );
    } else {
      const nextStreak = targetHabit.currentStreak + 1;
      const nextLongest = Math.max(targetHabit.longestStreak, nextStreak);

      setCompletedTodayHabitIds((prev) => [...prev, habitId]);
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, currentStreak: nextStreak, longestStreak: nextLongest }
            : h
        )
      );

      const newLog: CheckInLog = {
        id: `log_${Date.now()}`,
        habitId: targetHabit.id,
        habitTitle: targetHabit.title,
        habitEmoji: targetHabit.emoji,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        loggedDate: new Date().toISOString().split('T')[0],
        userTimezone: 'America/New_York',
        status: true,
        proofImageUrl: options?.proofImageUrl,
        note: options?.note || `Checked in! ${nextStreak} day streak 🔥`,
        reactions: [],
        comments: [],
        createdAt: 'Just now',
      };
      setFeedLogs((prev) => [newLog, ...prev]);

      if (nextStreak === 7 || nextStreak === 30 || nextStreak === 100) {
        const milestoneBadge: MilestoneBadge = {
          id: `badge_${nextStreak}_${Date.now()}`,
          habitId: targetHabit.id,
          title:
            nextStreak === 7
              ? '7-Day Spark Unlock'
              : nextStreak === 30
              ? '30-Day Hearth Solidified'
              : '100-Day Beacon Mastered',
          description: `You reached ${nextStreak} consecutive days on "${targetHabit.title}"!`,
          icon: nextStreak === 7 ? '🔥' : nextStreak === 30 ? '✨' : '⚡',
          thresholdDays: nextStreak as 7 | 30 | 100,
          unlockedAt: new Date().toISOString(),
        };

        setActiveMilestone(milestoneBadge);
        setUser((prev) => ({
          ...prev,
          badges: [...prev.badges, milestoneBadge],
        }));
      }
    }

    // Backend API Dispatch
    fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habitId,
        proofImageUrl: options?.proofImageUrl,
        note: options?.note,
      }),
    }).catch(() => {});
  };

  const addReaction = (logId: string, emoji: ReactionEmoji) => {
    // Optimistic Update
    setFeedLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          const existing = log.reactions.find(
            (r) => r.userId === user.id && r.emoji === emoji
          );
          if (existing) {
            return {
              ...log,
              reactions: log.reactions.filter((r) => r.id !== existing.id),
            };
          } else {
            const newReaction = {
              id: `rxn_${Date.now()}`,
              emoji,
              userId: user.id,
              userName: user.name,
              userAvatar: user.avatar,
              createdAt: 'Just now',
            };
            return {
              ...log,
              reactions: [...log.reactions, newReaction],
            };
          }
        }
        return log;
      })
    );

    // Backend API Dispatch
    fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId, emoji }),
    }).catch(() => {});
  };

  const addComment = (logId: string, content: string) => {
    if (!content.trim()) return;
    const cappedContent = content.slice(0, 200);

    const newComment = {
      id: `cmt_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: cappedContent,
      createdAt: 'Just now',
    };

    setFeedLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          return {
            ...log,
            comments: [...log.comments, newComment],
          };
        }
        return log;
      })
    );

    // Backend API Dispatch
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId, content: cappedContent }),
    }).catch(() => {});
  };

  const createHabit = (
    newHabitData: Omit<Habit, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'streakShieldsUsed' | 'isArchived' | 'createdAt'>
  ): Habit => {
    const tempId = `hab_${Date.now()}`;
    const habit: Habit = {
      ...newHabitData,
      id: tempId,
      userId: user.id,
      currentStreak: 0,
      longestStreak: 0,
      streakShieldsUsed: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    setHabits((prev) => [habit, ...prev]);

    // Backend API Dispatch
    fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHabitData),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.habit) {
          setHabits((prev) =>
            prev.map((h) => (h.id === tempId ? data.habit : h))
          );
        }
      })
      .catch(() => {});

    return habit;
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h))
    );

    // Backend API Dispatch
    fetch(`/api/habits/${habitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const archiveHabit = (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;
    const nextArchived = !target.isArchived;

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, isArchived: nextArchived } : h
      )
    );

    fetch(`/api/habits/${habitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived: nextArchived }),
    }).catch(() => {});
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setCompletedTodayHabitIds((prev) => prev.filter((id) => id !== habitId));

    fetch(`/api/habits/${habitId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const createPod = (data: { name: string; description: string; emoji: string }): Pod => {
    const tempId = `pod_${Date.now()}`;
    const newPod: Pod = {
      id: tempId,
      name: data.name,
      description: data.description,
      emoji: data.emoji || '🔥',
      inviteCode: `EMBER-${Math.random().toString(36).substring(2, 6).toUpperCase()}-08`,
      creatorId: user.id,
      maxMembers: 8,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          joinedAt: new Date().toISOString(),
          role: 'creator',
          checkedInToday: completedTodayHabitIds.length > 0,
          currentStreak: habits[0]?.currentStreak || 1,
        },
      ],
    };

    setPods((prev) => [newPod, ...prev]);
    setActivePodIdState(newPod.id);
    setUser((prev) => ({ ...prev, activePodId: newPod.id }));

    // Backend API Dispatch
    fetch('/api/pods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.pod) {
          setPods((prev) =>
            prev.map((p) => (p.id === tempId ? resData.pod : p))
          );
          setActivePodIdState(resData.pod.id);
        }
      })
      .catch(() => {});

    return newPod;
  };

  const joinPodByCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = pods.find(
      (p) => p.inviteCode.toUpperCase() === cleanCode || p.id === cleanCode
    );

    if (found) {
      const isMember = found.members.some((m) => m.userId === user.id);
      if (isMember) {
        setActivePodIdState(found.id);
        return { success: true, message: `Switched to ${found.name}`, pod: found };
      }
    }

    // Backend API Dispatch
    fetch('/api/pods/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: cleanCode }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.pod) {
          setPods((prev) => {
            if (prev.some((p) => p.id === resData.pod.id)) {
              return prev.map((p) => (p.id === resData.pod.id ? resData.pod : p));
            }
            return [resData.pod, ...prev];
          });
          setActivePodIdState(resData.pod.id);
        }
      })
      .catch(() => {});

    // Fallback Simulated Join
    const simulatedPod: Pod = {
      id: `pod_invited_${Date.now()}`,
      name: 'Sprint & Code Circle',
      description: 'Joined via invite link. 4 members building daily focus habits.',
      emoji: '🚀',
      inviteCode: cleanCode,
      creatorId: 'usr_sarah',
      maxMembers: 8,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: 'usr_sarah',
          name: 'Sarah Kim',
          username: 'sarah_k',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
          joinedAt: new Date().toISOString(),
          role: 'creator',
          checkedInToday: true,
          currentStreak: 11,
        },
        {
          userId: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          joinedAt: new Date().toISOString(),
          role: 'member',
          checkedInToday: completedTodayHabitIds.length > 0,
          currentStreak: habits[0]?.currentStreak || 0,
        },
      ],
    };

    setPods((prev) => [simulatedPod, ...prev]);
    setActivePodIdState(simulatedPod.id);
    return { success: true, message: `Joined ${simulatedPod.name}!`, pod: simulatedPod };
  };

  const leavePod = (podId: string) => {
    setPods((prev) =>
      prev.map((pod) =>
        pod.id === podId
          ? {
              ...pod,
              members: pod.members.filter((m) => m.userId !== user.id),
            }
          : pod
      )
    );
    const remaining = pods.filter((p) => p.id !== podId);
    if (remaining.length > 0) {
      setActivePodIdState(remaining[0].id);
    }
  };

  const removePodMember = (podId: string, memberUserId: string) => {
    setPods((prev) =>
      prev.map((pod) =>
        pod.id === podId
          ? {
              ...pod,
              members: pod.members.filter((m) => m.userId !== memberUserId),
            }
          : pod
      )
    );
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const dismissCelebration = () => {
    setActiveMilestone(null);
  };

  const triggerStreakShield = (habitTitle: string) => {
    if (user.streakShields.totalAvailable <= 0) return;
    setUser((prev) => ({
      ...prev,
      streakShields: {
        ...prev.streakShields,
        totalAvailable: Math.max(0, prev.streakShields.totalAvailable - 1),
        usedThisWeek: prev.streakShields.usedThisWeek + 1,
        history: [
          {
            date: 'Today',
            habitTitle,
            reason: 'Forgiving auto-shield applied — streak preserved without guilt!',
          },
          ...prev.streakShields.history,
        ],
      },
    }));
  };

  const createPost = async (data: {
    content: string;
    mediaUrl?: string;
    podId?: string;
    isPodOnly?: boolean;
  }): Promise<Post | null> => {
    const tempId = `post_${Date.now()}`;
    const optimisticPost: Post = {
      id: tempId,
      userId: user.id,
      userName: user.name,
      userUsername: user.username,
      userAvatar: user.avatar,
      content: data.content,
      mediaUrl: data.mediaUrl,
      podId: data.podId,
      podName: activePod?.name,
      isPodOnly: !!data.isPodOnly,
      likesCount: 0,
      hasLiked: false,
      repliesCount: 0,
      repostsCount: 0,
      hasReposted: false,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [optimisticPost, ...prev]);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData?.post) {
          setPosts((prev) =>
            prev.map((p) => (p.id === tempId ? resData.post : p))
          );
          return resData.post;
        }
      }
    } catch {}

    return optimisticPost;
  };

  const likePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextLiked = !post.hasLiked;
        return {
          ...post,
          hasLiked: nextLiked,
          likesCount: Math.max(0, post.likesCount + (nextLiked ? 1 : -1)),
        };
      })
    );

    fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    }).catch(() => {});
  };

  const replyToPost = async (postId: string, content: string): Promise<PostReply | null> => {
    const tempId = `reply_${Date.now()}`;
    const optimisticReply: PostReply = {
      id: tempId,
      postId,
      userId: user.id,
      userName: user.name,
      userUsername: user.username,
      userAvatar: user.avatar,
      content,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, repliesCount: post.repliesCount + 1 }
          : post
      )
    );

    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.reply) return data.reply;
      }
    } catch {}

    return optimisticReply;
  };

  const deletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const resetAllToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(INITIAL_USER);
    setHabits(INITIAL_HABITS);
    setPods(INITIAL_PODS);
    setFeedLogs(INITIAL_FEED_LOGS);
    setPosts([]);
    setCompletedTodayHabitIds([]);
    setActivePodIdState('');
  };

  return (
    <EmberContext.Provider
      value={{
        user,
        habits,
        pods,
        activePod,
        activePodId,
        feedLogs,
        posts,
        completedTodayHabitIds,
        activeMilestone,
        previewMode,
        setPreviewMode,
        setActivePodId,
        toggleCheckIn,
        addReaction,
        addComment,
        createHabit,
        updateHabit,
        archiveHabit,
        deleteHabit,
        createPost,
        likePost,
        replyToPost,
        deletePost,
        refreshPosts,
        createPod,
        joinPodByCode,
        leavePod,
        removePodMember,
        updateUserProfile,
        dismissCelebration,
        triggerStreakShield,
        resetAllToDefault,
      }}
    >
      {children}
    </EmberContext.Provider>
  );
}

export function useEmber() {
  const context = useContext(EmberContext);
  if (!context) {
    throw new Error('useEmber must be used within an EmberProvider');
  }
  return context;
}
