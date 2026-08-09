import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { US_STATES } from '../../lib/address'
import {
  fetchAddressSuggestions,
  matchingKnownAddresses,
  verifyAddressZip,
  type AddressSuggestion,
} from '../../lib/addressAutocomplete'
import type { Customer } from '../../types'

interface NameAddressQuestionProps {
  name: string
  addressLine: string
  city: string
  state: string
  zip: string
  knownCustomers: Customer[]
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
  knownCustomers,
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
  const verificationControllerRef = useRef<AbortController | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [addressSuggestionsOpen, setAddressSuggestionsOpen] = useState(false)
  const [addressLookupEnabled, setAddressLookupEnabled] = useState(false)
  const knownAddressSuggestions = useMemo(
    () => matchingKnownAddresses(addressLine, knownCustomers),
    [addressLine, knownCustomers],
  )
  const combinedAddressSuggestions = useMemo(() => {
    const seen = new Set<string>()
    return [...knownAddressSuggestions, ...addressSuggestions].filter((suggestion) => {
      const key = suggestion.label.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 6)
  }, [knownAddressSuggestions, addressSuggestions])

  useEffect(() => {
    if (!addressLookupEnabled) return
    const query = addressLine.trim()
    if (query.length < 2) return

    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      void fetchAddressSuggestions(query, controller.signal)
        .then((suggestions) => {
          setAddressSuggestions(suggestions)
          setAddressSuggestionsOpen(true)
        })
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            setAddressSuggestions([])
          }
        })
    }, 250)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [addressLine, addressLookupEnabled])

  useEffect(() => () => verificationControllerRef.current?.abort(), [])

  function focusNext(e: KeyboardEvent, next?: () => void) {
    if (e.key !== 'Enter') return
    if (next) next()
    else if (canSubmit) onSubmit()
  }

  async function selectAddress(suggestion: AddressSuggestion) {
    verificationControllerRef.current?.abort()
    const controller = new AbortController()
    verificationControllerRef.current = controller

    onChangeAddressLine(suggestion.addressLine)
    if (suggestion.city) onChangeCity(suggestion.city)
    if (suggestion.state) onChangeState(suggestion.state)
    onChangeZip('')
    setAddressLookupEnabled(false)
    setAddressSuggestionsOpen(false)
    cityRef.current?.focus()

    try {
      const verifiedZip = await verifyAddressZip(suggestion, controller.signal)
      if (!controller.signal.aborted) onChangeZip(verifiedZip || suggestion.zip)
    } catch (error: unknown) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        // A house-level Photon ZIP is a safe fallback. Street-level suggestions
        // deliberately carry no ZIP so staff can enter it manually if verification fails.
        if (!controller.signal.aborted && suggestion.zip) onChangeZip(suggestion.zip)
      }
    }
  }

  function handleAddressKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setAddressSuggestionsOpen(false)
      return
    }
    if (e.key === 'Enter' && addressSuggestionsOpen && combinedAddressSuggestions.length > 0) {
      e.preventDefault()
      void selectAddress(combinedAddressSuggestions[0])
      return
    }
    focusNext(e, () => cityRef.current?.focus())
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

      <label className="field address-autocomplete-field">
        <span className="field__label">Street address</span>
        <input
          ref={addressRef}
          type="text"
          className="question-input"
          value={addressLine}
          placeholder="Start typing an LA-area address"
          autoComplete="street-address"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={addressSuggestionsOpen && combinedAddressSuggestions.length > 0}
          aria-controls="address-suggestions"
          onFocus={() => {
            setAddressLookupEnabled(true)
            setAddressSuggestionsOpen(true)
          }}
          onBlur={() => window.setTimeout(() => setAddressSuggestionsOpen(false), 100)}
          onChange={(e) => {
            onChangeAddressLine(e.target.value)
            setAddressLookupEnabled(true)
            setAddressSuggestionsOpen(true)
            setAddressSuggestions([])
          }}
          onKeyDown={handleAddressKeyDown}
        />
        {addressSuggestionsOpen && combinedAddressSuggestions.length > 0 && (
          <div id="address-suggestions" className="address-suggestions" role="listbox">
            {combinedAddressSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="address-suggestion"
                role="option"
                aria-selected={addressLine === suggestion.addressLine}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void selectAddress(suggestion)}
              >
                {suggestion.label}
              </button>
            ))}
            {addressSuggestions.length > 0 && (
              <small className="address-suggestions__credit">© OpenStreetMap contributors</small>
            )}
          </div>
        )}
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
