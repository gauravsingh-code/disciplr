# Disciplr (Growth Network) — Comprehensive Architectural Deep-Dive

Welcome to the complete, ground-up architectural analysis of the **Disciplr** codebase. This guide explains every layer of the application: how code runs in the browser, how Next.js handles routing and rendering, how server route handlers execute business logic, how authentication and state synchronization work, and how data persists in PostgreSQL/Supabase.

---

# STEP 1 — Architecture Overview & Folder Map

### System Architecture Diagram

```
                              BROWSER
  ┌─────────────────────────────────────────────────────────────┐
  │  React 19 Virtual DOM / UI Component Tree                   │
  │  - Context: EmberProvider (Client State in Memory)          │
  │  - Local Storage: Cache ("disciplr_ember_state_v2_live")    │
  │  - Cookie: auth_token (HttpOnly JWT)                        │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ HTTP Requests (Fetch / HTML Nav)
                                 ▼
                     NEXT.JS 16 SERVER (Turbopack)
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. EDGE PROXY / MIDDLEWARE (`middleware.ts`)                │
  │    - Reads `auth_token` cookie via `jose.jwtVerify`         │
  │    - Protects routes (`/today`, `/pod`, `/habits`, etc.)    │
  │    - Applies `Cache-Control: no-store` (prevents bfcache)   │
  ├─────────────────────────────────────────────────────────────┤
  │ 2. APP ROUTER RENDERING ENGINE                              │
  │    - Root Layout (`app/layout.tsx` - Server Component)      │
  │    - App Shell Layout (`app/(app)/layout.tsx` - Client)     │
  │    - Pages (`/today`, `/pod`, `/feed`, `/profile`, etc.)    │
  ├─────────────────────────────────────────────────────────────┤
  │ 3. ROUTE HANDLERS (`app/api/*`)                             │
  │    - Session Auth: `getSessionUser()` (`utils/auth.ts`)     │
  │    - Business validation (streaks, badges, character limits)│
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Supabase SSR Client (`utils/supabase/server.ts`)
                                 ▼
                   POSTGRESQL DATABASE (Supabase)
  ┌─────────────────────────────────────────────────────────────┐
  │ 15 Normalized Tables:                                       │
  │ users, pods, pod_memberships, habits, habit_pods,           │
  │ habit_logs, reactions, comments, streak_shields,            │
  │ milestone_badges, notification_settings, posts, post_likes, │
  │ post_replies, post_reposts                                  │
  └─────────────────────────────────────────────────────────────┘
```

---

### Folder Directory Responsibilities

| Directory / File | Responsibility |
| :--- | :--- |
| **`app/`** | The Next.js 16 App Router root. Every folder containing a `page.tsx` defines a URL route. Route handlers live in `app/api/`. |
| **`app/(app)/`** | A **Route Group** (parentheses are omitted from the URL). Wraps all authenticated pages with a persistent sidebar, top header, and bottom navigation. |
| **`app/api/`** | Server-side REST API Route Handlers (`route.ts`). Handle database queries, authentication cookies, mutations, and business logic. |
| **`components/`** | Reusable React UI components categorized by domain: `components/navigation/`, `components/habits/`, `components/pod/`, `components/posts/`, `components/profile/`, `components/gamification/`, `components/ui/`. |
| **`context/`** | `context/ember-context.tsx` provides global client-side state, optimistic UI updates, and backend data synchronization. |
| **`lib/`** | Helper clients: `lib/auth-client.ts` (browser fetch wrappers for login/signup/logout) and `lib/mock-data.ts` (initial empty schemas & habit templates). |
| **`utils/`** | Server-side helpers: `utils/auth.ts` (bcrypt hashing, JWT signing/verifying with `jose`, cookie management) and `utils/supabase/` (Supabase client factory). |
| **`types/`** | TypeScript type definitions (`types/ember.ts`) defining the domain models (`User`, `Pod`, `Habit`, `CheckInLog`, `Post`, `MilestoneBadge`). |
| **`supabase/`** | Database schema definition (`supabase/schema.sql`) with tables, foreign keys, indexes, and Row Level Security (RLS) policies. |
| **`middleware.ts`** | Intercepts all incoming requests before page rendering to enforce authentication rules and cache headers. |

---

# STEP 2 — Technology Stack

| Technology | Version | Why It Is Used | Where It Is Used |
| :--- | :--- | :--- | :--- |
| **Next.js** | `16.2.7` | App Router, Route Handlers, Turbopack dev/build system, edge middleware | Root framework (`app/`, `middleware.ts`) |
| **React** | `19.2.4` | Virtual DOM, Hooks (`useState`, `useEffect`, `useMemo`), Context API | Entire frontend UI |
| **TypeScript** | `^5` | Compile-time static type safety and schema contracts | All `.ts` and `.tsx` files |
| **Tailwind CSS** | `^4` (PostCSS) | Utility-first styling, CSS variables, dark-mode glassmorphism | `app/globals.css`, JSX `className`s |
| **Jose** | `^6.2.9` | Edge-compatible JWT creation and verification without Node.js `crypto` dependencies | `utils/auth.ts`, `middleware.ts` |
| **Bcryptjs** | `^3.0.3` | Password hashing with cryptographic salt | `utils/auth.ts`, `app/api/auth/signup`, `app/api/auth/login` |
| **@supabase/ssr** | `^0.12.4` | Cookie-based Supabase client configured for Next.js App Router | `utils/supabase/server.ts`, `utils/supabase/client.ts` |
| **@supabase/supabase-js** | `^2.112.3` | PostgreSQL query builder & database client | `app/api/*/route.ts` |
| **Lucide React** | `^1.35.0` | Modern SVG icons | Components across the entire app |
| **Canvas Confetti** | `^1.9.4` | Celebration particle animations on milestone unlocking | `components/gamification/milestone-celebration.tsx` |

---

# STEP 3 — Next.js Architecture in THIS Project

### 1. Server Components vs Client Components
- **Server Components**: Run exclusively on the Node.js server. They never bundle React hooks or browser APIs to the client.
  - *Example in your project*: `app/layout.tsx` is a Server Component. It injects Google fonts (`Geist`, `Geist_Mono`) and HTML metadata on the server.
- **Client Components (`'use client'`)**: Pre-rendered on the server into static HTML and hydrated on the browser with interactive React state.
  - *Example in your project*: `app/(app)/layout.tsx`, `context/ember-context.tsx`, and all interactive pages (`/today`, `/pod`, `/feed`, `/profile`, `/habits`, `/settings`).

### 2. Route Handlers (`app/api/**/route.ts`)
Next.js Route Handlers execute on the server. They replace traditional Express controllers:
- Handle HTTP verbs: `export async function GET()`, `export async function POST()`, `export async function DELETE()`.
- Use Web Standard `Request` and `NextResponse.json()`.
- Directly read cookies via `next/headers` and query Supabase.

### 3. Middleware (`middleware.ts`)
Runs before any route handler or page render:
- Extracts the `auth_token` cookie.
- Verifies the signature using `jose.jwtVerify`.
- If an unauthenticated user visits a protected route (`/today`, `/pod`, `/habits`, etc.), it executes an immediate server-side redirect to `/login`.
- Emits `Cache-Control: no-store` to prevent browsers from serving stale cached authenticated pages when a user clicks the browser Back button after logout.

---

# STEP 4 & 5 — Complete Data Flow & Feature Maps

---

## Feature 1: Habit Check-In & Streak Shield Progression

```
[User taps Check-in Circle on /today]
       │
       ▼
