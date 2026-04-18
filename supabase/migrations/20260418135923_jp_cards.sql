create table jp_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  direction text not null check (direction in ('jp_to_cn', 'cn_to_jp')),
  jp_text text not null,
  cn_text text not null,

  source_note text not null,
  source_section text,

  ease_factor real not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,

  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  unique (user_id, direction, jp_text)
);

create index on jp_cards (user_id, due_at);
create index on jp_cards (user_id);

alter table jp_cards enable row level security;

create policy "allowed_and_own" on jp_cards
  for all
  using (is_allowed_user() and user_id = auth.uid())
  with check (is_allowed_user() and user_id = auth.uid());

create trigger jp_cards_updated_at
  before update on jp_cards
  for each row execute function set_updated_at();
