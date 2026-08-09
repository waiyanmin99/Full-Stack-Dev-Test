import { useMemo, useState } from 'react'
import type { Customer } from '../../types'
import { formatDate } from '../../lib/format'

interface LookupQuestionProps {
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
  onStartBlank: () => void
  onContinue: () => void
}

export default function LookupQuestion({
  customers,
  onSelectCustomer,
  onStartBlank,
  onContinue,
}: LookupQuestionProps) {
  const [mode, setMode] = useState<'ask' | 'search'>('ask')
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers.slice(0, 6)
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [customers, query])

  if (mode === 'ask') {
    return (
      <div className="choice-list">
        <button type="button" className="choice-option" onClick={() => setMode('search')}>
          <span className="choice-option__label">Yes, look them up</span>
          <span className="choice-option__helper">Find an existing customer record</span>
        </button>
        <button
          type="button"
          className="choice-option"
          onClick={() => {
            onStartBlank()
            window.setTimeout(onContinue, 200)
          }}
        >
          <span className="choice-option__label">No, it&apos;s a new customer</span>
          <span className="choice-option__helper">Start a blank estimate</span>
        </button>
      </div>
    )
  }

  return (
    <div className="lookup-search">
      <input
        autoFocus
        type="search"
        className="question-input"
        placeholder="Search name, address, or customer ID"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="customer-results">
        {results.length === 0 && <p className="customer-results__empty">No matches found.</p>}
        {results.map((customer) => (
          <button
            type="button"
            key={customer.id}
            className="customer-card"
            onClick={() => {
              onSelectCustomer(customer)
              window.setTimeout(onContinue, 200)
            }}
          >
            <div className="customer-card__top">
              <strong>{customer.name}</strong>
              <span className={`badge badge--${customer.propertyType}`}>
                {customer.propertyType}
              </span>
            </div>
            <div className="customer-card__address">{customer.address}</div>
            <div className="customer-card__meta">
              {customer.systemType}
              {customer.lastServiceDate && ` · Last service ${formatDate(customer.lastServiceDate)}`}
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="link-button"
        onClick={() => {
          onStartBlank()
          onContinue()
        }}
      >
        Can&apos;t find them? Start blank instead
      </button>
    </div>
  )
}
