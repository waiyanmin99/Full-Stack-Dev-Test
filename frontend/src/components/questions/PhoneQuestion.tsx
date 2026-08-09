import { phoneDigits, formatUSPhone } from '../../lib/format'

interface PhoneQuestionProps {
  value: string
  onChange: (digits: string) => void
  onSubmit: () => void
}

export default function PhoneQuestion({ value, onChange, onSubmit }: PhoneQuestionProps) {
  return (
    <div className="phone-field">
      <span className="phone-field__prefix">+1</span>
      <input
        autoFocus
        type="tel"
        inputMode="numeric"
        className="question-input phone-field__input"
        value={formatUSPhone(value)}
        placeholder="(213) 555-0142"
        onChange={(e) => onChange(phoneDigits(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit()
        }}
      />
    </div>
  )
}
