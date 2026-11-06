create policy "No direct client access to AI key metadata"
  on public.user_ai_credentials
  for all
  to anon, authenticated
  using (false)
  with check (false);
