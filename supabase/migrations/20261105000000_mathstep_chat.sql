create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module text not null check (module in ('linear_programming', 'spatial_geometry', 'trigonometry')),
  title text not null check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 5000),
  intent text,
  learning_stage text check (learning_stage in ('observe', 'predict', 'manipulate', 'explore', 'verify', 'explain', 'transfer', 'apply')),
  hint_level smallint check (hint_level between 1 and 4),
  math_validation jsonb,
  created_at timestamptz not null default now()
);

create index conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);
create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);
create index messages_user_created_idx
  on public.messages (user_id, created_at desc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on public.conversations, public.messages from public, anon, authenticated;
grant usage on schema public to authenticated, service_role;
grant select on public.conversations, public.messages to authenticated;

create policy "Users read their conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users read their messages"
  on public.messages for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.record_chat_turn(
  p_user_id uuid,
  p_conversation_id uuid,
  p_module text,
  p_title text,
  p_user_content text,
  p_assistant_content text,
  p_intent text,
  p_learning_stage text,
  p_hint_level smallint,
  p_math_validation jsonb
)
returns table (conversation_id uuid, message_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation_id uuid;
  v_message_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' or p_user_id is null then
    raise exception using errcode = '42501', message = 'Trusted server role required';
  end if;

  if p_conversation_id is null then
    insert into public.conversations (user_id, module, title)
    values (p_user_id, p_module, left(p_title, 120))
    returning id into v_conversation_id;
  else
    select c.id into v_conversation_id
    from public.conversations c
    where c.id = p_conversation_id and c.user_id = p_user_id
    for update;

    if v_conversation_id is null then
      raise exception using errcode = '42501', message = 'Conversation not found';
    end if;

    update public.conversations c
    set updated_at = now()
    where c.id = v_conversation_id;
  end if;

  insert into public.messages (conversation_id, user_id, role, content, learning_stage)
  values (v_conversation_id, p_user_id, 'user', p_user_content, p_learning_stage);

  insert into public.messages (
    conversation_id, user_id, role, content, intent, learning_stage, hint_level, math_validation
  )
  values (
    v_conversation_id, p_user_id, 'assistant', p_assistant_content,
    p_intent, p_learning_stage, p_hint_level, p_math_validation
  )
  returning id into v_message_id;

  update public.conversations c
  set updated_at = now()
  where c.id = v_conversation_id;

  return query select v_conversation_id, v_message_id;
end;
$$;

revoke all on function public.record_chat_turn(uuid, uuid, text, text, text, text, text, text, smallint, jsonb) from public, anon, authenticated;
grant execute on function public.record_chat_turn(uuid, uuid, text, text, text, text, text, text, smallint, jsonb) to service_role;
