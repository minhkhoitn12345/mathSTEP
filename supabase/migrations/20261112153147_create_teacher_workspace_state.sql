create table if not exists public.teacher_workspace_state (
  teacher_id uuid primary key references auth.users(id) on delete cascade,
  workspace jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint teacher_workspace_state_payload_size check (pg_column_size(workspace) <= 1048576)
);

alter table public.teacher_workspace_state enable row level security;
revoke all on table public.teacher_workspace_state from anon;
grant select, insert, update on table public.teacher_workspace_state to authenticated;

drop policy if exists "Teachers read their own workspace" on public.teacher_workspace_state;
drop policy if exists "Teachers create their own workspace" on public.teacher_workspace_state;
drop policy if exists "Teachers update their own workspace" on public.teacher_workspace_state;

create policy "Teachers read their own workspace"
  on public.teacher_workspace_state for select to authenticated
  using ((select auth.uid()) = teacher_id);

create policy "Teachers create their own workspace"
  on public.teacher_workspace_state for insert to authenticated
  with check ((select auth.uid()) = teacher_id);

create policy "Teachers update their own workspace"
  on public.teacher_workspace_state for update to authenticated
  using ((select auth.uid()) = teacher_id)
  with check ((select auth.uid()) = teacher_id);
