import { Button } from '@/components/ui/button'
import type { Rating } from './types'

interface Props {
  onGrade: (rating: Rating) => void
  disabled?: boolean
}

export function GradeButtons({ onGrade, disabled }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Button variant="destructive" onClick={() => onGrade(0)} disabled={disabled}>
        再來
      </Button>
      <Button variant="outline" onClick={() => onGrade(3)} disabled={disabled}>
        困難
      </Button>
      <Button onClick={() => onGrade(4)} disabled={disabled}>
        OK
      </Button>
      <Button variant="secondary" onClick={() => onGrade(5)} disabled={disabled}>
        簡單
      </Button>
    </div>
  )
}
