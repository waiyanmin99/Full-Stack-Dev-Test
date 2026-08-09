import type { CustomerFormState, Equipment, LaborRate, SelectedEquipment } from '../types'
import { formatCurrency, formatHours, formatUSPhone } from '../lib/format'
import { JOB_TYPE_LABELS } from '../lib/labels'
import QuestionLayout from './QuestionLayout'

interface ReviewStepProps {
  stepNumber: number
  totalSteps: number
  onBack: () => void
  estimateId: string
  estimateDate: string
  customer: CustomerFormState
  jobType: string
  level: string
  rate: LaborRate | undefined
  hours: number
  laborTotal: number
  selectedItems: { line: SelectedEquipment; item: Equipment }[]
  partsSubtotal: number
  total: number
  rangeMin: number
  rangeMax: number
  notes: string
  onNotesChange: (notes: string) => void
  onPrint: () => void
  onStartOver: () => void
}

export default function ReviewStep({
  stepNumber,
  totalSteps,
  onBack,
  estimateId,
  estimateDate,
  customer,
  jobType,
  level,
  rate,
  hours,
  laborTotal,
  selectedItems,
  partsSubtotal,
  total,
  rangeMin,
  rangeMax,
  notes,
  onNotesChange,
  onPrint,
  onStartOver,
}: ReviewStepProps) {
  return (
    <QuestionLayout
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      onBack={onBack}
      eyebrow={`Estimate ${estimateId} · ${estimateDate}`}
      title="Here's your estimate"
      subtitle={
        rangeMin !== rangeMax
          ? `Could range ${formatCurrency(rangeMin)} – ${formatCurrency(rangeMax)} depending on final scope`
          : undefined
      }
      footer={
        <div className="review-footer">
          <button type="button" className="secondary-button" onClick={onStartOver}>
            Start new estimate
          </button>
          <button type="button" className="primary-button" onClick={onPrint}>
            Print / Save PDF
          </button>
        </div>
      }
    >
      <div className="quote-hero">
        <span>Estimated total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>

      <div className="estimate-doc">
        <div className="estimate-doc__letterhead">
          <img src="/logo-mark.png" alt="" width={28} height={28} />
          <strong>Right Click</strong>
        </div>

        <div className="estimate-doc__section">
          <span className="estimate-doc__label">Customer</span>
          <div className="estimate-doc__grid">
            <div>
              <strong>{customer.name || 'Walk-in customer'}</strong>
              <div>{customer.addressLine || '—'}</div>
              {(customer.city || customer.state || customer.zip) && (
                <div>
                  {[customer.city, [customer.state, customer.zip].filter(Boolean).join(' ')]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
              {customer.phone && <div>+1 {formatUSPhone(customer.phone)}</div>}
            </div>
            <div>
              <div>{customer.propertyType === 'commercial' ? 'Commercial' : 'Residential'} property</div>
              {customer.squareFootage && <div>{customer.squareFootage} sq ft</div>}
              {customer.systemType && <div>{customer.systemType}</div>}
              {customer.systemAge && <div>System age: {customer.systemAge} yrs</div>}
            </div>
          </div>
        </div>

        <div className="estimate-doc__section">
          <span className="estimate-doc__label">Labor</span>
          <table className="estimate-table">
            <tbody>
              <tr>
                <td>
                  {JOB_TYPE_LABELS[jobType] ?? jobType} &mdash; {level}
                  <div className="estimate-table__sub">
                    {rate ? `${formatCurrency(rate.hourlyRate, true)}/hr × ${formatHours(hours)}` : ''}
                  </div>
                </td>
                <td className="estimate-table__amount">{formatCurrency(laborTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {selectedItems.length > 0 && (
          <div className="estimate-doc__section">
            <span className="estimate-doc__label">Equipment &amp; parts</span>
            <table className="estimate-table">
              <tbody>
                {selectedItems.map(({ line, item }) => (
                  <tr key={item.id}>
                    <td>
                      {item.name}
                      <div className="estimate-table__sub">
                        {item.brand} · {item.modelNumber} · Qty {line.quantity} ×{' '}
                        {formatCurrency(item.baseCost, true)}
                      </div>
                    </td>
                    <td className="estimate-table__amount">
                      {formatCurrency(item.baseCost * line.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="estimate-doc__totals">
          <div className="estimate-doc__totals-row">
            <span>Labor subtotal</span>
            <span>{formatCurrency(laborTotal)}</span>
          </div>
          <div className="estimate-doc__totals-row">
            <span>Parts subtotal</span>
            <span>{formatCurrency(partsSubtotal)}</span>
          </div>
          <div className="estimate-doc__totals-row estimate-doc__totals-row--grand">
            <span>Estimated total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="estimate-doc__section no-print">
          <label className="field">
            <span className="field__label">Notes for this estimate (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              placeholder="e.g. Customer requested weekend install, attic access limited…"
            />
          </label>
        </div>

        {notes.trim() !== '' && (
          <div className="estimate-doc__section print-only">
            <span className="estimate-doc__label">Notes</span>
            <p>{notes}</p>
          </div>
        )}

        <p className="estimate-doc__disclaimer">
          This estimate is based on information available at the time of the visit and is valid
          for 30 days. Final pricing may vary if additional work is identified once the job is
          underway.
        </p>
      </div>
    </QuestionLayout>
  )
}