1. `HabitCard.tsx` (Client Component)
   Calls `toggleCheckIn(habit.id)` from `useEmber()`
       │
       ▼
2. `ember-context.tsx` (Optimistic State Update)
   - Instantly toggles `completedTodayHabitIds` array in React memory
   - Increments habit's `currentStreak` by +1
   - Checks if streak reaches 7, 30, or 100 days → triggers `MilestoneCelebration` modal
   - Updates `localStorage.setItem('disciplr_ember_state_v2_live')`
       │
       ▼
3. HTTP POST `/api/checkins`
   Payload: `{ habitId: "uuid", timezone: "UTC", note: "...", proofImageUrl: "..." }`
       │
       ▼
4. `app/api/checkins/route.ts` (Server Handler)
   - Calls `getSessionUser()` -> verifies JWT cookie
   - Queries `habits` table in Supabase: checks if user owns this habit
   - Checks `habit_logs` table for `logged_date = CURRENT_DATE`
       │
       ├─► IF ALREADY LOGGED:
       │     - `DELETE FROM habit_logs WHERE id = existingLog.id`
       │     - Decrements `current_streak` in `habits` table
       │
       └─► IF NEW CHECK-IN:
             - `INSERT INTO habit_logs (habit_id, user_id, status, logged_date, proof_image_url)`
             - `UPDATE habits SET current_streak = current_streak + 1, longest_streak = GREATEST(...)`
             - If milestone reached (7, 30, 100): `INSERT INTO milestone_badges (...)`
       │
       ▼
