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

  test('status: started when all repetitions > 0', () => {
    const cards = [card({ repetitions: 1 }), card({ repetitions: 3 })]
    expect(groupByLesson(cards)[0].status).toBe('started')
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
