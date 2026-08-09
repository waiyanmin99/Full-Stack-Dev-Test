import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { matchingSystemTypes } from '../../data/systemTypes'
import { matchingSystemAges } from '../../data/systemAges'

interface SystemDetailsQuestionProps {
  squareFootage: string
  systemType: string
  systemAge: string
  onChangeSquareFootage: (value: string) => void
  onChangeSystemType: (value: string) => void
  onChangeSystemAge: (value: string) => void
  onSubmit: () => void
}

export default function SystemDetailsQuestion({
  squareFootage,
  systemType,
  systemAge,
  onChangeSquareFootage,
  onChangeSystemType,
  onChangeSystemAge,
  onSubmit,
}: SystemDetailsQuestionProps) {
  const ageRef = useRef<HTMLInputElement>(null)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [ageSuggestionsOpen, setAgeSuggestionsOpen] = useState(false)
  const suggestions = useMemo(() => matchingSystemTypes(systemType), [systemType])
  const ageSuggestions = useMemo(() => matchingSystemAges(systemAge), [systemAge])

  function handleTypeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setSuggestionsOpen(false)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (suggestionsOpen && suggestions.length > 0 && systemType.trim() !== suggestions[0].name) {
        onChangeSystemType(suggestions[0].name)
        setSuggestionsOpen(false)
      } else {
        ageRef.current?.focus()
      }
    }
  }

  function handleAgeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setAgeSuggestionsOpen(false)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (
        ageSuggestionsOpen &&
        ageSuggestions.length > 0 &&
        systemAge.trim() !== ageSuggestions[0].value
      ) {
        onChangeSystemAge(ageSuggestions[0].value)
        setAgeSuggestionsOpen(false)
      } else {
        onSubmit()
      }
    }
  }

  return (
    <div className="stacked-fields">
      <label className="field">
        <span className="field__label">Property size (sq ft)</span>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          className="question-input"
          value={squareFootage}
          onChange={(event) => onChangeSquareFootage(event.target.value)}
          placeholder="2200"
        />
      </label>
      <label className="field system-type-field">
        <span className="field__label">Current system</span>
        <input
          type="text"
          className="question-input"
          value={systemType}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestionsOpen}
          aria-controls="system-type-suggestions"
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 100)}
          onChange={(event) => {
            onChangeSystemType(event.target.value)
            setSuggestionsOpen(true)
          }}
          onKeyDown={handleTypeKeyDown}
          placeholder="Central AC + Gas Furnace"
        />
        {suggestionsOpen && (
          <div id="system-type-suggestions" className="system-suggestions" role="listbox">
            {suggestions.map((system) => (
              <button
                key={system.name}
                type="button"
                className="system-suggestion"
                role="option"
                aria-selected={systemType === system.name}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChangeSystemType(system.name)
                  setSuggestionsOpen(false)
                  ageRef.current?.focus()
                }}
              >
                <span className="system-suggestion__topline">
                  <strong>{system.name}</strong>
                  <small>{system.category}</small>
                </span>
                <span>{system.description}</span>
              </button>
            ))}
            {suggestions.length === 0 && (
              <p className="system-suggestions__empty">No preset match—keep your custom description.</p>
            )}
          </div>
        )}
        <span className="field__hint">Start typing to search common residential and commercial systems.</span>
      </label>
      <label className="field system-type-field">
        <span className="field__label">Approximate age in years</span>
        <input
          ref={ageRef}
          type="number"
          inputMode="numeric"
          min="0"
          max="100"
          step="1"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={ageSuggestionsOpen}
          aria-controls="system-age-suggestions"
          className="question-input"
          value={systemAge}
          onFocus={() => setAgeSuggestionsOpen(true)}
          onBlur={() => window.setTimeout(() => setAgeSuggestionsOpen(false), 100)}
          onChange={(event) => {
            onChangeSystemAge(event.target.value)
            setAgeSuggestionsOpen(true)
          }}
          onKeyDown={handleAgeKeyDown}
          placeholder="12"
        />
        {ageSuggestionsOpen && (
          <div id="system-age-suggestions" className="system-suggestions" role="listbox">
            {ageSuggestions.map((age) => (
              <button
                key={age.value}
                type="button"
                className="system-suggestion"
                role="option"
                aria-selected={systemAge === age.value}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChangeSystemAge(age.value)
                  setAgeSuggestionsOpen(false)
                }}
              >
                <span className="system-suggestion__topline">
                  <strong>{age.label}</strong>
                  <small>years</small>
                </span>
                <span>{age.description}</span>
              </button>
            ))}
          </div>
        )}
        <span className="field__hint">
          Age informs recommendations but never replaces an on-site condition and safety check.
        </span>
      </label>
    </div>
  )
}
