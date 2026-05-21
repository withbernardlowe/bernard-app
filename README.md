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
- Auth：magic link + allowlist（`is_allowed_user()` function），signup 關閉（三層防護：signup disabled + email allowlist + `user_id = auth.uid()` RLS）
- 路由：HashRouter（`/#/jp` 等），GitHub Pages SPA 無需 server 設定
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

- [x] 日文閃卡（`/#/jp`）— SM-2、句子雙向、Dexie offline + sync queue、ruby toggle
- [x] 大字顯示（`/#/show`）— 地址/翻好的日文遞給對方看，auto-fit + 手動 +/-，localStorage 存 history（可 pin），獨立亮暗切換

## Development

### 第一次 setup

```bash
git clone git@github.com:withbernardlowe/bernard-app.git
cd bernard-app
bun install
cp .env.example .env.local
# 編輯 .env.local 填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
# 值在 1Password 的 "Bernard Supabase" item
bun dev  # http://localhost:5173
```

### 常用指令

| 指令 | 用途 |
|------|------|
| `bun dev` | dev server（HMR） |
| `bun run build` | 型別檢查 + 打包 |
| `bun test <path>` | 跑單元測試（SM-2 等 pure function） |
| `bunx shadcn@latest add <component>` | 加新的 shadcn UI 元件 |

### 加新 feature

1. 先在 clawd workspace 走 `superpowers:brainstorming` 討論 spec
2. 在 `supabase/migrations/` 新增 `YYYYMMDDHHMMSS_<name>.sql`，遵守上面的 **Schema Pattern**
3. 用 Supabase MCP `apply_migration` 推到遠端
4. 在 `src/features/<name>/` 開新目錄放所有程式
5. 在 `src/routes.tsx` 加新路由
6. env 變數（如果有）：本機 `.env.local` + `gh secret set` 設 CI secret

### 部署

- 推到 `main` → GitHub Actions 自動 build + deploy 到 https://app.withbernard.xyz
- 需要新 secret：`gh secret set <NAME> --body <value> --repo withbernardlowe/bernard-app`
- 本機驗證 build：`bun run build`

### Schema migration

- 本地改 `supabase/migrations/` 當 source of truth
- 遠端實際套 migration 用 Supabase MCP（`apply_migration`），不靠 Supabase CLI
- Dedupe：`on conflict (user_id, ...) do nothing` 讓重跑 import idempotent

### Offline / Sync

- UI 讀 Dexie 為主（source of truth for render）
- 初次 load：從 Supabase pull 進 Dexie
- 寫入：local update + push 到 `sync_queue` → 背景 flush 到 Supabase
- 離線時 grade 照樣前進，重新連線 / tab 回到前景時自動 flush

### Troubleshooting

- **Build fail 找不到 `bun:test`**：`tsconfig.app.json` 已排除 `*.test.ts`，確認沒被還原
- **Magic link redirect 失敗**：檢查 Supabase dashboard → Auth → URL Configuration 有 `https://app.withbernard.xyz/**` 和 `http://localhost:5173/**`
- **Pages build 過了但瀏覽器看到舊版**：Cloudflare CDN cache，等 10 分鐘或 purge cache
