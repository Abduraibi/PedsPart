-- ============================================================================
--  PEDIATRICS PART 1 — BOARD TRAINER  ·  Supabase database setup
--  Run this ONCE in your Supabase project:
--     Supabase dashboard → SQL Editor → New query → paste all of this → Run
-- ============================================================================

-- 1. Table that stores each user's entire study progress as one JSON blob.
--    (Simple, fast, and everything syncs in a single row per user.)
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Turn on Row Level Security so each user can ONLY read/write their own row.
alter table public.progress enable row level security;

-- 3. Policies: a logged-in user may see and modify only the row whose
--    user_id matches their own auth id.
drop policy if exists "own progress - select" on public.progress;
create policy "own progress - select"
  on public.progress for select
  using ( auth.uid() = user_id );

drop policy if exists "own progress - insert" on public.progress;
create policy "own progress - insert"
  on public.progress for insert
  with check ( auth.uid() = user_id );

drop policy if exists "own progress - update" on public.progress;
create policy "own progress - update"
  on public.progress for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- Done. No other tables are needed — questions ship inside the app file,
-- and page-snapshot images live in Supabase Storage (see the setup guide).
