-- =========================================================
-- EMBER / DISCIPLR: COMPLETE DATABASE SCHEMA (PostgreSQL)
-- Phase 1 MVP: Social Habit-Building Platform for Closed Pods
-- =========================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------
-- 1. USERS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    encrypted_password VARCHAR(200) NOT NULL,
    avatar_url TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. PODS TABLE (Small closed circles, 3-8 members)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10) NOT NULL DEFAULT '🌅',
    invite_code VARCHAR(50) UNIQUE NOT NULL,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    max_members INT NOT NULL DEFAULT 8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3. POD MEMBERSHIPS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pod_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'creator', 'member'
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_pod_member UNIQUE (pod_id, user_id)
);

-- ---------------------------------------------------------
-- 4. HABITS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL DEFAULT '⚡',
    frequency_type VARCHAR(20) NOT NULL DEFAULT 'daily', -- 'daily', 'specific_days', 'times_per_week'
    frequency_days JSONB DEFAULT '[]'::jsonb, -- e.g. [1, 2, 3, 4, 5]
    times_per_week INT DEFAULT 7,
    reminder_time VARCHAR(20) NOT NULL DEFAULT '08:00 AM',
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    streak_shields_used INT NOT NULL DEFAULT 0,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5. HABIT PODS JUNCTION (Selective Habit Sharing)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_pods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_habit_pod UNIQUE (habit_id, pod_id)
);

-- ---------------------------------------------------------
-- 6. HABIT LOGS / CHECK-INS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    proof_image_url TEXT,
    note TEXT,
    logged_date DATE NOT NULL,
    user_timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_habit_log_per_user_date UNIQUE (habit_id, user_id, logged_date)
);

-- ---------------------------------------------------------
-- 7. REACTIONS TABLE (Lightweight Reactions: 🔥, 👏, 💪, 🙌, ❤️, ⚡)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES public.habit_logs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_log_emoji UNIQUE (log_id, user_id, emoji)
);

-- ---------------------------------------------------------
-- 8. COMMENTS TABLE (Max 200 chars encouragement)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES public.habit_logs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 9. STREAK SHIELDS TABLE (Forgiving Habit Science)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.streak_shields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_available INT NOT NULL DEFAULT 2,
    max_per_week INT NOT NULL DEFAULT 2,
    used_this_week INT NOT NULL DEFAULT 0,
    history JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 10. MILESTONE BADGES TABLE (7, 30, 100 days)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.milestone_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
    badge_key VARCHAR(50) NOT NULL, -- e.g. 'badge_7_spark', 'badge_30_ember', 'badge_100_beacon'
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '🔥',
    threshold_days INT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_celebrated BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_user_habit_threshold UNIQUE (user_id, habit_id, threshold_days)
);

-- ---------------------------------------------------------
-- 11. NOTIFICATION SETTINGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    reminders BOOLEAN NOT NULL DEFAULT TRUE,
    pod_nudges BOOLEAN NOT NULL DEFAULT TRUE,
    social_activity BOOLEAN NOT NULL DEFAULT TRUE,
    daily_digest BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON public.habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_logged_date ON public.habit_logs(logged_date);
CREATE INDEX IF NOT EXISTS idx_pod_memberships_user ON public.pod_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_memberships_pod ON public.pod_memberships(pod_id);
CREATE INDEX IF NOT EXISTS idx_habit_pods_pod ON public.habit_pods(pod_id);
CREATE INDEX IF NOT EXISTS idx_reactions_log ON public.reactions(log_id);
CREATE INDEX IF NOT EXISTS idx_comments_log ON public.comments(log_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_shields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Allow public service role or authenticated app backend access
CREATE POLICY "Allow authenticated access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow access to pods" ON public.pods FOR ALL USING (true);
CREATE POLICY "Allow access to pod_memberships" ON public.pod_memberships FOR ALL USING (true);
CREATE POLICY "Allow access to habits" ON public.habits FOR ALL USING (true);
CREATE POLICY "Allow access to habit_pods" ON public.habit_pods FOR ALL USING (true);
CREATE POLICY "Allow access to habit_logs" ON public.habit_logs FOR ALL USING (true);
CREATE POLICY "Allow access to reactions" ON public.reactions FOR ALL USING (true);
CREATE POLICY "Allow access to comments" ON public.comments FOR ALL USING (true);
CREATE POLICY "Allow access to streak_shields" ON public.streak_shields FOR ALL USING (true);
CREATE POLICY "Allow access to milestone_badges" ON public.milestone_badges FOR ALL USING (true);
CREATE POLICY "Allow access to notification_settings" ON public.notification_settings FOR ALL USING (true);
