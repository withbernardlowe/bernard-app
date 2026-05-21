# 大字顯示

日期：2026-05-21
路由：`/#/show`

## 目標

把一段文字（地址、預先翻好的日文）用最大字顯示給對方看。

典型情境：
- 計程車上把目的地地址給司機讀
- 在窗口 / 櫃台把預先翻好的日文給承辦看

純前端，localStorage 存資料，不進 Supabase。

## 決策

- 預設 auto-fit（輸入後自動算出最大字級鋪滿螢幕），可手動微調
- 編輯 / 顯示兩個模式分開：編輯模式像普通筆記，按「顯示」進入全螢幕大字
- 顯示模式有獨立的「亮 / 暗」切換鈕（不跟 app theme 走），方便依現場光線選擇
- 歷史紀錄保留最近 10 筆，可 pin 置頂（家裡 / 公司地址常用）
- 螢幕方向：手機原生，不鎖、不為橫向特化

## 架構

### 路由

`/#/show` — 加進 `src/routes.tsx`

### 目錄結構

```
src/features/big-text/
  BigTextPage.tsx       — entry，管理 edit/display 模式
  EditMode.tsx          — textarea + 歷史列表
  DisplayMode.tsx       — 全螢幕大字 + auto-fit + 工具列
  storage.ts            — localStorage CRUD（current + history）
  auto-fit.ts           — 純函式：算出剛好不溢出的最大 font-size
```

### localStorage schema

```ts
const KEY = 'big-text:v1'

type Stored = {
  current: string           // 當前編輯中的文字
  history: HistoryItem[]    // 最多 10 筆 + 所有 pinned
  displayMode: 'light' | 'dark'  // 顯示模式背景色（獨立於 app theme）
}

type HistoryItem = {
  id: string                // crypto.randomUUID()
  text: string
  pinned: boolean
  lastUsedAt: number        // Date.now()
}
```

History 規則：
- 進入顯示模式時把當前 text upsert 進 history（相同 text 比對 → 更新 `lastUsedAt`）
- 排序：pinned 在前，各自區段內按 `lastUsedAt` desc
- 上限 10：超過時砍掉 pinned=false 中最舊的；pinned 不計入上限

### 編輯模式 UI

- 上半：`<textarea>` 多行輸入，placeholder 提示
- 下半：歷史列表，每筆顯示前 1–2 行 + pin 圖示 + 刪除
- 底部固定一顆「顯示」大按鈕，進顯示模式

### 顯示模式 UI

- 全螢幕，背景色由 `displayMode` 決定（白底黑字 / 黑底白字）
- 文字水平垂直置中，`white-space: pre-wrap` 保留換行
- 預設 auto-fit
- 點一下螢幕呼出工具列（淡入，3 秒後淡出）：
  - 退出（回編輯模式）
  - 亮 / 暗切換
  - 字級 +/-（按一次後脫離 auto-fit，進入手動模式；長按或專屬按鈕回 auto）

### auto-fit 演算法

純函式 `fitFontSize(text: string, containerW: number, containerH: number): number`

- Binary search font-size，範圍 16 ~ 400px
- 每次測試：render 到隱藏 div（同樣的 line-height、字型、padding、white-space），量 `scrollWidth` / `scrollHeight`
- 收斂條件：不溢出且差距 < 2px，或迭代 > 20 次
- React 中：用 `ResizeObserver` 偵測容器尺寸變化（旋轉螢幕、鍵盤彈出）重算

### 模式切換

`BigTextPage` 用 local state `mode: 'edit' | 'display'`。不進 URL，重整回到 edit。

## 非目標 (YAGNI)

- 不上 Supabase（純本機資料）
- 不鎖橫向、不做橫向特化
- 不做螢幕亮度控制 / wake lock
- 不做多語切換 / TTS
- 不做密碼鎖（借手機看歷史不是安全議題）
- 不做匯出 / 分享
