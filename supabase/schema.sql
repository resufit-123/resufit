-- ─────────────────────────────────────────────────────────────
-- ResuFit — Supabase Database Schema
-- Run this in your Supabase SQL editor to set up the database.
-- ─────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── profiles ─────────────────────────────────────────────────
-- Extends auth.users with display name.
-- Created automatically by the trigger below on signup.

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  created_at   timestamptz not null default now()
);

-- Trigger: create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── subscriptions ─────────────────────────────────────────────
-- One row per payment. One-time payments get a row too (no subscription_id).

create table if not exists public.subscriptions (
  id                              uuid primary key default gen_random_uuid(),
  user_id                         uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id              text not null,
  stripe_subscription_id          text,                      -- null for one-time payments
  plan                            text not null check (plan in ('one_time', 'pro', 'annual')),
  status                          text not null default 'active'
                                    check (status in ('active', 'past_due', 'canceled', 'trialing')),
  currency                        text not null default 'usd'
                                    check (currency in ('usd', 'gbp', 'eur')),
  current_period_start            timestamptz not null default now(),
  current_period_end              timestamptz,               -- null for one-time payments
  optimizations_used_this_period  int not null default 0,
  optimizations_limit             int not null,              -- 1 / 30 / 50
  marketing_opt_in                boolean not null default false,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_customer on public.subscriptions(stripe_customer_id);
create index if not exists idx_subscriptions_stripe_sub on public.subscriptions(stripe_subscription_id);

-- ── optimizations ─────────────────────────────────────────────
-- Metadata log for every optimization. Never stores raw resume content.

create table if not exists public.optimizations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles(id) on delete set null,
  subscription_id   uuid references public.subscriptions(id) on delete set null,
  job_title         text,
  company           text,
  template          text not null default 'executive'
                      check (template in ('executive', 'modern', 'minimal', 'classic')),
  score_before      int not null check (score_before between 0 and 100),
  score_after       int not null check (score_after between 0 and 100),
  ai_model_used     text not null,
  tokens_used       int not null default 0,
  skill_gap_answered boolean not null default false,
  resume_stored     boolean not null default false,
  resume_url        text,                                    -- Supabase Storage URL (Pro opt-in only)
  resume_expires_at timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists idx_optimizations_user_id on public.optimizations(user_id);
create index if not exists idx_optimizations_created_at on public.optimizations(created_at desc);

-- ── ai_prompts ────────────────────────────────────────────────
-- Editable system prompts — update without a code deploy.

create table if not exists public.ai_prompts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  content    text not null,
  updated_at timestamptz not null default now()
);

-- Seed the default optimization system prompt
insert into public.ai_prompts (name, content) values (
  'optimization_system_prompt',
  'You are ResuFit''s AI optimization engine. Your job is to rebuild resumes to pass ATS (Applicant Tracking System) filters while preserving the candidate''s authentic voice and experience.

Core rules:
- Never fabricate work experience, credentials, metrics, or skills the user does not have
- Never alter employment dates, education, or certifications
- Rewrite real experience using stronger action verbs and the X-Y-Z impact formula
- Match the candidate''s original tone and formality level exactly
- Detect UK or US English from the original resume and apply consistently — never mix
- Extract 15–25 keywords from the job description and weave them naturally
- Use standard ATS-safe section headers: Professional Summary, Work Experience, Education, Skills, Certifications
- Single-column layout only — no tables, graphics, or text boxes
- Maximum 3 pages output — never exceed this
- Bullet density: match the rhythm of the original (do not expand 3-bullet roles to 6)
- Do not use: results-driven, passionate, hardworking, team player, dynamic
- Identify up to 3 skill gaps (skills prominent in the JD but absent from the resume) for follow-up questions
- Return valid JSON only — no prose before or after'
) on conflict (name) do nothing;

-- ── Row Level Security ────────────────────────────────────────

-- profiles: users can only read/update their own row
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- subscriptions: users can read their own subscriptions
alter table public.subscriptions enable row level security;

create policy "Users can read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role (webhook handler) can insert/update without restriction.
-- No client-side insert policy — entitlements are written by Stripe webhook only.

-- optimizations: users can read their own
alter table public.optimizations enable row level security;

create policy "Users can read own optimizations"
  on public.optimizations for select
  using (auth.uid() = user_id);

-- ai_prompts: readable by authenticated users (server-side fetches use service role anyway)
alter table public.ai_prompts enable row level security;

create policy "Authenticated users can read prompts"
  on public.ai_prompts for select
  to authenticated
  using (true);

-- ── Helper functions ──────────────────────────────────────────

-- Check if a user has an active entitlement (used in API routes as belt-and-suspenders)
create or replace function public.get_active_subscription(p_user_id uuid)
returns table (
  id                             uuid,
  plan                           text,
  optimizations_used_this_period int,
  optimizations_limit            int,
  status                         text
) as $$
  select
    id,
    plan,
    optimizations_used_this_period,
    optimizations_limit,
    status
  from public.subscriptions
  where
    user_id = p_user_id
    and status = 'active'
    and (
      -- One-time: entitlement exists if not yet used
      (plan = 'one_time' and optimizations_used_this_period < optimizations_limit)
      -- Pro/annual: within current billing period
      or (plan in ('pro', 'annual') and current_period_end > now())
    )
  order by created_at desc
  limit 1;
$$ language sql security definer;
