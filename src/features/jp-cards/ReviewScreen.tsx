import { useEffect, useState } from 'react'
import { db, type LocalCard } from '@/lib/db'
import {
  pullCards,
  flushQueue,
  startBackgroundSync,
  updateCardLocal,
} from './sync'
import { getDueQueue } from './queue'
import { applyRating } from './sm2'
import type { Rating, SRSState } from './types'
import { useJpSettings } from './useSettings'
import { CardView } from './CardView'
import { GradeButtons } from './GradeButtons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type LoadState = 'loading' | 'ready' | 'error'

function cardToSRS(c: LocalCard): SRSState {
  return {
    easeFactor: c.ease_factor,
    intervalDays: c.interval_days,
    repetitions: c.repetitions,
    dueAt: new Date(c.due_at),
  }
}

export function ReviewScreen() {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [queue, setQueue] = useState<LocalCard[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const { settings, setShowRuby } = useJpSettings()

  useEffect(() => {
    const unsubscribe = startBackgroundSync()
    ;(async () => {
      try {
        await flushQueue()
        await pullCards()
        const all = await db.jp_cards.toArray()
        const built = getDueQueue(
          all,
          { dailyNewLimit: settings.dailyNewLimit },
          new Date(),
        )
        setQueue(built)
        setLoadState('ready')
      } catch (e) {
        console.error(e)
        setLoadState('error')
      }
    })()
    return unsubscribe
  }, [settings.dailyNewLimit])

  async function handleGrade(rating: Rating) {
    const card = queue[currentIdx]
    if (!card) return
    const now = new Date()
    const nextSrs = applyRating(cardToSRS(card), rating, now)
    const changes = {
      ease_factor: nextSrs.easeFactor,
      interval_days: nextSrs.intervalDays,
      repetitions: nextSrs.repetitions,
      due_at: nextSrs.dueAt.toISOString(),
      last_reviewed_at: now.toISOString(),
    }
    await updateCardLocal(card.id, changes)
    void flushQueue()

    if (rating < 3) {
      const updated = { ...card, ...changes }
      setQueue((q) => {
        const rest = q.slice(currentIdx + 1)
        return [...q.slice(0, currentIdx), ...rest, updated]
      })
      setFlipped(false)
      return
    }
    setCurrentIdx((i) => i + 1)
    setFlipped(false)
  }

  if (loadState === 'loading') {
    return <div className="text-center text-muted-foreground">載入中…</div>
  }
  if (loadState === 'error') {
    return (
      <div className="text-center space-y-3">
        <p>載入失敗</p>
        <Button onClick={() => window.location.reload()}>重試</Button>
      </div>
    )
  }
  if (currentIdx >= queue.length) {
    return (
      <div className="text-center text-muted-foreground space-y-2">
        <p>今天複習完成 🎉</p>
        <p className="text-xs">下次到期時間請等新的 lesson note 或明天</p>
      </div>
    )
  }

  const card = queue[currentIdx]

  return (
    <div className="w-full max-w-md mx-auto space-y-4 p-4">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>
          {currentIdx + 1} / {queue.length} ·{' '}
          {card.direction === 'jp_to_cn' ? '日→中' : '中→日'}
        </span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showRuby}
            onChange={(e) => setShowRuby(e.target.checked)}
          />
          <Label>顯示假名</Label>
        </label>
      </div>
      <CardView
        card={card}
        flipped={flipped}
        showRuby={settings.showRuby}
        onFlip={() => setFlipped(true)}
      />
      {flipped ? (
        <GradeButtons onGrade={handleGrade} />
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          點卡片顯示答案
        </p>
      )}
    </div>
  )
}
