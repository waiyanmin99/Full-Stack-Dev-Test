import { useMemo, useState } from 'react'
import type { Customer, CustomerFormState } from '../../types'
import { formatCurrency, formatDate } from '../../lib/format'
import type { SavedEstimate } from '../../lib/estimateStore'
import NameAddressQuestion from '../questions/NameAddressQuestion'
import PhoneQuestion from '../questions/PhoneQuestion'
import ChoiceQuestion from '../questions/ChoiceQuestion'
import SystemDetailsQuestion from '../questions/SystemDetailsQuestion'

interface CustomerPropertyPageProps {
  customerForm: CustomerFormState
  knownCustomers: Customer[]
  recentEstimates: SavedEstimate[]
  onSelectCustomer: (customer: Customer) => void
  onStartBlank: () => void
  onResumeEstimate: (estimate: SavedEstimate) => void
  onChangeForm: (patch: Partial<CustomerFormState>) => void
  canContinue: boolean
  onContinue: () => void
}

export default function CustomerPropertyPage({
  customerForm,
  knownCustomers,
  recentEstimates,
  onSelectCustomer,
  onStartBlank,
  onResumeEstimate,
  onChangeForm,
  canContinue,
  onContinue,
}: CustomerPropertyPageProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return knownCustomers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      )
      .slice(0, 5)
  }, [knownCustomers, query])

  const hasCustomer = customerForm.name.trim() !== '' || customerForm.addressLine.trim() !== ''

  function submitIfReady() {
    if (canContinue) onContinue()
  }

  return (
    <div className="page-sections">
      <section className="page-section">
        <h2 className="page-section__heading">Find an existing customer</h2>
        <input
          type="search"
          className="question-input"
          placeholder="Search name, address, or customer ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {results.length > 0 && (
          <div className="customer-results">
            {results.map((customer) => (
              <button
                type="button"
                key={customer.id}
                className="customer-card"
                onClick={() => {
                  onSelectCustomer(customer)
                  setQuery('')
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
        )}
        {hasCustomer && (
          <button type="button" className="link-button" onClick={onStartBlank}>
            Clear and start a new customer
          </button>
        )}

        {recentEstimates.length > 0 && (
          <div className="recent-estimates" aria-labelledby="recent-estimates-title">
            <div className="recent-estimates__heading">
              <h3 id="recent-estimates-title">Recent estimates</h3>
              <span>Saved on this device</span>
            </div>
            {recentEstimates.slice(0, 3).map((estimate) => (
              <button
                type="button"
                className="recent-estimate"
                key={estimate.estimateId}
                onClick={() => onResumeEstimate(estimate)}
              >
                <span>
                  <strong>{estimate.customerForm.name || 'Unnamed customer'}</strong>
                  <small>{estimate.estimateId}</small>
                </span>
                <span>
                  <strong>{formatCurrency(estimate.total)}</strong>
                  <small>{formatDate(estimate.savedAt)}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <h2 className="page-section__heading">Customer &amp; address</h2>
        <NameAddressQuestion
          name={customerForm.name}
          addressLine={customerForm.addressLine}
          city={customerForm.city}
          state={customerForm.state}
          zip={customerForm.zip}
          knownCustomers={knownCustomers}
          onChangeName={(v) => onChangeForm({ name: v })}
          onChangeAddressLine={(v) => onChangeForm({ addressLine: v })}
          onChangeCity={(v) => onChangeForm({ city: v })}
          onChangeState={(v) => onChangeForm({ state: v })}
          onChangeZip={(v) => onChangeForm({ zip: v })}
          onSubmit={submitIfReady}
          canSubmit={canContinue}
        />
      </section>

      <section className="page-section">
        <h2 className="page-section__heading">
          Phone <span className="page-section__optional">Optional</span>
        </h2>
        <PhoneQuestion
          value={customerForm.phone}
          onChange={(v) => onChangeForm({ phone: v })}
          onSubmit={submitIfReady}
        />
      </section>

      <section className="page-section">
        <h2 className="page-section__heading">Property type</h2>
        <ChoiceQuestion
          value={customerForm.propertyType}
          onSelect={(v) => onChangeForm({ propertyType: v as 'residential' | 'commercial' })}
          options={[
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
          ]}
        />
      </section>

      <section className="page-section">
        <h2 className="page-section__heading">
          Property &amp; system details <span className="page-section__optional">Optional</span>
        </h2>
        <SystemDetailsQuestion
          squareFootage={customerForm.squareFootage}
          systemType={customerForm.systemType}
          systemAge={customerForm.systemAge}
          onChangeSquareFootage={(v) => onChangeForm({ squareFootage: v })}
          onChangeSystemType={(v) => onChangeForm({ systemType: v })}
          onChangeSystemAge={(v) => onChangeForm({ systemAge: v })}
          onSubmit={submitIfReady}
        />
      </section>
    </div>
  )
}
