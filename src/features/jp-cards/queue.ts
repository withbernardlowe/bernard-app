import type { LocalCard } from '@/lib/db'
import { extractLessonDate } from './lessonPath'

export type LessonStatus = 'untouched' | 'partial' | 'reviewed'

export interface LessonGroup {
  sourceNote: string
  date: string
  cards: LocalCard[]
  status: LessonStatus
}

export function groupByLesson(cards: LocalCard[]): LessonGroup[] {
  const buckets = new Map<string, LocalCard[]>()
  for (const c of cards) {
    if (!extractLessonDate(c.source_note)) continue
    const arr = buckets.get(c.source_note) ?? []
    arr.push(c)
    buckets.set(c.source_note, arr)
  }

  const groups: LessonGroup[] = []
  for (const [sourceNote, cs] of buckets) {
    const date = extractLessonDate(sourceNote)!
    const reviewedCount = cs.filter((c) => c.repetitions > 0).length
    let status: LessonStatus
    if (reviewedCount === 0) status = 'untouched'
    else if (reviewedCount === cs.length) status = 'reviewed'
    else status = 'partial'
    groups.push({ sourceNote, date, cards: cs, status })
  }

  groups.sort((a, b) => b.date.localeCompare(a.date))
  return groups
}
