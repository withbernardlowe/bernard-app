import { supabase } from '@/lib/supabase'
import { db, type LocalCard, type SyncQueueItem } from '@/lib/db'

/**
 * Pull all jp_cards from Supabase into Dexie.
 * Called on app load and after coming back online.
 */
export async function pullCards(): Promise<void> {
  const { data, error } = await supabase
    .from('jp_cards')
    .select('*')
  if (error) throw error
  if (!data) return

  await db.transaction('rw', db.jp_cards, async () => {
    for (const row of data) {
      await db.jp_cards.put(row as LocalCard)
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
