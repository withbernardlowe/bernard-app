# bernard-app

Yuren 自用的 PWA，作為 Claude app 和 Obsidian 撐不住的互動場景的長期基礎設施。Bernard 透過 Supabase MCP 餵資料，Yuren 在手機上使用。

## Stack

- Vite + React + TypeScript + Tailwind
- vite-plugin-pwa（離線可用 + 加到主畫面）
- Dexie（IndexedDB）做本地 cache + sync queue
- Supabase（Postgres + Auth magic link）
- GitHub Pages 部署（GitHub Actions）

## 架構

- 單一 repo、單一 Supabase DB、多 feature 並存
- Feature 之間用 table prefix 區隔（`jp_*`, `fin_*`, ...）
- Auth：magic link，只有 `yurenju@gmail.com` 可登入（首次註冊後關閉 signup + RLS email 雙層防護）
- Offline-first：本地寫 → sync queue → Supabase，last-write-wins

## Schema Pattern

每張 feature table 都照這個模板寫（共用 helper 在 `supabase/migrations/20260418032720_init.sql`）：

```sql
create table <prefix>_<name> (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  -- feature columns ...
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index on <prefix>_<name> (user_id);

alter table <prefix>_<name> enable row level security;

create policy "allowed_and_own" on <prefix>_<name>
  for all
  using (is_allowed_user() and user_id = auth.uid())
  with check (is_allowed_user() and user_id = auth.uid());

create trigger <prefix>_<name>_updated_at
  before update on <prefix>_<name>
  for each row execute function set_updated_at();
```

Checklist：
- [ ] `id uuid primary key default gen_random_uuid()`
- [ ] `user_id` 欄位 + FK + cascade
- [ ] `updated_at` + `created_at` 欄位
- [ ] `user_id` index
- [ ] enable RLS
- [ ] `allowed_and_own` policy
- [ ] `updated_at` trigger

## 專案文件

規劃與 Tasks 在 clawd workspace：`10-projects/2026-04-18_bernard-app/README.md`

## Features

- [ ] 日文閃卡（SM-2，第一個 feature）

## Development

待補（scaffold 尚未建立）。
