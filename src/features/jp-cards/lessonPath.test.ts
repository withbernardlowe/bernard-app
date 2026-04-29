import { describe, test, expect } from 'bun:test'
import { extractLessonDate } from './lessonPath'

describe('extractLessonDate', () => {
  test('extracts YYYY-MM-DD from a Japanese learning note path', () => {
    expect(
      extractLessonDate('30-resources/japanese-learning/2026-04-29.md'),
    ).toBe('2026-04-29')
  })

  test('extracts from archive path with subfolder', () => {
    expect(
      extractLessonDate(
        '40-archives/resources/japanese-learning/2026-03/2026-03-12.md',
      ),
    ).toBe('2026-03-12')
  })

  test('returns null when filename is not a date', () => {
    expect(extractLessonDate('30-resources/japanese-learning/notes.md')).toBe(
      null,
    )
  })
})
