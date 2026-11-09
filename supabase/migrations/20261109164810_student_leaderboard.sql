create table public.student_leaderboard (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  total_xp integer not null default 0 check (total_xp between 0 and 2000),
  longest_streak_days integer not null default 0 check (longest_streak_days between 0 and 36500),
  completed_lessons integer not null default 0 check (completed_lessons between 0 and 15),
  updated_at timestamptz not null default now()
);

create index student_leaderboard_xp_idx
  on public.student_leaderboard (total_xp desc, updated_at asc);
create index student_leaderboard_streak_idx
  on public.student_leaderboard (longest_streak_days desc, updated_at asc);
create index student_leaderboard_lessons_idx
  on public.student_leaderboard (completed_lessons desc, updated_at asc);

alter table public.student_leaderboard enable row level security;
revoke all on public.student_leaderboard from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.student_leaderboard to authenticated;
grant insert (user_id, display_name, total_xp, longest_streak_days, completed_lessons, updated_at)
  on public.student_leaderboard to authenticated;
grant update (display_name, total_xp, longest_streak_days, completed_lessons, updated_at)
  on public.student_leaderboard to authenticated;

create policy "Authenticated users can read leaderboard entries"
  on public.student_leaderboard for select to authenticated
  using (true);

create policy "Users can create their own leaderboard entry"
  on public.student_leaderboard for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own leaderboard entry"
  on public.student_leaderboard for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
