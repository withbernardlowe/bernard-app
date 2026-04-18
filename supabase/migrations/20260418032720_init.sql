-- 初始 migration：放一張最小的 meta table 當 bootstrap placeholder。
-- 真實的 feature tables（jp_*, fin_*, ...）會在後續 migration 加。

create table app_meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_meta enable row level security;

-- 只允許 yurenju@gmail.com 讀寫。未來所有 feature tables 都套同樣 pattern。
create policy "owner_only" on app_meta
  for all
  using (auth.jwt() ->> 'email' = 'yurenju@gmail.com')
  with check (auth.jwt() ->> 'email' = 'yurenju@gmail.com');

insert into app_meta (key, value) values
  ('schema_version', '"0.1.0"'::jsonb);