5. Database returns inserted log & updated streak
       │
       ▼
6. Client receives response: React Context keeps optimistic state or syncs badge data
```

---

## Feature 2: Twitter/X-Style Social Post & Interactions

```
[User writes post and clicks "Post" on /feed]
       │
       ▼
1. `PostComposer.tsx` (Client Component)
   Validates: `content.trim().length > 0` and `<= 500` characters
   Calls `createPost({ content, mediaUrl, podId, isPodOnly })` from `useEmber()`
       │
       ▼
2. `ember-context.tsx` (Optimistic Update)
   - Creates a temporary `optimisticPost` with id `post_${Date.now()}`
   - Prepends to `posts` array (`setPosts([optimisticPost, ...prev])`)
       │
       ▼
3. HTTP POST `/api/posts`
       │
       ▼
4. `app/api/posts/route.ts` (Server Handler)
   - Authenticates session (`session.userId`)
   - `INSERT INTO posts (user_id, content, media_url, pod_id, is_pod_only)`
   - Returns `{ post: formattedPost }` with real database UUID
       │
       ▼
5. `ember-context.tsx` swaps temporary `post_123` with real database UUID
       │
       ▼
[Another user clicks "Like" Heart on PostCard.tsx]
       │
       ▼
6. `likePost(postId)`:
   - Optimistically toggles `hasLiked` and increments `likesCount` by +1
   - Dispatches background POST `/api/posts/[id]/like`
   - Server performs atomic toggle: `INSERT INTO post_likes` OR `DELETE FROM post_likes`
   - Server updates `likes_count` column in `posts` table
```

---

## Feature 3: Habit Filtering by Scope (Me vs Pod)

```
[User selects "Me (Personal)" or a Pod in AppHeader dropdown]
       │
       ▼
1. `app-header.tsx`: calls `setActivePodId('me')` or `setActivePodId(pod.id)`
       │
       ▼
2. `ember-context.tsx`:
   - Updates `activePodId` in React Context state
   - Computes `activePod`: returns `null` if 'me', or finds matching pod object
   - Syncs active selection to `localStorage`
       │
       ▼
3. `app/(app)/today/page.tsx` React re-render:
   - Reads `activePodId` and `habits` from `useEmber()`
   - Scope Filter Logic:
       • If `activePodId === 'me'`: filters all habits created by user
       • If `activePodId === podId`: filters habits where `habit.sharedPodIds.includes(podId)`
   - Updates page title to "My Personal Rituals" vs "{Pod Name} Rituals"
   - Shows relevant habit list with zero page reload
