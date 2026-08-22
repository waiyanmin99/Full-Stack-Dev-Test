import type { LaborRate } from '../../types'
import { formatCurrency } from '../../lib/format'
import { LEVEL_LABELS } from '../../lib/labels'
import ChoiceQuestion from './ChoiceQuestion'
import HoursQuestion from './HoursQuestion'

interface LevelHoursQuestionProps {
  level: string
  levels: LaborRate[]
  rate: LaborRate | undefined
  hours: number
  onSelectLevel: (level: string) => void
  onChangeHours: (hours: number) => void
}

export default function LevelHoursQuestion({
  level,
  levels,
  rate,
  hours,
  onSelectLevel,
  onChangeHours,
}: LevelHoursQuestionProps) {
  return (
    <div className="compact-sections">
      <section className="compact-section">
        <span className="field__label">Level of work</span>
        <ChoiceQuestion
          value={level}
          onSelect={onSelectLevel}
          options={levels.map((r) => ({
            value: r.level,
            label: LEVEL_LABELS[r.level] ?? r.level,
            helper: `${formatCurrency(r.hourlyRate, true)}/hr · ${r.estimatedHours.min}–${r.estimatedHours.max} hrs`,
          }))}
        />
      </section>

      {rate && (
        <section className="compact-section">
          <span className="field__label">Hours for this job</span>
          <HoursQuestion rate={rate} hours={hours} onChange={onChangeHours} />
        </section>
      )}
    </div>
  )
}
