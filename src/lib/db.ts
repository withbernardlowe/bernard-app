import Dexie, { type Table } from 'dexie'

export interface LocalCard {
  id: string
  user_id: string
  direction: 'jp_to_cn' | 'cn_to_jp'
  jp_text: string
  cn_text: string
  source_note: string
  source_section: string | null
  category: 'warmup' | 'examples'
  ease_factor: number
  interval_days: number
  repetitions: number
  due_at: string
  last_reviewed_at: string | null
  updated_at: string
  created_at: string
}

export interface SyncQueueItem {
  id?: number
  table: 'jp_cards'
  op: 'update'
  row_id: string
  payload: Partial<LocalCard>
  created_at: string
}

export interface MetaItem {
  key: string
  value: unknown
}

class BernardDB extends Dexie {
  jp_cards!: Table<LocalCard, string>
  sync_queue!: Table<SyncQueueItem, number>
  meta!: Table<MetaItem, string>

  constructor() {
    super('bernard-app')
    this.version(1).stores({
      jp_cards: 'id, due_at, repetitions',
      sync_queue: '++id, table, row_id',
      meta: 'key',
    })
  }
}

export const db = new BernardDB()