```

---

# STEP 6 — Database ER Architecture & Operations

The application uses **15 normalized relational tables** in PostgreSQL managed via Supabase.

### Entity-Relationship Diagram

```
 ┌────────────────┐         1:N          ┌───────────────────┐
 │     users      ├──────────────────────►│    streak_shields │
 └───────┬────────┘                      └───────────────────┘
         │
         │ 1:N (creator)
         ├───────────────────────────────►┌───────────────────┐
         │                                │       pods        │
         │ 1:N                            └───┬───────────┬───┘
         ├──────────────┐                     │ 1:N       │ 1:N
         │              │                     │           │
         ▼              ▼                     ▼           ▼
  ┌──────────────┐ ┌──────────────┐   ┌──────────────┐ ┌──────────────┐
  │    habits    │ │pod_membership│   │  habit_pods  │ │    posts     │
  └──────┬───────┘ └──────────────┘   └──────┬───────┘ └──────┬───────┘
         │ 1:N                               │                │ 1:N
         │                                   │ N:1            ├──────────────►┌──────────────┐
         ▼                                   ▼                │               │  post_likes  │
  ┌──────────────┐                   ┌──────────────┐         │ 1:N           └──────────────┘
  │  habit_logs  │                   │    habits    │         ├──────────────►┌──────────────┐
  └──────┬───────┘                   └──────────────┘         │               │ post_replies │
         │ 1:N                                                ▼               └──────────────┘
         ├───────────────────────────────►┌──────────────┐ ┌──────────────┐   ┌──────────────┐
         │                                │  reactions   │ │ post_reposts │   │milestone_bdgs│
         │ 1:N                            └──────────────┘ └──────────────┘   └──────────────┘
         └───────────────────────────────►┌──────────────┐
                                          │   comments   │
                                          └──────────────┘
```

### Table Definitions & Cascade Rules

1. **`users`**: Core user accounts (`id UUID PRIMARY KEY`, `name`, `email UNIQUE`, `encrypted_password`, `avatar_url`, `created_at`).
2. **`pods`**: Small accountability groups (`id`, `name`, `description`, `emoji`, `invite_code UNIQUE`, `creator_id REFERENCES users(id) ON DELETE CASCADE`, `max_members`).
3. **`pod_memberships`**: Junction table for Pod membership (`pod_id REFERENCES pods ON DELETE CASCADE`, `user_id REFERENCES users ON DELETE CASCADE`, `role`, `joined_at`). Composite unique key `(pod_id, user_id)`.
4. **`habits`**: User habits (`id`, `user_id REFERENCES users ON DELETE CASCADE`, `title`, `emoji`, `frequency_type`, `frequency_days`, `times_per_week`, `reminder_time`, `is_private`, `current_streak`, `longest_streak`, `streak_shields_used`, `is_archived`).
5. **`habit_pods`**: Junction table linking habits to Pods (`habit_id REFERENCES habits ON DELETE CASCADE`, `pod_id REFERENCES pods ON DELETE CASCADE`).
6. **`habit_logs`**: Check-in records (`id`, `habit_id REFERENCES habits ON DELETE CASCADE`, `user_id REFERENCES users ON DELETE CASCADE`, `status`, `proof_image_url`, `note`, `logged_date DATE`, `user_timezone`). Unique constraint on `(habit_id, user_id, logged_date)` prevents duplicate check-ins on the same day.
7. **`reactions`**: Emoji reactions on check-in logs (`log_id REFERENCES habit_logs ON DELETE CASCADE`, `user_id REFERENCES users`, `emoji`).
8. **`comments`**: 200-character encouragements on check-ins (`log_id REFERENCES habit_logs ON DELETE CASCADE`, `user_id REFERENCES users`, `content`).
9. **`streak_shields`**: Forgiving streak protection pool (`user_id PRIMARY KEY`, `total_available`, `max_per_week`, `used_this_week`, `history JSONB`).
10. **`milestone_badges`**: Gamified badge achievements (`user_id`, `habit_id`, `badge_key`, `title`, `threshold_days`, `unlocked_at`).
11. **`notification_settings`**: User notification toggles (`user_id PRIMARY KEY`, `reminders`, `pod_nudges`, `social_activity`).
12. **`posts`**: Twitter/X-style posts (`id`, `user_id REFERENCES users ON DELETE CASCADE`, `content`, `media_url`, `pod_id REFERENCES pods ON DELETE SET NULL`, `is_pod_only`, `likes_count`, `reposts_count`).
13. **`post_likes`**: Unique post likes (`post_id REFERENCES posts ON DELETE CASCADE`, `user_id REFERENCES users ON DELETE CASCADE`).
14. **`post_replies`**: Threaded replies on posts (`post_id REFERENCES posts ON DELETE CASCADE`, `user_id REFERENCES users`, `content VARCHAR(280)`).
15. **`post_reposts`**: Reposts tracking (`post_id REFERENCES posts ON DELETE CASCADE`, `user_id REFERENCES users`).

---

# STEP 7 — Authentication & Authorization

### The Complete Authentication Flow

```
1. USER REGISTERS OR LOGS IN
   Input: Email/Username + Plaintext Password
   Browser sends POST /api/auth/signup OR /api/auth/login
          │
          ▼
