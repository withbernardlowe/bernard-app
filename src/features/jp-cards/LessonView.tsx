import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db, type LocalCard } from '@/lib/db'
import { ReviewScreen } from './ReviewScreen'
import { shuffleInPlace } from './queue'
import { Button } from '@/components/ui/button'

type LoadState = 'loading' | 'ready' | 'done' | 'error'

export function LessonView() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const [cards, setCards] = useState<LocalCard[]>([])
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
        setCards(shuffleInPlace(filtered))
        setState('ready')
      } catch (e) {
        console.error(e)
        setState('error')
      }
    })()
  }, [date])

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
            {date}
          </p>
          <Button onClick={() => navigate('/jp')}>回首頁</Button>
        </div>
      </div>
    )
  }

  return <ReviewScreen cards={cards} onComplete={() => setState('done')} />
}
