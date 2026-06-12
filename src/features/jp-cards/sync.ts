import { supabase } from '@/lib/supabase'
import { db, type LocalCard, type SyncQueueItem } from '@/lib/db'

/**
 * Pull all jp_cards from Supabase into Dexie.
 * Called on app load and after coming back online.
 *
 * PostgREST 單次最多回 1000 列，卡片數超過 1000 後必須分頁，
 * 否則新的卡（排在後面）永遠同步不下來。用 id 排序確保分頁穩定。
 */
export async function pullCards(): Promise<void> {
  const PAGE = 1000
  const rows: LocalCard[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('jp_cards')
      .select('*')
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    rows.push(...(data as LocalCard[]))
    if (data.length < PAGE) break
  }

  await db.transaction('rw', db.jp_cards, async () => {
    for (const row of rows) {
      await db.jp_cards.put(row)
    }
  })
}

/**
 * Flush all queued writes to Supabase.
 * Each successful flush removes the queue row.
 */
export async function flushQueue(): Promise<void> {
  const items = await db.sync_queue.toArray()
  for (const item of items) {
    if (item.table !== 'jp_cards') continue
    const { error } = await supabase
      .from('jp_cards')
      .update(item.payload)
      .eq('id', item.row_id)
    if (error) {
      console.error('flushQueue failed for', item, error)
      continue
    }
    if (item.id !== undefined) {
      await db.sync_queue.delete(item.id)
    }
  }
}

/**
 * Record a local update + enqueue for sync.
 */
export async function updateCardLocal(
  cardId: string,
  changes: Partial<LocalCard>,
): Promise<void> {
  const now = new Date().toISOString()
  const payload = { ...changes, updated_at: now }
  await db.transaction('rw', [db.jp_cards, db.sync_queue], async () => {
    await db.jp_cards.update(cardId, payload)
    const queueItem: SyncQueueItem = {
      table: 'jp_cards',
      op: 'update',
      row_id: cardId,
      payload,
      created_at: now,
    }
    await db.sync_queue.add(queueItem)
  })
}

/**
 * Install event listeners. Returns unsubscribe function.
 */
export function startBackgroundSync(): () => void {
  const onOnline = () => { void flushQueue() }
  const onVisibility = () => {
    if (document.visibilityState === 'visible') void flushQueue()
  }
  window.addEventListener('online', onOnline)
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    window.removeEventListener('online', onOnline)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
