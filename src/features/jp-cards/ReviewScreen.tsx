import { useEffect, useState } from 'react'
import { type LocalCard } from '@/lib/db'
import { updateCardLocal, flushQueue } from './sync'
import { applyRating } from './sm2'
import type { Rating, SRSState } from './types'
import { useJpSettings } from './useSettings'
import { CardView } from './CardView'
import { GradeButtons } from './GradeButtons'
import { Label } from '@/components/ui/label'

interface Props {
  cards: LocalCard[]
  onComplete: () => void
}

function cardToSRS(c: LocalCard): SRSState {
  return {
    easeFactor: c.ease_factor,
    intervalDays: c.interval_days,
    repetitions: c.repetitions,
    dueAt: new Date(c.due_at),
  }
}

export function ReviewScreen({ cards, onComplete }: Props) {
  const [queue, setQueue] = useState<LocalCard[]>(cards)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const { settings, setShowRuby } = useJpSettings()

  const isDone = currentIdx >= queue.length

  useEffect(() => {
    if (isDone) onComplete()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone])

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
      setQueue((q) => [
        ...q.slice(0, currentIdx),
        ...q.slice(currentIdx + 1),
        updated,
      ])
      setFlipped(false)
      return
    }
    setCurrentIdx((i) => i + 1)
    setFlipped(false)
  }

  if (isDone) return null

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
