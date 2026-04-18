-- Shared schema for bernard-app.
-- - is_allowed_user(): RLS helper, email allowlist
-- - set_updated_at(): trigger function for updated_at bookkeeping
-- - app_meta: per-user key/value settings
-- Feature tables (jp_*, fin_*, ...) follow the same RLS+trigger pattern;
-- see bernard-app README for the template.

create or replace function is_allowed_user() returns boolean
  language sql stable
as $$
  select auth.jwt() ->> 'email' in (
    'calm.comb3410@brewisle.xyz',
    'withbernardlowe@gmail.com'
  )
$$;

create or replace function set_updated_at() returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table app_meta (
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table app_meta enable row level security;

create policy "allowed_and_own" on app_meta
  for all
  using (is_allowed_user() and user_id = auth.uid())
  with check (is_allowed_user() and user_id = auth.uid());

create trigger app_meta_updated_at
  before update on app_meta
  for each row execute function set_updated_at();