2. SERVER AUTH HANDLER (`app/api/auth/login/route.ts`)
   - Queries `users` table in Supabase by email or username
   - Compares password using `bcrypt.compare(password, user.encrypted_password)`
          │
          ▼
3. JWT TOKEN CREATION (`utils/auth.ts`)
   - Constructs payload: `{ userId: user.id, name: user.name, email: user.email }`
   - Signs JWT using `jose.SignJWT` with HS256 algorithm and `process.env.JWT_SECRET`
   - Expiration: 7 days
          │
          ▼
4. HTTPONLY COOKIE SETTING
   - Server writes cookie: `auth_token=<jwt_string>`
   - Flags: `HttpOnly=true`, `SameSite=Lax`, `Path=/`, `Max-Age=604800` (7 days)
   - Result: JavaScript running in the browser CANNOT access or steal this token via XSS.
          │
          ▼
5. SUBSEQUENT REQUESTS
   - Browser automatically attaches `Cookie: auth_token=...` to every request.
   - `middleware.ts` verifies token before letting the request reach page components.
   - Route Handlers call `getSessionUser()` to verify token and extract `session.userId`.
```

---

# STEP 8 — State Management Architecture

The application uses a **hybrid state model**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                     1. LOCAL STORAGE                        │
 │  Key: "disciplr_ember_state_v2_live"                        │
 │  Purpose: Instant offline hydration on page reload          │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Initial render hydration
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                2. REACT CONTEXT (In-Memory)                 │
 │  File: `context/ember-context.tsx` (`EmberProvider`)        │
 │  Holds: `user`, `habits`, `pods`, `feedLogs`, `posts`,      │
 │         `completedTodayHabitIds`, `activePodId`             │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Background sync on mount
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                   3. SERVER STATE (Supabase)                │
 │  Endpoints: `/api/bootstrap`, `/api/habits`, `/api/posts`   │
 │  Purpose: Single source of truth across all devices         │
 └─────────────────────────────────────────────────────────────┘
```

- **Optimistic UI Updates**: When you toggle a habit, create a habit, or like a post, the Context updates state **instantly (0ms latency)** before the network request finishes. If the network request fails, the local state retains consistency.

---

# STEP 9 — Complete API Analysis

