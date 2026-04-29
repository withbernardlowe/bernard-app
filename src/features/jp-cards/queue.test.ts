import { describe, test, expect } from 'bun:test'
import { groupByLesson } from './queue'
import type { LocalCard } from '@/lib/db'

function card(overrides: Partial<LocalCard>): LocalCard {
  return {
    id: 'id-' + Math.random(),
    user_id: 'u',
    direction: 'jp_to_cn',
    jp_text: 'jp',
    cn_text: 'cn',
    source_note: '30-resources/japanese-learning/2026-04-29.md',
    source_section: null,
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    due_at: '2026-04-29T00:00:00Z',
    last_reviewed_at: null,
    updated_at: '2026-04-29T00:00:00Z',
    created_at: '2026-04-29T00:00:00Z',
    ...overrides,
  }
}

describe('groupByLesson', () => {
  test('returns [] for empty input', () => {
    expect(groupByLesson([])).toEqual([])
  })

  test('groups by source_note and orders by date desc', () => {
    const cards = [
      card({ source_note: '30-resources/japanese-learning/2026-04-20.md' }),
      card({ source_note: '30-resources/japanese-learning/2026-04-29.md' }),
      card({ source_note: '30-resources/japanese-learning/2026-04-25.md' }),
    ]
    const groups = groupByLesson(cards)
    expect(groups.map((g) => g.date)).toEqual([
      '2026-04-29',
      '2026-04-25',
      '2026-04-20',
    ])
  })

  test('status: untouched when all repetitions = 0', () => {
    const cards = [card({ repetitions: 0 }), card({ repetitions: 0 })]
    expect(groupByLesson(cards)[0].status).toBe('untouched')
  })

  test('status: reviewed when all repetitions > 0', () => {
    const cards = [card({ repetitions: 1 }), card({ repetitions: 3 })]
    expect(groupByLesson(cards)[0].status).toBe('reviewed')
  })

  test('status: partial when mixed', () => {
    const cards = [card({ repetitions: 0 }), card({ repetitions: 1 })]
    expect(groupByLesson(cards)[0].status).toBe('partial')
  })

  test('skips cards with non-date source_note', () => {
    const cards = [card({ source_note: '30-resources/japanese-learning/random.md' })]
    expect(groupByLesson(cards)).toEqual([])
  })
})

import { getDueBatch } from './queue'

const NOW = new Date('2026-04-29T12:00:00Z')

describe('getDueBatch', () => {
  test('returns [] when no cards qualify', () => {
    const cards = [card({ repetitions: 0, last_reviewed_at: null })]
    expect(getDueBatch(cards, 20, NOW)).toEqual([])
  })

  test('includes cards with last_reviewed_at != null and due_at <= now', () => {
    const cards = [
      card({
        id: 'a',
        repetitions: 1,
        last_reviewed_at: '2026-04-28T00:00:00Z',
        due_at: '2026-04-29T00:00:00Z',
      }),
    ]
    const batch = getDueBatch(cards, 20, NOW)
    expect(batch.map((c) => c.id)).toEqual(['a'])
  })

  test('includes failed cards (rep=0 but last_reviewed set)', () => {
    const cards = [
      card({
        id: 'failed',
        repetitions: 0,
        last_reviewed_at: '2026-04-29T11:00:00Z',
        due_at: '2026-04-29T11:00:00Z',
      }),
    ]
    const batch = getDueBatch(cards, 20, NOW)
    expect(batch.map((c) => c.id)).toEqual(['failed'])
  })

  test('excludes future-due cards', () => {
    const cards = [
      card({
        id: 'future',
        repetitions: 1,
        last_reviewed_at: '2026-04-29T00:00:00Z',
        due_at: '2026-05-05T00:00:00Z',
      }),
    ]
    expect(getDueBatch(cards, 20, NOW)).toEqual([])
  })

  test('excludes never-reviewed (last_reviewed_at = null)', () => {
    const cards = [
      card({
        id: 'new',
        repetitions: 0,
        last_reviewed_at: null,
        due_at: '2026-04-29T00:00:00Z',
      }),
    ]
    expect(getDueBatch(cards, 20, NOW)).toEqual([])
  })

  test('sorts by due_at ascending', () => {
    const cards = [
      card({
        id: 'b',
        repetitions: 1,
        last_reviewed_at: '2026-04-28T00:00:00Z',
        due_at: '2026-04-29T11:00:00Z',
      }),
      card({
        id: 'a',
        repetitions: 1,
        last_reviewed_at: '2026-04-25T00:00:00Z',
        due_at: '2026-04-26T00:00:00Z',
      }),
    ]
    expect(getDueBatch(cards, 20, NOW).map((c) => c.id)).toEqual(['a', 'b'])
  })

  test('caps result at batchSize', () => {
    const cards = Array.from({ length: 30 }, (_, i) =>
      card({
        id: `c-${i}`,
        repetitions: 1,
        last_reviewed_at: '2026-04-28T00:00:00Z',
        due_at: `2026-04-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
      }),
    )
    expect(getDueBatch(cards, 20, NOW)).toHaveLength(20)
  })
})
