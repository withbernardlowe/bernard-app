import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '@/lib/db'
import { pullCards, flushQueue, startBackgroundSync } from './sync'
import { groupByLesson, getDueBatch, type LessonGroup } from './queue'
import { Button } from '@/components/ui/button'

const STATUS_LABEL: Record<LessonGroup['status'], string> = {
  untouched: '🆕 未複習',
  partial: '🟡 部分',
  reviewed: '🟢 已通過',
}

function todayInTokyo(): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(new Date())
}

type LoadState = 'loading' | 'ready' | 'error'

export function Home() {
  const [state, setState] = useState<LoadState>('loading')
  const [lessons, setLessons] = useState<LessonGroup[]>([])
  const [dueCount, setDueCount] = useState(0)

  async function load() {
    setState('loading')
    try {
      const all = await db.jp_cards.toArray()
      setLessons(groupByLesson(all))
      setDueCount(getDueBatch(all, Number.MAX_SAFE_INTEGER, new Date()).length)
      setState('ready')
    } catch (e) {
      console.error(e)
      setState('error')
    }
  }

  useEffect(() => {
    const unsubscribe = startBackgroundSync()
    ;(async () => {
      try {
        await flushQueue()
        await pullCards()
        await load()
      } catch (e) {
        console.error(e)
        setState('error')
      }
    })()
    return unsubscribe
  }, [])

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

  const today = todayInTokyo()

  return (
    <div className="w-full max-w-md mx-auto space-y-8 p-6">
      <section
        className="rounded-2xl p-6 space-y-3 relative overflow-hidden"
        style={{
          background: 'var(--paper-grad)',
          boxShadow:
            'var(--paper-inner-hi), var(--paper-rim), var(--paper-shadow)',
        }}
      >
        <div className="paper-grain" />
        <div
          className="relative font-medium text-lg"
          style={{ fontFamily: 'var(--font-serif-tc)', color: 'var(--paper-ink)' }}
        >
          到期複習
        </div>
        <div
          className="relative text-sm"
          style={{ color: 'var(--paper-meta)' }}
        >
          {dueCount > 0 ? `${dueCount} 張到期` : '目前無到期'}
        </div>
        <div className="relative">
          <Button asChild disabled={dueCount === 0}>
            <Link to="/jp/due" aria-disabled={dueCount === 0}>
              來一輪
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div
          className="text-xs font-mono uppercase tracking-[0.16em]"
          style={{ color: 'var(--paper-meta)' }}
        >
          按課堂複習
        </div>
        {lessons.length === 0 && (
          <div className="text-sm text-muted-foreground">
            還沒有任何 lesson 卡。
          </div>
        )}
        <ul className="divide-y">
          {lessons.map((g) => (
            <li key={g.sourceNote}>
              <Link
                to={`/jp/lesson/${g.date}`}
                className="flex items-center justify-between py-3.5 px-2 rounded-md hover:bg-accent transition-colors"
              >
                <span style={{ fontFamily: 'var(--font-serif-tc)' }}>
                  {g.date}
                  {g.date === today && (
                    <span
                      className="ml-2 text-xs font-mono"
                      style={{ color: 'var(--paper-meta)' }}
                    >
                      （今天）
                    </span>
                  )}
                  <span
                    className="ml-2 font-mono text-xs"
                    style={{ color: 'var(--paper-meta)' }}
                  >
                    · {g.cards.length} 張
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {STATUS_LABEL[g.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
