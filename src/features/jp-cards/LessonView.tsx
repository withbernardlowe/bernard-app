import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db, type LocalCard } from '@/lib/db'
import { ReviewScreen } from './ReviewScreen'
import { shuffleInPlace } from './queue'
import { Button } from '@/components/ui/button'

type LoadState = 'loading' | 'select' | 'reviewing' | 'done' | 'error'

type Scope = 'all' | 'warmup' | 'examples'

const SCOPE_LABEL: Record<Scope, string> = {
  all: '全部',
  warmup: '暖身',
  examples: '講義例句',
}

function matchesScope(card: LocalCard, scope: Scope): boolean {
  if (scope === 'all') return true
  const section = card.source_section ?? ''
  if (scope === 'warmup') return section.startsWith('暖身')
  return section.includes('講義例句')
}

export function LessonView() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const [lessonCards, setLessonCards] = useState<LocalCard[]>([])
  const [reviewCards, setReviewCards] = useState<LocalCard[]>([])
  const [scope, setScope] = useState<Scope>('all')
  const [state, setState] = useState<LoadState>('loading')

  useEffect(() => {
    if (!date) return
    const sourceNote = `30-resources/japanese-learning/${date}.md`
    ;(async () => {
      try {
        const all = await db.jp_cards.toArray()
        const filtered = all.filter((c) => c.source_note === sourceNote)
        if (filtered.length === 0) {
          setState('done')
          return
        }
        setLessonCards(filtered)
        setState('select')
      } catch (e) {
        console.error(e)
        setState('error')
      }
    })()
  }, [date])

  const counts = useMemo(() => {
    return {
      all: lessonCards.length,
      warmup: lessonCards.filter((c) => matchesScope(c, 'warmup')).length,
      examples: lessonCards.filter((c) => matchesScope(c, 'examples')).length,
    }
  }, [lessonCards])

  function startReview() {
    const filtered = lessonCards.filter((c) => matchesScope(c, scope))
    if (filtered.length === 0) return
    setReviewCards(shuffleInPlace([...filtered]))
    setState('reviewing')
  }

  if (state === 'loading') {
    return <div className="text-center text-muted-foreground p-8">載入中…</div>
  }

  if (state === 'error') {
    return (
      <div className="text-center space-y-3 p-8">
        <p>載入失敗</p>
        <Button onClick={() => window.location.reload()}>重試</Button>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <p
            className="text-3xl"
            style={{ fontFamily: 'var(--font-serif-tc)', color: 'var(--paper-ink)' }}
          >
            完成 lesson
          </p>
          <p
            className="font-mono text-sm tracking-[0.04em]"
            style={{ color: 'var(--paper-meta)' }}
          >
            {date} · {SCOPE_LABEL[scope]} · {reviewCards.length} 張
          </p>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="outline" onClick={() => setState('select')}>
              再挑一輪
            </Button>
            <Button onClick={() => navigate('/jp')}>回首頁</Button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'select') {
    const currentCount = counts[scope]
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center">
            <p
              className="text-2xl"
              style={{
                fontFamily: 'var(--font-serif-tc)',
                color: 'var(--paper-ink)',
              }}
            >
              {date}
            </p>
            <p
              className="font-mono text-xs tracking-[0.04em]"
              style={{ color: 'var(--paper-meta)' }}
            >
              共 {lessonCards.length} 張卡
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="scope"
              className="text-xs font-mono uppercase tracking-[0.16em]"
              style={{ color: 'var(--paper-meta)' }}
            >
              範圍
            </label>
            <select
              id="scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="all">全部（{counts.all}）</option>
              <option value="warmup" disabled={counts.warmup === 0}>
                暖身（{counts.warmup}）
              </option>
              <option value="examples" disabled={counts.examples === 0}>
                講義例句（{counts.examples}）
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={startReview} disabled={currentCount === 0}>
              開始（{currentCount} 張）
            </Button>
            <Button variant="ghost" onClick={() => navigate('/jp')}>
              回首頁
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ReviewScreen cards={reviewCards} onComplete={() => setState('done')} />
  )
}
