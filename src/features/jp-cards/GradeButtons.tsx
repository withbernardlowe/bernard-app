import type { Rating } from './types'

interface Props {
  onGrade: (rating: Rating) => void
  disabled?: boolean
  showShortcuts?: boolean
}

interface GradeDef {
  rating: Rating
  label: string
  hint: string
  kbd: string
  dot: string
  hoverBg: string
  hoverBorder: string
}

const GRADES: GradeDef[] = [
  {
    rating: 0,
    label: '再來',
    hint: 'Again',
    kbd: '1',
    dot: 'oklch(0.65 0.16 25)',
    hoverBg: 'oklch(0.97 0.02 25 / 0.6)',
    hoverBorder: 'oklch(0.78 0.10 25 / 0.7)',
  },
  {
    rating: 3,
    label: '困難',
    hint: 'Hard',
    kbd: '2',
    dot: 'oklch(0.74 0.13 65)',
    hoverBg: 'oklch(0.97 0.02 65 / 0.6)',
    hoverBorder: 'oklch(0.80 0.10 65 / 0.7)',
  },
  {
    rating: 4,
    label: 'OK',
    hint: 'Good',
    kbd: '3',
    dot: 'oklch(0.66 0.12 230)',
    hoverBg: 'oklch(0.97 0.02 230 / 0.6)',
    hoverBorder: 'oklch(0.80 0.08 230 / 0.7)',
  },
  {
    rating: 5,
    label: '簡單',
    hint: 'Easy',
    kbd: '4',
    dot: 'oklch(0.68 0.12 155)',
    hoverBg: 'oklch(0.97 0.02 155 / 0.6)',
    hoverBorder: 'oklch(0.80 0.08 155 / 0.7)',
  },
]

export function GradeButtons({ onGrade, disabled, showShortcuts = false }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3 w-full">
      {GRADES.map((g) => (
        <button
          key={g.rating}
          type="button"
          onClick={() => onGrade(g.rating)}
          disabled={disabled}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border bg-card text-foreground px-1.5 py-3 md:py-3.5 transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-md"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = g.hoverBg
            e.currentTarget.style.borderColor = g.hoverBorder
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = ''
            e.currentTarget.style.borderColor = ''
          }}
        >
          <span
            className="size-2 rounded-full"
            style={{ background: g.dot, boxShadow: `0 0 0 3px ${g.hoverBg}` }}
          />
          <span className="text-sm font-semibold leading-none">{g.label}</span>
          {showShortcuts && (
            <span className="hidden md:inline-block font-mono text-[10px] tracking-[0.04em] rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
              {g.kbd} · {g.hint}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
