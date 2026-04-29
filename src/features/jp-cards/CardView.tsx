import type { LocalCard } from '@/lib/db'

interface Props {
  card: LocalCard
  flipped: boolean
  showRuby: boolean
  onFlip: () => void
}

function renderFront(card: LocalCard, showRuby: boolean) {
  if (card.direction === 'jp_to_cn') {
    return (
      <div
        className={showRuby ? '' : 'ruby-off'}
        dangerouslySetInnerHTML={{ __html: card.jp_text }}
      />
    )
  }
  return <div>{card.cn_text}</div>
}

function renderBack(card: LocalCard) {
  const isJpFront = card.direction === 'jp_to_cn'
  return (
    <div className="space-y-4">
      <div
        className="text-muted-foreground text-sm"
        dangerouslySetInnerHTML={{
          __html: isJpFront ? card.jp_text : `<span>${card.cn_text}</span>`,
        }}
      />
      <div
        className="text-xl"
        dangerouslySetInnerHTML={{
          __html: isJpFront ? `<span>${card.cn_text}</span>` : card.jp_text,
        }}
      />
    </div>
  )
}

export function CardView({ card, flipped, showRuby, onFlip }: Props) {
  return (
    <div className="space-y-2">
      {card.source_section && (
        <div className="text-xs text-muted-foreground text-center">
          {card.source_section}
        </div>
      )}
      <button
        type="button"
        onClick={flipped ? undefined : onFlip}
        className="w-full max-w-md min-h-[180px] border rounded-lg p-6 text-xl text-left hover:bg-accent transition-colors"
        disabled={flipped}
      >
        {flipped ? renderBack(card) : renderFront(card, showRuby)}
      </button>
    </div>
  )
}