| Method | Route | Purpose | Input / Body | Validation | Database Operation | Auth Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user | `{ name, email, password }` | Email format, password length >= 6 | `INSERT INTO users` | No |
| `POST` | `/api/auth/login` | Login user & issue JWT | `{ identifier, password }` | Non-empty fields | `SELECT FROM users` + bcrypt check | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | None | None | Deletes `auth_token` cookie | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user | None | JWT verification | `SELECT FROM users WHERE id = userId` | Yes |
| `GET` | `/api/bootstrap` | Initial app data payload | None | JWT verification | Multi-table fetch: user, habits, pods, check-ins | Yes |
| `GET` | `/api/habits` | List user habits | None | JWT verification | `SELECT FROM habits WHERE user_id = userId` | Yes |
| `POST` | `/api/habits` | Create new habit | `{ title, emoji, frequency, ... }` | Title required | `INSERT INTO habits`, `INSERT INTO habit_pods` | Yes |
| `PATCH` | `/api/habits/[id]` | Update or archive habit | `{ title, isArchived, ... }` | Owner verification | `UPDATE habits WHERE id = id AND user_id = userId` | Yes |
| `DELETE` | `/api/habits/[id]` | Permanently delete habit | None | Owner verification | `DELETE FROM habits WHERE id = id AND user_id = userId` | Yes |
| `POST` | `/api/checkins` | Toggle daily check-in | `{ habitId, proofImageUrl, note }` | `habitId` required | `INSERT/DELETE FROM habit_logs`, updates streaks | Yes |
| `GET` | `/api/pods` | List user's pods | None | JWT verification | `SELECT FROM pod_memberships JOIN pods` | Yes |
| `POST` | `/api/pods` | Create new Pod | `{ name, description, emoji }` | Name required | `INSERT INTO pods`, `INSERT INTO pod_memberships` | Yes |
| `POST` | `/api/pods/join` | Join Pod by invite code | `{ inviteCode }` | Code lookup & max 8 members | `INSERT INTO pod_memberships` | Yes |
| `GET` | `/api/posts` | List social stream posts | Query: `?scope=all\|pod&podId=...` | None | `SELECT FROM posts JOIN users` | Yes |
| `POST` | `/api/posts` | Publish tweet/post | `{ content, mediaUrl, podId }` | Max 500 characters | `INSERT INTO posts` | Yes |
| `POST` | `/api/posts/[id]/like` | Toggle like on a post | None | Post existence | `INSERT/DELETE FROM post_likes`, updates counter | Yes |
| `GET` | `/api/posts/[id]/replies` | Fetch thread replies | None | Post existence | `SELECT FROM post_replies WHERE post_id = id` | Yes |
| `POST` | `/api/posts/[id]/replies` | Post a reply | `{ content }` | Max 280 characters | `INSERT INTO post_replies` | Yes |
| `DELETE` | `/api/posts/[id]` | Delete own post | None | Owner verification | `DELETE FROM posts WHERE id = id AND user_id = userId` | Yes |
| `GET` | `/api/feed` | List Pod check-in feed | None | JWT verification | `SELECT FROM habit_logs JOIN users, habits` | Yes |
| `POST` | `/api/reactions` | React to check-in log | `{ logId, emoji }` | Valid emoji | `INSERT INTO reactions` | Yes |
| `POST` | `/api/comments` | Comment on check-in | `{ logId, content }` | Max 200 characters | `INSERT INTO comments` | Yes |

---

# STEP 10 — Complete User Journey: Step-by-Step

Pretend a brand-new user visits the app for the very first time:

```
1. VISITS HOMEPAGE (`http://localhost:3000/`)
   - Route: `app/page.tsx`
   - Render: Server pre-rendered HTML + static Tailwind CSS.
   - Result: User sees the Disciplr Hero, Pillars, Teaser card. No database query needed.

2. CLICKS "SIGN UP" (`http://localhost:3000/signup`)
   - Route: `app/signup/page.tsx`
   - User inputs: name, email, password.
   - Action: Submits form → Browser sends POST `/api/auth/signup`.
   - Server: Hashes password with bcrypt → `INSERT INTO users` → signs JWT → sets `auth_token` cookie.
   - Redirect: Automatically transitions to `/onboarding`.

