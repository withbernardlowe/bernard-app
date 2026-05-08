import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type LocalCard } from '@/lib/db'
import { ReviewScreen } from './ReviewScreen'
import { getDueBatch } from './queue'
import { Button } from '@/components/ui/button'

const BATCH_SIZE = 20
type LoadState = 'loading' | 'ready' | 'finished' | 'error'

export function DueReviewView() {
  const navigate = useNavigate()
  const [batch, setBatch] = useState<LocalCard[]>([])
  const [remainingAfter, setRemainingAfter] = useState(0)
  const [state, setState] = useState<LoadState>('loading')

  async function loadNextBatch() {
    setState('loading')
    try {
      const all = await db.jp_cards.toArray()
      const dueAll = getDueBatch(all, Number.MAX_SAFE_INTEGER, new Date())
      if (dueAll.length === 0) {
        setBatch([])
        setRemainingAfter(0)
        setState('finished')
        return
      }
      const take = dueAll.slice(0, BATCH_SIZE)
      setBatch(take)
      setRemainingAfter(dueAll.length - take.length)
      setState('ready')
    } catch (e) {
      console.error(e)
      setState('error')
    }
  }

  useEffect(() => {
    void loadNextBatch()
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

  if (state === 'finished') {
    if (batch.length > 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-sm">
            <p
              className="text-3xl"
              style={{ fontFamily: 'var(--font-serif-tc)', color: 'var(--paper-ink)' }}
            >
              完成這一輪
            </p>
            <p
              className="font-mono text-sm tracking-[0.04em]"
              style={{ color: 'var(--paper-meta)' }}
            >
              到期還剩：{remainingAfter} 張
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={loadNextBatch}>再來一輪</Button>
              <Button variant="outline" onClick={() => navigate('/jp')}>
                回首頁
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <p
            className="text-3xl"
            style={{ fontFamily: 'var(--font-serif-tc)', color: 'var(--paper-ink)' }}
          >
            全部到期複習完成
          </p>
          <Button onClick={() => navigate('/jp')}>回首頁</Button>
        </div>
      </div>
    )
  }

  return <ReviewScreen cards={batch} onComplete={() => setState('finished')} />
}
