alter table public.user_ai_credentials
  drop constraint user_ai_credentials_vault_secret_fkey;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;

create or replace function private.cleanup_deleted_user_ai_key()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from vault.secrets s where s.id = old.vault_secret_id;
  return old;
end;
$$;

revoke all on function private.cleanup_deleted_user_ai_key() from public, anon, authenticated, service_role;

create trigger cleanup_user_ai_vault_secret
  after delete on public.user_ai_credentials
  for each row execute function private.cleanup_deleted_user_ai_key();
