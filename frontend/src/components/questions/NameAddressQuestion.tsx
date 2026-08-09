import { useRef } from 'react'

interface NameAddressQuestionProps {
  name: string
  address: string
  onChangeName: (value: string) => void
  onChangeAddress: (value: string) => void
  onSubmit: () => void
  canSubmit: boolean
}

export default function NameAddressQuestion({
  name,
  address,
  onChangeName,
  onChangeAddress,
  onSubmit,
  canSubmit,
}: NameAddressQuestionProps) {
  const addressRef = useRef<HTMLInputElement>(null)

  return (
    <div className="stacked-fields">
      <label className="field">
        <span className="field__label">Customer name</span>
        <input
          autoFocus
          type="text"
          className="question-input"
          value={name}
          placeholder="Jane Doe"
          onChange={(e) => onChangeName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addressRef.current?.focus()
          }}
        />
      </label>
      <label className="field">
        <span className="field__label">Service address</span>
        <input
          ref={addressRef}
          type="text"
          className="question-input"
          value={address}
          placeholder="123 Main St, Springfield, IL"
          onChange={(e) => onChangeAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) onSubmit()
          }}
        />
      </label>
    </div>
  )
}
