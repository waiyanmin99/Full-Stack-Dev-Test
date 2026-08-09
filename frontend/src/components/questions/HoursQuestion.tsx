import type { LaborRate } from '../../types'
import { formatCurrency, formatHours } from '../../lib/format'
import { laborCost } from '../../lib/estimate'

interface HoursQuestionProps {
  rate: LaborRate
  hours: number
  onChange: (hours: number) => void
}

export default function HoursQuestion({ rate, hours, onChange }: HoursQuestionProps) {
  return (
    <div className="hours-question">
      <input
        type="range"
        min={rate.estimatedHours.min}
        max={rate.estimatedHours.max}
        step={0.25}
        value={hours}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="hours-question__value">{formatHours(hours)}</div>
      <div className="hours-question__range">
        Typical range: {formatHours(rate.estimatedHours.min)} &ndash;{' '}
        {formatHours(rate.estimatedHours.max)} at {formatCurrency(rate.hourlyRate, true)}/hr
      </div>
      <div className="hours-question__cost">
        <span>Labor for this job</span>
        <strong>{formatCurrency(laborCost(rate, hours))}</strong>
      </div>
    </div>
  )
}
