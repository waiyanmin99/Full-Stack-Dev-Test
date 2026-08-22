import type { LaborRate } from '../../types'
import { formatCurrency } from '../../lib/format'
import { jobTypes, levelsForJobType } from '../../lib/normalize'
import { JOB_TYPE_LABELS, LEVEL_LABELS } from '../../lib/labels'
import ChoiceQuestion from '../questions/ChoiceQuestion'
import HoursQuestion from '../questions/HoursQuestion'

interface JobLaborPageProps {
  jobType: string
  level: string
  hours: number
  rate: LaborRate | undefined
  onSelectJobType: (jobType: string) => void
  onSelectLevel: (level: string) => void
  onChangeHours: (hours: number) => void
}

export default function JobLaborPage({
  jobType,
  level,
  hours,
  rate,
  onSelectJobType,
  onSelectLevel,
  onChangeHours,
}: JobLaborPageProps) {
  return (
    <div className="page-sections">
      <section className="page-section">
        <h2 className="page-section__heading">Job type</h2>
        <ChoiceQuestion
          value={jobType}
          onSelect={onSelectJobType}
          options={jobTypes.map((jt) => ({ value: jt, label: JOB_TYPE_LABELS[jt] ?? jt }))}
        />
      </section>

      {jobType && (
        <section className="page-section">
          <h2 className="page-section__heading">Level of work</h2>
          <ChoiceQuestion
            value={level}
            onSelect={onSelectLevel}
            options={levelsForJobType(jobType).map((r) => ({
              value: r.level,
              label: LEVEL_LABELS[r.level] ?? r.level,
              helper: `${formatCurrency(r.hourlyRate, true)}/hr · ${r.estimatedHours.min}–${r.estimatedHours.max} hrs`,
            }))}
          />
        </section>
      )}

      {rate && (
        <section className="page-section">
          <h2 className="page-section__heading">Hours for this job</h2>
          <HoursQuestion rate={rate} hours={hours} onChange={onChangeHours} />
        </section>
      )}
    </div>
  )
}
