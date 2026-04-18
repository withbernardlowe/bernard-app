import { describe, test, expect } from 'bun:test'
import { applyRating } from './sm2'
import type { SRSState } from './types'

const baseState: SRSState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  dueAt: new Date('2026-04-18T00:00:00Z'),
}

const NOW = new Date('2026-04-18T12:00:00Z')

describe('applyRating', () => {
  test('Again (0) resets repetitions, dueAt = now', () => {
    const state = { ...baseState, repetitions: 3, intervalDays: 15 }
    const next = applyRating(state, 0, NOW)
    expect(next.repetitions).toBe(0)
    expect(next.intervalDays).toBe(0)
    expect(next.dueAt.getTime()).toBe(NOW.getTime())
  })

  test('Good (4) first review sets interval=1', () => {
    const next = applyRating(baseState, 4, NOW)
    expect(next.repetitions).toBe(1)
    expect(next.intervalDays).toBe(1)
    expect(next.dueAt.getTime()).toBe(NOW.getTime() + 24 * 3600 * 1000)
    expect(next.easeFactor).toBeCloseTo(2.5, 5)
  })

  test('Good (4) second review sets interval=6', () => {
    const state = { ...baseState, repetitions: 1, intervalDays: 1 }
    const next = applyRating(state, 4, NOW)
    expect(next.repetitions).toBe(2)
    expect(next.intervalDays).toBe(6)
  })

  test('Good (4) third review: interval * easeFactor', () => {
    const state = { ...baseState, repetitions: 2, intervalDays: 6, easeFactor: 2.5 }
    const next = applyRating(state, 4, NOW)
    expect(next.repetitions).toBe(3)
    expect(next.intervalDays).toBe(15)
  })

  test('Easy (5) raises easeFactor', () => {
    const next = applyRating(baseState, 5, NOW)
    expect(next.easeFactor).toBeGreaterThan(2.5)
  })

  test('Hard (3) lowers easeFactor but still increments reps', () => {
    const next = applyRating(baseState, 3, NOW)
    expect(next.easeFactor).toBeLessThan(2.5)
    expect(next.repetitions).toBe(1)
  })

  test('easeFactor floor at 1.3', () => {
    const state = { ...baseState, easeFactor: 1.35 }
    let next = applyRating(state, 3, NOW)
    next = applyRating(next, 3, NOW)
    next = applyRating(next, 3, NOW)
    expect(next.easeFactor).toBeGreaterThanOrEqual(1.3)
  })
})
