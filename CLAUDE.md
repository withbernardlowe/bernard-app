# CLAUDE.md

## UI 組件：優先用 shadcn

**順序**：需要新的 UI primitive（Dialog、Popover、Dropdown、Tooltip、Toast…）時

1. 先查 shadcn 有沒有現成的：https://ui.shadcn.com/docs/components
2. 有 → `bunx shadcn@latest add <component>`，讓 CLI 照 `components.json` 放進 `src/components/ui/`
3. 沒有 → 才自己照 shadcn 風格包 Radix primitive（`radix-ui` barrel + `cn()` + `data-slot`）

原因：shadcn 的元件維護度高、樣式一致、未來升級有跡可循，自己寫容易跟 repo 其他 `ui/` 慣例偏掉。

業務組件（`src/features/**`、`src/components/*`，不含 `ui/`）**不要**直接 import Radix，都走 `@/components/ui/*`。

## 技術棧

- React + Vite + TypeScript
- Tailwind CSS + shadcn（`components.json` 已設 `radix-nova` style）
- Supabase（auth + Postgres + RLS）
- HashRouter（`/#/jp` 等）
- Dexie（local-first，SM-2 閃卡）

## 部署

- `bun run build` → Cloudflare Pages（`app.withbernard.xyz`）
- Schema 改動走 migration：`supabase/migrations/`
