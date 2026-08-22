import { useRef, useState } from 'react'
import type {
  CustomerFormState,
  Equipment,
  LaborRate,
  SelectedEquipment,
} from '../types'
import { formatCurrency, formatHours, formatUSPhone } from '../lib/format'
import { JOB_TYPE_LABELS } from '../lib/labels'
import { formatSystemAge } from '../data/systemAges'
import type { TaxEstimate } from '../lib/pricing'
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
  taxEstimate: TaxEstimate
  customerSaved: boolean
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
  taxEstimate,
  customerSaved,
  notes,
  onNotesChange,
  onPrint,
  onStartOver,
}: ReviewStepProps) {
  const docRef = useRef<HTMLDivElement>(null)
  const [shareStatus, setShareStatus] = useState<'idle' | 'generating' | 'downloaded' | 'error'>(
    'idle',
  )

  async function handleShare() {
    if (!docRef.current || shareStatus === 'generating') return
    setShareStatus('generating')
    try {
      const { elementToPdfFile } = await import('../lib/pdf')
      const file = await elementToPdfFile(docRef.current, `estimate-${estimateId}.pdf`)
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean
        share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void>
      }
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: `Estimate ${estimateId}`,
          text: `Estimate ${estimateId} for ${customer.name || 'your service'} — ${formatCurrency(total)}`,
        })
        setShareStatus('idle')
      } else {
        const url = URL.createObjectURL(file)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        setShareStatus('downloaded')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setShareStatus('idle')
      } else {
        setShareStatus('error')
      }
    }
  }

  return (
    <QuestionLayout
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      onBack={onBack}
      footer={
        <div className="review-footer">
          <button
            type="button"
            className="primary-button review-footer__share"
            onClick={() => void handleShare()}
            disabled={shareStatus === 'generating'}
          >
            {shareStatus === 'generating' ? 'Preparing PDF…' : 'Share estimate PDF'}
          </button>
          {shareStatus === 'downloaded' && (
            <p className="review-footer__hint">
              PDF downloaded — attach it in your messaging app to text it to the customer.
            </p>
          )}
          {shareStatus === 'error' && (
            <p className="review-footer__hint review-footer__hint--error">
              Couldn't prepare the PDF. Try Print / Save PDF instead.
            </p>
          )}
          <div className="review-footer__row">
            <button type="button" className="secondary-button" onClick={onStartOver}>
              Start new estimate
            </button>
            <button type="button" className="secondary-button" onClick={onPrint}>
              Print / Save PDF
            </button>
          </div>
        </div>
      }
    >
      <div className="estimate-doc" ref={docRef}>
        <div className="estimate-doc__letterhead print-only">
          <img src="/logo-mark.png" alt="" width={28} height={28} />
          <div>
            <strong>Right Click</strong>
            <span>
              Estimate {estimateId} · {estimateDate}
            </span>
          </div>
        </div>

        <div className="estimate-doc__section">
          <div className="estimate-doc__section-heading">
            <span className="estimate-doc__label">Customer</span>
            {customerSaved && <span className="saved-customer-badge no-print">Saved on this device</span>}
          </div>
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
              {customer.systemAge && <div>System age: {formatSystemAge(customer.systemAge)}</div>}
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
            <span>Catalog equipment subtotal</span>
            <span>{formatCurrency(partsSubtotal)}</span>
          </div>
          <div className="estimate-doc__totals-row">
            <span>
              {taxEstimate.ratePercent > 0
                ? `Estimated tax (${taxEstimate.ratePercent}%)`
                : 'Estimated tax unavailable'}
            </span>
            <span>{formatCurrency(taxEstimate.tax)}</span>
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
          This estimate is based on information available at the time of the visit and is valid for
          30 days. Equipment uses provided catalog cost, not a configured selling price.{' '}
          {taxEstimate.ratePercent === 0
            ? 'A tax estimate was unavailable for this location; confirm tax before invoicing. '
            : taxEstimate.isCitySpecific
              ? `Estimated tax uses the available combined rate for ${taxEstimate.basis}; confirm tax before invoicing. `
              : `Estimated tax uses the ${taxEstimate.basis} state base rate and may exclude local district tax; confirm tax before invoicing. `}
          Final pricing may vary if additional work is identified once the job is underway.
        </p>
      </div>
    </QuestionLayout>
  )
}