3. COMPLETES ONBOARDING (`http://localhost:3000/onboarding`)
   - User inputs username, 16+ age confirmation, creates first habit (e.g. "Morning Run"), and creates Pod.
   - Action: Context dispatches POST `/api/habits` and POST `/api/pods`.
   - Database: Inserts into `habits` and `pods`, establishes creator in `pod_memberships`.
   - Redirect: Transitions to `/today`.

4. ENTERS DASHBOARD (`http://localhost:3000/today`)
   - Middleware checks `auth_token` cookie → Valid → Allows access.
   - Root Layout wraps with `EmberProvider`.
   - `EmberProvider` calls GET `/api/bootstrap` in background → Populates user profile, habits, pods.
   - UI displays "My Personal Rituals" with 1-tap check-in card.

5. TAPS CHECK-IN
   - Circle turns bright green with checkmark instantly (optimistic).
   - Background POST `/api/checkins` records log in `habit_logs` table.
   - Streak updates to 1 day.

6. VISITS COMMUNITY FEED (`http://localhost:3000/feed`)
   - Writes a post: "Completed my morning run!" → Clicks Post.
   - Card appears immediately on top of the stream.
   - Dispatches POST `/api/posts` to persist in database.

7. LOGS OUT (`/settings`)
   - User clicks "Sign Out".
   - Dispatches POST `/api/auth/logout` → Server deletes `auth_token` cookie.
   - Client executes `localStorage.clear()` and `window.location.replace('/login')`.
   - Browser Back button is blocked from restoring cached authenticated pages via `Cache-Control: no-store`.
