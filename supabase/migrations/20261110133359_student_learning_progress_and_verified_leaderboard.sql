create table public.student_learning_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  progress jsonb not null default '{}'::jsonb check (jsonb_typeof(progress) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.student_learning_progress enable row level security;
revoke all on public.student_learning_progress from public, anon, authenticated;
grant select, insert, update on public.student_learning_progress to authenticated;

create policy "Students read their own learning progress"
  on public.student_learning_progress for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Students create their own learning progress"
  on public.student_learning_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Students update their own learning progress"
  on public.student_learning_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table public.course_lessons (
  lesson_id text primary key,
  module_id text not null check (module_id in ('linear_programming', 'spatial_geometry', 'trigonometry')),
  lesson_order smallint not null check (lesson_order between 1 and 5),
  xp_reward integer not null check (xp_reward between 1 and 200),
  unique (module_id, lesson_order)
);

insert into public.course_lessons (lesson_id, module_id, lesson_order, xp_reward) values
  ('lp-lesson-1', 'linear_programming', 1, 50),
  ('lp-lesson-2', 'linear_programming', 2, 60),
  ('lp-lesson-3', 'linear_programming', 3, 70),
  ('lp-lesson-4', 'linear_programming', 4, 80),
  ('lp-lesson-5', 'linear_programming', 5, 90),
  ('sg-lesson-1', 'spatial_geometry', 1, 60),
  ('sg-lesson-2', 'spatial_geometry', 2, 70),
  ('sg-lesson-3', 'spatial_geometry', 3, 70),
  ('sg-lesson-4', 'spatial_geometry', 4, 80),
  ('sg-lesson-5', 'spatial_geometry', 5, 90),
  ('trig-lesson-1', 'trigonometry', 1, 60),
  ('trig-lesson-2', 'trigonometry', 2, 70),
  ('trig-lesson-3', 'trigonometry', 3, 80),
  ('trig-lesson-4', 'trigonometry', 4, 80),
  ('trig-lesson-5', 'trigonometry', 5, 90);

alter table public.course_lessons enable row level security;
revoke all on public.course_lessons from public, anon, authenticated;

create table public.student_lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.course_lessons (lesson_id),
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index student_lesson_completions_lesson_idx
  on public.student_lesson_completions (lesson_id, completed_at desc);
alter table public.student_lesson_completions enable row level security;
revoke all on public.student_lesson_completions from public, anon, authenticated;

create table public.student_study_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  study_date date not null default current_date,
  primary key (user_id, study_date)
);
alter table public.student_study_days enable row level security;
revoke all on public.student_study_days from public, anon, authenticated;

alter table public.student_leaderboard
  add column verified_total_xp integer not null default 0 check (verified_total_xp between 0 and 2000),
  add column verified_longest_streak_days integer not null default 0 check (verified_longest_streak_days between 0 and 36500),
  add column verified_completed_lessons integer not null default 0 check (verified_completed_lessons between 0 and 15);

create index student_leaderboard_verified_xp_idx
  on public.student_leaderboard (verified_total_xp desc, updated_at asc);
create index student_leaderboard_verified_streak_idx
  on public.student_leaderboard (verified_longest_streak_days desc, updated_at asc);
create index student_leaderboard_verified_lessons_idx
  on public.student_leaderboard (verified_completed_lessons desc, updated_at asc);

drop policy if exists "Users can create their own leaderboard entry" on public.student_leaderboard;
drop policy if exists "Users can update their own leaderboard entry" on public.student_leaderboard;
revoke insert, update, delete on public.student_leaderboard from public, anon, authenticated;
revoke insert (user_id, display_name, total_xp, longest_streak_days, completed_lessons, updated_at),
  update (display_name, total_xp, longest_streak_days, completed_lessons, updated_at)
  on public.student_leaderboard from public, anon, authenticated;
grant select on public.student_leaderboard to authenticated;

create or replace function public.record_lesson_completion(p_lesson_id text)
returns table (
  total_xp integer,
  longest_streak_days integer,
  completed_lessons integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_lesson_xp integer;
  v_total_xp integer;
  v_completed_lessons integer;
  v_longest_streak integer;
  v_display_name text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select lesson.xp_reward into v_lesson_xp
  from public.course_lessons as lesson
  where lesson.lesson_id = p_lesson_id;

  if v_lesson_xp is null then
    raise exception using errcode = '22023', message = 'Unknown lesson';
  end if;

  insert into public.student_lesson_completions (user_id, lesson_id)
  values (v_user_id, p_lesson_id)
  on conflict (user_id, lesson_id) do nothing;
  insert into public.student_study_days (user_id, study_date)
  values (v_user_id, current_date)
  on conflict (user_id, study_date) do nothing;

  select coalesce(sum(lesson.xp_reward), 0)::integer, count(*)::integer
  into v_total_xp, v_completed_lessons
  from public.student_lesson_completions as completion
  join public.course_lessons as lesson using (lesson_id)
  where completion.user_id = v_user_id;

  with dated_days as (
    select study_date,
      study_date - row_number() over (order by study_date)::integer as streak_group
    from public.student_study_days
    where user_id = v_user_id
  ), streaks as (
    select count(*)::integer as day_count, max(study_date) as last_day
    from dated_days
    group by streak_group
  )
  select coalesce(max(day_count), 0),
    coalesce(max(day_count) filter (where last_day >= current_date - 1), 0)
  into v_longest_streak
  from streaks;

  select coalesce(
    nullif(left(btrim(auth_user.raw_user_meta_data ->> 'full_name'), 80), ''),
    nullif(left(btrim(auth_user.raw_user_meta_data ->> 'name'), 80), ''),
    'Hoc sinh'
  )
  into v_display_name
  from auth.users as auth_user
  where auth_user.id = v_user_id;

  insert into public.student_leaderboard (
    user_id, display_name, total_xp, longest_streak_days, completed_lessons,
    verified_total_xp, verified_longest_streak_days, verified_completed_lessons, updated_at
  ) values (
    v_user_id, coalesce(v_display_name, 'Hoc sinh'), 0, 0, 0,
    v_total_xp, v_longest_streak, v_completed_lessons, now()
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    verified_total_xp = excluded.verified_total_xp,
    verified_longest_streak_days = excluded.verified_longest_streak_days,
    verified_completed_lessons = excluded.verified_completed_lessons,
    updated_at = excluded.updated_at;

  return query select v_total_xp, v_longest_streak, v_completed_lessons;
end;
$$;

revoke all on function public.record_lesson_completion(text) from public, anon;
grant execute on function public.record_lesson_completion(text) to authenticated;
