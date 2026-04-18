# Theme Toggle (Light / Dark / System)

日期：2026-04-19

## 目標

加入 light / dark / system 三段主題切換，偏好存在 `localStorage`，不同步到 Supabase。

## 前提

- shadcn 已在 `src/index.css` 定義 `.dark` 變數與 `@custom-variant dark (&:is(.dark *));`
- `AuthenticatedApp` 已有 header，LoginPage 是獨立 full-screen 頁面

## 架構

### `src/lib/theme.ts`

純函式模組。

- `type Theme = 'light' | 'dark' | 'system'`
- `STORAGE_KEY = 'theme'`
- `getStoredTheme(): Theme` — 讀 localStorage，非合法值回 `'system'`
- `setStoredTheme(t: Theme): void`
- `resolveTheme(t: Theme): 'light' | 'dark'` — `'system'` 查 `matchMedia('(prefers-color-scheme: dark)')`
- `applyTheme(t: Theme): void` — 根據 resolved 值 toggle `document.documentElement.classList` 的 `dark`

### `src/hooks/useTheme.ts`

React hook，回傳 `{ theme, setTheme, resolved }`。

- 初始 state 讀自 `getStoredTheme()`
- `setTheme`：寫 localStorage + `applyTheme`
- 訂閱 `matchMedia` change：若當前選擇是 `'system'`，重新 apply
- cleanup listener

### `src/components/ThemeToggle.tsx`

三顆小 icon button（Sun / Monitor / Moon），當前值用 `bg-accent` 高亮。用 `lucide-react`。

### 整合點

- `AuthenticatedApp` header：登出按鈕左邊插入 `<ThemeToggle />`
- `LoginPage`：右上角絕對定位 `<ThemeToggle />`

### FOUC 防範

`index.html` `<head>` 內插同步 inline script：

```js
(function(){
  try {
    var t = localStorage.getItem('theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
```

## 非目標（YAGNI）

- 不做 Context Provider
- 不做切換動畫
- 不存 resolved 值，只存使用者選擇
- 不同步到 Supabase
