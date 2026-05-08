import type { LocalCard } from '@/lib/db'
import { cn } from '@/lib/utils'

interface Props {
  card: LocalCard
  flipped: boolean
  showRuby: boolean
  onFlip: () => void
  sizeHint?: 'mobile' | 'desktop'
}

function DirectionPill({ direction }: { direction: LocalCard['direction'] }) {
  const label = direction === 'jp_to_cn' ? '日 → 中' : '中 → 日'
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.06em]"
      style={{ background: 'var(--paper-pill-bg)', color: 'var(--paper-meta)' }}
    >
      <span
        className="size-[5px] rounded-full opacity-60"
        style={{ background: 'currentColor' }}
      />
      {label}
    </span>
  )
}

function CornerMarks() {
  const base = 'absolute size-3.5'
  const color = { borderColor: 'var(--paper-corner)' }
  return (
    <>
      <div className={`${base} top-3.5 left-3.5 border-t border-l`} style={color} />
      <div className={`${base} top-3.5 right-3.5 border-t border-r`} style={color} />
      <div className={`${base} bottom-3.5 left-3.5 border-b border-l`} style={color} />
      <div className={`${base} bottom-3.5 right-3.5 border-b border-r`} style={color} />
    </>
  )
}

function HeaderRow({
  card,
  sizeHint,
}: {
  card: LocalCard
  sizeHint: 'mobile' | 'desktop'
}) {
  const inset = sizeHint === 'mobile' ? 'top-4 left-4 right-4' : 'top-[22px] left-[22px] right-[22px]'
  return (
    <div className={`absolute ${inset} flex items-center justify-between gap-3`}>
      <div className="shrink-0">
        <DirectionPill direction={card.direction} />
      </div>
      {card.source_section && (
        <span
          className="font-mono text-[11px] tracking-[0.04em] truncate"
          style={{ color: 'var(--paper-meta)', fontFeatureSettings: '"tnum"' }}
        >
          {card.source_section}
        </span>
      )}
    </div>
  )
}

function PaperFace({
  children,
  sizeHint,
  className,
}: {
  children: React.ReactNode
  sizeHint: 'mobile' | 'desktop'
  className?: string
}) {
  const padding = sizeHint === 'mobile' ? 'px-5 pt-[52px] pb-10' : 'px-12 py-[60px]'
  return (
    <div
      className={cn(
        'relative size-full overflow-hidden box-border',
        padding,
        className,
      )}
      style={{
        borderRadius: 22,
        background: 'var(--paper-grad)',
        boxShadow: 'var(--paper-inner-hi), var(--paper-rim), var(--paper-shadow)',
      }}
    >
      <div className="paper-grain" />
      <CornerMarks />
      {children}
    </div>
  )
}

function FrontFace({ card, showRuby, sizeHint }: { card: LocalCard; showRuby: boolean; sizeHint: 'mobile' | 'desktop' }) {
  const isJpFront = card.direction === 'jp_to_cn'
  const jpSize = sizeHint === 'mobile' ? 32 : 44
  const cnSize = sizeHint === 'mobile' ? 28 : 40
  return (
    <PaperFace sizeHint={sizeHint} className="flex flex-col items-center justify-center">
      <HeaderRow card={card} sizeHint={sizeHint} />
      {isJpFront ? (
        <div
          className={cn('text-center', showRuby ? '' : 'ruby-off')}
          style={{
            fontFamily: 'var(--font-serif-jp)',
            fontSize: jpSize,
            lineHeight: 1.85,
            color: 'var(--paper-ink)',
            fontWeight: 500,
            letterSpacing: '0.01em',
            textWrap: 'balance',
            wordBreak: 'break-all',
            overflowWrap: 'anywhere',
            maxWidth: '100%',
          }}
          dangerouslySetInnerHTML={{ __html: card.jp_text }}
        />
      ) : (
        <div
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif-tc)',
            fontSize: cnSize,
            lineHeight: 1.55,
            color: 'var(--paper-ink)',
            fontWeight: 500,
            textWrap: 'balance',
          }}
        >
          {card.cn_text}
        </div>
      )}
      <div
        className="absolute bottom-3.5 left-0 right-0 text-center font-mono text-[11px] font-medium uppercase tracking-[0.18em] pointer-events-none"
        style={{ color: 'var(--paper-tap-hint)' }}
      >
        點擊翻面 · Space
      </div>
    </PaperFace>
  )
}

function BackFace({ card, sizeHint }: { card: LocalCard; sizeHint: 'mobile' | 'desktop' }) {
  const jpSize = sizeHint === 'mobile' ? 28 : 40
  const cnSize = sizeHint === 'mobile' ? 18 : 22
  const gap = sizeHint === 'mobile' ? 18 : 28
  const padding = sizeHint === 'mobile' ? 'px-5 pt-[52px] pb-6' : 'px-12 pt-[60px] pb-8'
  return (
    <PaperFace sizeHint={sizeHint} className={cn('flex flex-col', padding)}>
      <HeaderRow card={card} sizeHint={sizeHint} />
      <div className="flex-1 flex flex-col justify-center" style={{ gap }}>
        <div
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif-jp)',
            fontSize: jpSize,
            lineHeight: 1.95,
            color: 'var(--paper-ink)',
            fontWeight: 500,
            letterSpacing: '0.01em',
            textWrap: 'balance',
            wordBreak: 'break-all',
            overflowWrap: 'anywhere',
          }}
          dangerouslySetInnerHTML={{ __html: card.jp_text }}
        />
        <div className="mx-auto" style={{ height: 1, width: 56, background: 'var(--paper-rule)' }} />
        <div
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif-tc)',
            fontSize: cnSize,
            lineHeight: 1.5,
            color: 'var(--paper-ink-soft)',
            fontWeight: 500,
            textWrap: 'balance',
          }}
        >
          {card.cn_text}
        </div>
      </div>
    </PaperFace>
  )
}

export function CardView({ card, flipped, showRuby, onFlip, sizeHint = 'desktop' }: Props) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label="flashcard"
      className="flip-host appearance-none border-0 bg-transparent p-0 w-full h-full cursor-pointer"
    >
      <div className={cn('flip-inner', flipped && 'is-flipped')}>
        <div className="flip-face">
          <FrontFace card={card} showRuby={showRuby} sizeHint={sizeHint} />
        </div>
        <div className="flip-face flip-back">
          <BackFace card={card} sizeHint={sizeHint} />
        </div>
      </div>
    </button>
  )
}
