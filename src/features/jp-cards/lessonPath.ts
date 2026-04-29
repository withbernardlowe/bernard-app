const DATE_REGEX = /(\d{4}-\d{2}-\d{2})\.md$/

export function extractLessonDate(sourceNote: string): string | null {
  const match = sourceNote.match(DATE_REGEX)
  return match ? match[1] : null
}
