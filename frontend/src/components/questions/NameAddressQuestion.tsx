import { useRef, type KeyboardEvent } from 'react'
import { US_STATES } from '../../lib/address'

interface NameAddressQuestionProps {
  name: string
  addressLine: string
  city: string
  state: string
  zip: string
  onChangeName: (value: string) => void
  onChangeAddressLine: (value: string) => void
  onChangeCity: (value: string) => void
  onChangeState: (value: string) => void
  onChangeZip: (value: string) => void
  onSubmit: () => void
  canSubmit: boolean
}

export default function NameAddressQuestion({
  name,
  addressLine,
  city,
  state,
  zip,
  onChangeName,
  onChangeAddressLine,
  onChangeCity,
  onChangeState,
  onChangeZip,
  onSubmit,
  canSubmit,
}: NameAddressQuestionProps) {
  const addressRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const zipRef = useRef<HTMLInputElement>(null)

  function focusNext(e: KeyboardEvent, next?: () => void) {
    if (e.key !== 'Enter') return
    if (next) next()
    else if (canSubmit) onSubmit()
  }

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
          onKeyDown={(e) => focusNext(e, () => addressRef.current?.focus())}
        />
      </label>

      <label className="field">
        <span className="field__label">Street address</span>
        <input
          ref={addressRef}
          type="text"
          className="question-input"
          value={addressLine}
          placeholder="4821 Oakridge Dr"
          onChange={(e) => onChangeAddressLine(e.target.value)}
          onKeyDown={(e) => focusNext(e, () => cityRef.current?.focus())}
        />
      </label>

      <div className="address-row">
        <label className="field field--city">
          <span className="field__label">City</span>
          <input
            ref={cityRef}
            type="text"
            className="question-input"
            value={city}
            placeholder="Springfield"
            onChange={(e) => onChangeCity(e.target.value)}
            onKeyDown={(e) => focusNext(e, () => zipRef.current?.focus())}
          />
        </label>

        <label className="field field--state">
          <span className="field__label">State</span>
          <select
            className="question-input"
            value={state}
            onChange={(e) => onChangeState(e.target.value)}
          >
            <option value="">—</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.value}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--zip">
          <span className="field__label">ZIP</span>
          <input
            ref={zipRef}
            type="text"
            inputMode="numeric"
            className="question-input"
            value={zip}
            placeholder="62704"
            maxLength={10}
            onChange={(e) => onChangeZip(e.target.value)}
            onKeyDown={(e) => focusNext(e)}
          />
        </label>
      </div>
    </div>
  )
}
