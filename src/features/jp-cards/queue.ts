import type { LocalCard } from '@/lib/db'

export interface QueueSettings {
  dailyNewLimit: number
}

export function getDueQueue(
  cards: LocalCard[],
  settings: QueueSettings,
  now: Date,
): LocalCard[] {
  const nowIso = now.toISOString()

  const dueOld = cards
    .filter((c) => c.repetitions > 0 && c.due_at <= nowIso)
    .sort((a, b) => a.due_at.localeCompare(b.due_at))

  const newCards = cards
    .filter((c) => c.repetitions === 0)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, settings.dailyNewLimit)

  return [...dueOld, ...newCards]
}
