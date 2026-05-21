export type DisplayMode = 'light' | 'dark'

export interface HistoryItem {
  id: string
  text: string
  pinned: boolean
  lastUsedAt: number
}

export interface Stored {
  current: string
  history: HistoryItem[]
  displayMode: DisplayMode
}

const KEY = 'big-text:v1'
const MAX_UNPINNED = 10

const EMPTY: Stored = {
  current: '',
  history: [],
  displayMode: 'light',
}

export function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<Stored>
    return {
      current: typeof parsed.current === 'string' ? parsed.current : '',
      history: Array.isArray(parsed.history) ? parsed.history.filter(isValidItem) : [],
      displayMode: parsed.displayMode === 'dark' ? 'dark' : 'light',
    }
  } catch {
    return { ...EMPTY }
  }
}

export function write(s: Stored): void {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function setCurrent(text: string): Stored {
  const s = read()
  const next = { ...s, current: text }
  write(next)
  return next
}

export function setDisplayMode(mode: DisplayMode): Stored {
  const s = read()
  const next = { ...s, displayMode: mode }
  write(next)
  return next
}

export function commitToHistory(text: string): Stored {
  const trimmed = text.trim()
  if (!trimmed) return read()

  const s = read()
  const existing = s.history.find((h) => h.text === trimmed)
  let history: HistoryItem[]

  if (existing) {
    history = s.history.map((h) =>
      h.id === existing.id ? { ...h, lastUsedAt: Date.now() } : h,
    )
  } else {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      text: trimmed,
      pinned: false,
      lastUsedAt: Date.now(),
    }
    history = [item, ...s.history]
  }

  history = pruneUnpinned(history)
  const next = { ...s, history }
  write(next)
  return next
}

export function togglePin(id: string): Stored {
  const s = read()
  const history = pruneUnpinned(
    s.history.map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h)),
  )
  const next = { ...s, history }
  write(next)
  return next
}

export function removeItem(id: string): Stored {
  const s = read()
  const next = { ...s, history: s.history.filter((h) => h.id !== id) }
  write(next)
  return next
}

export function sortedHistory(history: HistoryItem[]): HistoryItem[] {
  return [...history].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.lastUsedAt - a.lastUsedAt
  })
}

function pruneUnpinned(history: HistoryItem[]): HistoryItem[] {
  const pinned = history.filter((h) => h.pinned)
  const unpinned = history
    .filter((h) => !h.pinned)
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, MAX_UNPINNED)
  return [...pinned, ...unpinned]
}

function isValidItem(x: unknown): x is HistoryItem {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.text === 'string' &&
    typeof o.pinned === 'boolean' &&
    typeof o.lastUsedAt === 'number'
  )
}
