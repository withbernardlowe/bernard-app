import { Pin, PinOff, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sortedHistory, type HistoryItem } from './storage'

interface Props {
  text: string
  history: HistoryItem[]
  onChangeText: (s: string) => void
  onShow: () => void
  onPickHistory: (item: HistoryItem) => void
  onTogglePin: (id: string) => void
  onRemove: (id: string) => void
}

export function EditMode({
  text,
  history,
  onChangeText,
  onShow,
  onPickHistory,
  onTogglePin,
  onRemove,
}: Props) {
  const sorted = sortedHistory(history)
  const canShow = text.trim().length > 0

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-4 flex-1">
      <textarea
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="貼上地址或要給對方看的文字…"
        className="w-full min-h-40 rounded-lg border border-input bg-background p-3 text-base resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        autoFocus
      />

      <Button onClick={onShow} disabled={!canShow} size="lg" className="w-full">
        <Eye />
        顯示
      </Button>

      {sorted.length > 0 && (
        <section className="space-y-2">
          <div
            className="text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground"
          >
            歷史
          </div>
          <ul className="divide-y border rounded-lg overflow-hidden">
            {sorted.map((item) => (
              <li key={item.id} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => onPickHistory(item)}
                  className="flex-1 text-left px-3 py-2.5 hover:bg-accent transition-colors min-w-0"
                >
                  <div className="text-sm line-clamp-2 break-words">
                    {item.text}
                  </div>
                </button>
                <div className="flex items-center pr-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={item.pinned ? '取消釘選' : '釘選'}
                    onClick={() => onTogglePin(item.id)}
                  >
                    {item.pinned ? <PinOff /> : <Pin />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="刪除"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
