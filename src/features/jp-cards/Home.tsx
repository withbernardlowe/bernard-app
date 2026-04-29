import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, type LocalCard } from '@/lib/db'
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
    <div className="w-full max-w-md mx-auto space-y-6 p-4">
      <section className="border rounded-lg p-4 space-y-2">
        <div className="font-medium">到期複習</div>
        <div className="text-sm text-muted-foreground">
          {dueCount > 0 ? `${dueCount} 張到期` : '目前無到期'}
        </div>
        <Button asChild disabled={dueCount === 0}>
          <Link to="/jp/due" aria-disabled={dueCount === 0}>
            來一輪
          </Link>
        </Button>
      </section>

      <section className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
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
                className="flex items-center justify-between py-3 hover:bg-accent rounded px-2"
              >
                <span>
                  {g.date}
                  {g.date === today && (
                    <span className="ml-2 text-xs text-primary">（今天）</span>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
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
