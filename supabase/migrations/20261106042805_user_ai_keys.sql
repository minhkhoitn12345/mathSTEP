create table public.user_ai_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  vault_secret_id uuid not null unique,
  updated_at timestamptz not null default now()
);

alter table public.user_ai_credentials enable row level security;
revoke all on public.user_ai_credentials from public, anon, authenticated, service_role;

create or replace function public.set_user_ai_key(p_user_id uuid, p_api_key text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret_id uuid;
  v_updated_at timestamptz;
begin
  if p_user_id is null or p_api_key is null
     or length(p_api_key) < 20 or length(p_api_key) > 512
     or p_api_key <> btrim(p_api_key)
     or p_api_key ~ '[^!-~]' then
    raise exception using errcode = '22023', message = 'Invalid API key';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select c.vault_secret_id into v_secret_id
  from public.user_ai_credentials c
  where c.user_id = p_user_id
  for update;

  if v_secret_id is null then
    v_secret_id := vault.create_secret(
      p_api_key,
      'mathstep_ai_key_' || p_user_id::text,
      'User AI provider key for account ' || p_user_id::text
    );
    insert into public.user_ai_credentials (user_id, vault_secret_id)
    values (p_user_id, v_secret_id)
    on conflict (user_id) do update
      set vault_secret_id = excluded.vault_secret_id,
          updated_at = now();
  else
    perform vault.update_secret(
      v_secret_id,
      p_api_key,
      'mathstep_ai_key_' || p_user_id::text,
      'User AI provider key for account ' || p_user_id::text
    );
  end if;

  update public.user_ai_credentials c
  set updated_at = now()
  where c.user_id = p_user_id
  returning c.updated_at into v_updated_at;
  return v_updated_at;
end;
$$;

create or replace function public.get_user_ai_key(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.decrypted_secret
  from public.user_ai_credentials c
  join vault.decrypted_secrets s on s.id = c.vault_secret_id
  where c.user_id = p_user_id
  limit 1
$$;

create or replace function public.get_user_ai_key_status(p_user_id uuid)
returns table (configured boolean, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select true, c.updated_at
  from public.user_ai_credentials c
  where c.user_id = p_user_id
  limit 1
$$;

create or replace function public.delete_user_ai_key(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret_id uuid;
begin
  delete from public.user_ai_credentials c
  where c.user_id = p_user_id
  returning c.vault_secret_id into v_secret_id;

  if v_secret_id is not null then
    delete from vault.secrets s where s.id = v_secret_id;
  end if;
end;
$$;

revoke all on function public.set_user_ai_key(uuid, text) from public, anon, authenticated;
revoke all on function public.get_user_ai_key(uuid) from public, anon, authenticated;
revoke all on function public.get_user_ai_key_status(uuid) from public, anon, authenticated;
revoke all on function public.delete_user_ai_key(uuid) from public, anon, authenticated;
grant execute on function public.set_user_ai_key(uuid, text) to service_role;
grant execute on function public.get_user_ai_key(uuid) to service_role;
grant execute on function public.get_user_ai_key_status(uuid) to service_role;
grant execute on function public.delete_user_ai_key(uuid) to service_role;
