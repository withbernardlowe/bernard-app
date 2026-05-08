import { useEffect, useState } from 'react'
import { type LocalCard } from '@/lib/db'
import { updateCardLocal, flushQueue } from './sync'
import { applyRating } from './sm2'
import type { Rating, SRSState } from './types'
import { useJpSettings } from './useSettings'
import { CardView } from './CardView'
import { GradeButtons } from './GradeButtons'
import { cn } from '@/lib/utils'

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

function ProgressDots({ current, total }: { current: number; total: number }) {
  const visible = Math.min(total, 12)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: visible }).map((_, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'pending'
        return (
          <span
            key={i}
            className="rounded-full transition-all duration-200"
            style={{
              width: state === 'current' ? 14 : 6,
              height: 6,
              background:
                state === 'pending' ? 'var(--border)' : 'var(--foreground)',
              opacity: state === 'pending' ? 1 : state === 'done' ? 0.5 : 1,
            }}
          />
        )
      })}
    </div>
  )
}

function RubyToggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
      <span
        className="relative inline-block h-4 w-7 rounded-full transition-colors"
        style={{ background: value ? 'var(--foreground)' : 'var(--border)' }}
      >
        <span
          className="absolute top-0.5 size-3 rounded-full transition-[left]"
          style={{
            left: value ? 14 : 2,
            background: 'var(--background)',
          }}
        />
      </span>
      <span className="text-muted-foreground">假名</span>
      <input
        type="checkbox"
        className="sr-only"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

export function ReviewScreen({ cards, onComplete }: Props) {
  const [queue, setQueue] = useState<LocalCard[]>(cards)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [shake, setShake] = useState(0)
  const [exitTo, setExitTo] = useState<null | 'left' | 'right'>(null)
  const { settings, setShowRuby } = useJpSettings()
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const isDone = currentIdx >= queue.length

  useEffect(() => {
    if (isDone) onComplete()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone])

  async function handleGrade(rating: Rating) {
    if (!flipped) {
      setShake((s) => s + 1)
      return
    }
    const card = queue[currentIdx]
    if (!card) return
    setExitTo(rating < 3 ? 'left' : 'right')

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

    setTimeout(() => {
      if (rating < 3) {
        const updated = { ...card, ...changes }
        setQueue((q) => [
          ...q.slice(0, currentIdx),
          ...q.slice(currentIdx + 1),
          updated,
        ])
      } else {
        setCurrentIdx((i) => i + 1)
      }
      setFlipped(false)
      setExitTo(null)
    }, 350)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
        return
      }
      if (!flipped) return
      const map: Record<string, Rating> = {
        Digit1: 0,
        Digit2: 3,
        Digit3: 4,
        Digit4: 5,
      }
      const r = map[e.code]
      if (r !== undefined) void handleGrade(r)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, currentIdx])

  if (isDone) return null

  const card = queue[currentIdx]
  const total = queue.length
  const current = currentIdx

  return (
    <div
      data-stage="cream"
      className="w-full max-w-3xl mx-auto flex flex-col flex-1 min-h-0"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b">
        <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
          <span style={{ fontFeatureSettings: '"tnum"' }}>
            <span className="font-semibold text-foreground">{current + 1}</span>
            <span className="opacity-50"> / {total}</span>
          </span>
        </div>
        <ProgressDots current={current} total={total} />
        <div style={{ visibility: flipped ? 'hidden' : 'visible' }}>
          <RubyToggle value={settings.showRuby} onChange={setShowRuby} />
        </div>
      </div>

      {/* Card stage */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div
          key={`${currentIdx}-${shake}-${exitTo ?? 'idle'}`}
          className={cn(
            'w-full',
            shake && 'shake',
            exitTo === 'left' && '[animation:card-exit-left_350ms_cubic-bezier(.4,.1,.6,1)_forwards]',
            exitTo === 'right' && '[animation:card-exit-right_350ms_cubic-bezier(.4,.1,.6,1)_forwards]',
            !exitTo && 'card-enter',
          )}
          style={{
            maxWidth: 560,
            margin: '0 auto',
            aspectRatio: isMobile ? '5 / 7' : '1.3 / 1',
            minHeight: 360,
          }}
        >
          <CardView
            card={card}
            flipped={flipped}
            showRuby={settings.showRuby}
            onFlip={() => setFlipped((f) => !f)}
            sizeHint={isMobile ? 'mobile' : 'desktop'}
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t px-4 md:px-6 py-4">
        <div className="max-w-xl mx-auto">
          {flipped ? (
            <GradeButtons onGrade={handleGrade} showShortcuts />
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
              點擊卡片或按
              <kbd className="font-mono text-[11px] rounded border bg-muted px-2 py-0.5">
                Space
              </kbd>
              顯示答案
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
