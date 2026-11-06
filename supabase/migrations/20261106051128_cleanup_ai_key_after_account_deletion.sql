alter table public.user_ai_credentials
  add constraint user_ai_credentials_vault_secret_fkey
  foreign key (vault_secret_id)
  references vault.secrets (id)
  on delete cascade;