```

---

# STEP 11 & 12 — Runtime Behavior & Environment Variables

### Runtime Environments
- **`npm run dev`**: Runs Next.js with **Turbopack** incremental compiler. Hot Module Replacement (HMR) updates React components in memory.
- **`npm run build`**: Compiles all TypeScript files, executes type checking across all routes, compiles Tailwind CSS into optimized stylesheets, and outputs static and server-rendered route bundles.
- **`npm start`**: Production Node.js server serving compiled assets from `.next/`.

### Environment Variables Map

| Variable | Used By | Client or Server? | Purpose | Sensitivity |
| :--- | :--- | :--- | :--- | :--- |
| **`NEXT_PUBLIC_SUPABASE_URL`** | Supabase Client (`utils/supabase/*`) | Client & Server (`NEXT_PUBLIC_` prefix) | Base URL for your Supabase project API | Public (Safe to expose) |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Supabase Client (`utils/supabase/*`) | Client & Server (`NEXT_PUBLIC_` prefix) | Supabase Anonymous Public API Key (protected by RLS) | Public (Safe to expose) |
| **`JWT_SECRET`** | `utils/auth.ts`, `middleware.ts` | **Server Only** (No `NEXT_PUBLIC_`) | Secret cryptographic key used to sign and verify session JWTs | **CRITICAL: NEVER EXPOSE** |

---

# STEP 13 & 14 — Caching, Rendering & Error Handling

### Rendering & Caching Strategy
- **Client Route Group (`(app)`)**: Uses `'use client'` layouts with `key={pathname}` to force clean re-mounts on browser forward/back navigation.
- **Dynamic API Routes**: All API routes under `/api/*` use dynamic server execution (`cookies()`, `request.json()`), ensuring zero stale server caching.
- **Bfcache Prevention**: Protected pages send `Cache-Control: no-store, no-cache, must-revalidate` so sensitive habit/user data is never cached in browser back-forward memory after logout.

### Error Handling Flow
- If Supabase or network is offline:
  1. Route handlers catch errors in `try/catch` blocks and return structured JSON (`{ error: "..." }`) with HTTP status codes (400, 401, 404, 500).
  2. The client Context uses fallback default initial states (`INITIAL_USER`, `INITIAL_HABITS`) and local storage cache so the application never white-screens or crashes.

---

# STEP 15 & 16 — Architectural Review: Security & Performance Audits

### 🔒 Security Audit

| Finding | Severity | Analysis & Location | Status |
| :--- | :--- | :--- | :--- |
| **JWT Storage** | **SECURE** | Uses `HttpOnly=true` cookie (`auth_token`). Completely immune to JavaScript XSS theft. | Verified |
| **Password Storage** | **SECURE** | Uses `bcryptjs` with salt rounds = 10 before saving to database. | Verified |
| **Owner Verification on Deletions** | **SECURE** | Route handlers (`/api/posts/[id]`, `/api/habits/[id]`) verify `post.user_id === session.userId` before deleting. | Verified |
| **Middleware Protected Routes** | **RECOMMENDATION** | Add `/feed` to `PROTECTED_ROUTES` in `middleware.ts` so direct URL visits to `/feed` require login. | **Actionable** |
| **JWT Secret Fallback** | **RECOMMENDATION** | Ensure production `.env.production` defines a dedicated 64-char `JWT_SECRET`. | **Actionable** |

### ⚡ Performance Audit

| Optimization | Analysis | Status |
| :--- | :--- | :--- |
| **Decoupled Database Queries** | `/api/bootstrap` and `/api/habits` query tables with direct selects and resolve relations in parallel rather than failing on brittle PostgREST embedded joins. | Optimized |
| **Optimistic Mutations** | UI toggles, likes, and check-ins react in 0ms without waiting for round-trip HTTP requests. | Optimized |
| **Composite Database Indexes** | Indexes created on `habits(user_id)`, `habit_logs(user_id, logged_date)`, `posts(created_at DESC)` for sub-millisecond query execution. | Optimized |
| **Lazy Component Hydration** | Interactive modals (`HabitModal`, `ProofModal`, `ReplyThreadModal`) render conditionally only when opened. | Optimized |

---

# STEP 17 — The Disciplr Mental Model

Here is how to think about the application in simple, intuitive terms:

1. **Where does a request enter?**
   Every web request hits `middleware.ts` first. The middleware inspects the `auth_token` cookie. If valid, the request proceeds to the App Router.
2. **What runs in the browser vs server?**
   - **Server**: Password hashing, JWT signing/verifying, Supabase database queries.
   - **Browser**: React UI rendering, Lucide icons, Context state updates, local storage cache.
3. **How does data reach the database?**
   User clicks a button $\rightarrow$ Context optimistically updates local React state $\rightarrow$ dispatches `fetch('/api/...')` $\rightarrow$ Server Route Handler validates session $\rightarrow$ runs Supabase query $\rightarrow$ Postgres persists the row.
4. **How are habits separated?**
   Habits have `is_private: boolean` and `sharedPodIds: string[]`. When a user selects **"Me (Personal)"**, only their personal habits display. When they select a **Pod**, only habits shared with that Pod display.

---

# STEP 18 — "Learn This Codebase" Roadmap

To master and extend this codebase, study files in this exact sequence:

1. **The Contract**: `types/ember.ts` — Understand the domain models (`UserProfile`, `Habit`, `Pod`, `CheckInLog`, `Post`).
2. **The Database Schema**: `supabase/schema.sql` — Study how the 15 tables and foreign keys map to the TypeScript types.
3. **The Security Engine**: `utils/auth.ts` and `middleware.ts` — Learn how JWT tokens are issued, verified, and checked at the edge.
4. **The State Brain**: `context/ember-context.tsx` — See how optimistic updates and backend synchronization keep the UI responsive.
5. **The API Handlers**: `app/api/checkins/route.ts` and `app/api/posts/route.ts` — Study how server endpoints parse requests and interact with Supabase.
6. **The Core UI Views**: `app/(app)/today/page.tsx`, `app/(app)/feed/page.tsx`, and `components/profile/activity-calendar.tsx` — Trace how components consume Context and render interactive features.
