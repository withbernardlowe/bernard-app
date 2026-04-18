import type { SRSState, Rating } from './types'

export function applyRating(
  state: SRSState,
  rating: Rating,
  now: Date,
): SRSState {
  if (rating < 3) {
    return {
      easeFactor: state.easeFactor,
      intervalDays: 0,
      repetitions: 0,
      dueAt: new Date(now),
    }
  }

  const repetitions = state.repetitions + 1
  let intervalDays: number
  if (repetitions === 1) intervalDays = 1
  else if (repetitions === 2) intervalDays = 6
  else intervalDays = Math.round(state.intervalDays * state.easeFactor)

  const delta =
    -0.8 + 0.28 * rating - 0.02 * Math.pow(rating, 2)
  const easeFactor = Math.max(1.3, state.easeFactor + delta)

  const dueAt = new Date(now.getTime() + intervalDays * 24 * 3600 * 1000)

  return { easeFactor, intervalDays, repetitions, dueAt }
}
