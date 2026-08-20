# Project Instructions & Architectural Guardrails
**Product:** Proof of Work (PoW) Habit Tracker (`Disciplr`)

This document serves as the global system prompt and architectural guardrails for all AI assistance, development workflows, and code generation across the project codebase.

---

## 1. Tech Stack & Standards

- **Core Framework:** Next.js (App Router with `app/` directory).
- **Styling:** Tailwind CSS (Vanilla CSS & Tailwind utility classes).
- **Backend & Database:** Supabase (`@supabase/supabase-js` and `@supabase/ssr`).
- **Server Components by Default:** All React components must be Server Components by default. Only use `'use client'` when client interactivity (hooks, state, event listeners) is strictly required.
- **Server Actions for Mutations:** All data mutations (inserts, updates, deletes) must be executed using Next.js Server Actions (`'use server'`).
- **Strict TypeScript:** Full type safety is mandatory. Do not use `any`. Define strong types or generate Supabase database types for all schema models and API returns.

---

## 2. Scalability & Performance Directives

Based on the Non-Functional Requirements of the PRD:

- **Storage Rule:** All user proof uploads (photos, screenshots, images) **MUST** utilize Supabase Storage buckets. Base64 encoded images or binary blobs in PostgreSQL tables are **strictly forbidden**. Only public/signed storage bucket URLs (text) may be stored in database fields (`proof_image_url`).
- **Flex Card Performance Target:** The auto-generated "Flex Card" image generation (1200x630 shareable assets) must be optimized to generate in **under 2 seconds** to eliminate user drop-off. Server-side rendering, canvas generation, or edge functions must be lean and lightweight.

---

## 3. Data Integrity & Security

- **Mandatory Row Level Security (RLS):** Every table created in PostgreSQL **MUST** have Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
- **User Data Isolation:** Every RLS policy must strictly isolate user data so authenticated users (`auth.uid()`) can only read, insert, update, or delete their own rows unless explicitly exposed via a public share policy.

---

> [!IMPORTANT]
> ## 4. The Timezone Mandate
> **Streak calculations are the core metric of this application.**
> 1. **UTC Storage:** All database timestamps (`created_at`, updated times) MUST be stored in UTC format (`TIMESTAMPTZ`).
> 2. **Timezone-Aware Calculations:** All streak evaluation logic, daily check-in roll-overs, and grace period handling MUST convert timestamps to the user's specific local timezone (`user_timezone`, e.g., `America/New_York`, `Asia/Kolkata`).
> 3. Never calculate streaks based purely on server system time or un-adjusted UTC dates. A user's "day" ends at midnight in *their* local time zone.

---

## 5. Step-by-Step AI Execution Directive

- **Scope Control:** Always complete **ONLY** the specific task requested in the current prompt.
- **No Premature Implementation:** Do **NOT** jump ahead to future epics, create unasked UI pages, or add unprompted backend logic defined in the PRD until explicitly instructed by the user.
- **No Hallucinations:** Never assume unstated API contracts or missing database schema fields. Inspect existing source code and schema before implementing changes.
