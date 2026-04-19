# CLAUDE.md

## UI 組件：用 shadcn 模式

所有 UI primitive 放在 `src/components/ui/`，用 shadcn 慣例包裝 Radix：

- 用 `radix-ui` barrel import：`import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"`
- 樣式用 Tailwind + `cn()` helper
- 標上 `data-slot` 屬性
- 匯出命名的子組件（例：`DropdownMenuTrigger`、`DropdownMenuContent`），不要讓 caller 直接碰 Radix primitive

現有範本：`src/components/ui/button.tsx`、`src/components/ui/dropdown-menu.tsx`。

需要新的 primitive（Dialog、Popover、Tooltip…）時，照同樣模式新增到 `ui/`，不要在業務組件裡直接寫 Radix。

## 技術棧

- React + Vite + TypeScript
- Tailwind CSS + shadcn 風格組件
- Supabase（auth + Postgres + RLS）
- HashRouter（`/#/jp` 等）
- Dexie（local-first，SM-2 閃卡）

## 部署

- `bun run build` → Cloudflare Pages（`app.withbernard.xyz`）
- Schema 改動走 migration：`supabase/migrations/`
