import { phoneDigits, formatUSPhone } from '../../lib/format'
import type { PropertyType } from '../../types'
import ChoiceQuestion from './ChoiceQuestion'

interface ContactPropertyQuestionProps {
  phone: string
  onChangePhone: (digits: string) => void
  propertyType: PropertyType
  onChangePropertyType: (value: PropertyType) => void
}

export default function ContactPropertyQuestion({
  phone,
  onChangePhone,
  propertyType,
  onChangePropertyType,
}: ContactPropertyQuestionProps) {
  return (
    <div className="compact-sections">
      <section className="compact-section">
        <span className="field__label">Phone (optional)</span>
        <div className="phone-field">
          <span className="phone-field__prefix">+1</span>
          <input
            type="tel"
            inputMode="numeric"
            className="question-input phone-field__input"
            value={formatUSPhone(phone)}
            placeholder="(213) 555-0142"
            onChange={(e) => onChangePhone(phoneDigits(e.target.value))}
          />
        </div>
      </section>

      <section className="compact-section">
        <span className="field__label">Property type</span>
        <ChoiceQuestion
          value={propertyType}
          onSelect={(v) => onChangePropertyType(v as PropertyType)}
          options={[
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
          ]}
        />
      </section>
    </div>
  )
}
