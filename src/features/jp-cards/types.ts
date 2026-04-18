export type Direction = 'jp_to_cn' | 'cn_to_jp'
export type Rating = 0 | 3 | 4 | 5  // Again / Hard / Good / Easy

export interface SRSState {
  easeFactor: number
  intervalDays: number
  repetitions: number
  dueAt: Date
}
