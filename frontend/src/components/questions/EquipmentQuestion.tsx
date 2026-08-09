import { useMemo, useState } from 'react'
import type { Equipment, SelectedEquipment } from '../../types'
import { formatCurrency } from '../../lib/format'
import type { EquipmentRecommendation } from '../../lib/recommendations'

interface EquipmentQuestionProps {
  catalog: Equipment[]
  categories: string[]
  selected: SelectedEquipment[]
  onAdd: (equipmentId: string) => void
  onRemove: (equipmentId: string) => void
  onSetQuantity: (equipmentId: string, quantity: number) => void
  recommendations: EquipmentRecommendation[]
}

export default function EquipmentQuestion({
  catalog,
  categories,
  selected,
  onAdd,
  onRemove,
  onSetQuantity,
  recommendations,
}: EquipmentQuestionProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.equipmentId)), [selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category
      const matchesQuery =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.modelNumber.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [catalog, query, category])

  const selectedItems = selected
    .map((line) => ({ line, item: catalog.find((eq) => eq.id === line.equipmentId) }))
    .filter((entry): entry is { line: SelectedEquipment; item: Equipment } => Boolean(entry.item))

  const partsSubtotal = selectedItems.reduce(
    (sum, { line, item }) => sum + item.baseCost * line.quantity,
    0,
  )

  return (
    <div className="equipment-question">
      {selectedItems.length > 0 && (
        <div className="selected-parts selected-parts--cart" aria-live="polite">
          <div className="selected-parts__heading">
            <span className="field__label">Selected for this job ({selectedItems.length})</span>
            <strong>{formatCurrency(partsSubtotal)}</strong>
          </div>
          {selectedItems.map(({ line, item }) => (
            <div className="selected-part" key={item.id}>
              <div className="selected-part__info">
                <strong>{item.name}</strong>
                <span>{formatCurrency(item.baseCost, true)} each</span>
              </div>
              <div className="selected-part__controls">
                <div className="qty-stepper">
                  <button
                    type="button"
                    onClick={() => onSetQuantity(item.id, Math.max(1, line.quantity - 1))}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    &minus;
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onSetQuantity(item.id, line.quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        type="search"
        className="question-input"
        placeholder="Search name, brand, or model number"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {recommendations.length > 0 && (
        <section className="equipment-recommendations" aria-labelledby="recommendations-title">
          <div className="equipment-recommendations__heading">
            <div>
              <span className="field__label">Possible catalog matches</span>
              <h2 id="recommendations-title">Suggested items to inspect</h2>
            </div>
            <span>{recommendations.length} matches</span>
          </div>
          <div className="equipment-recommendations__list">
            {recommendations.map(({ item, reason }) => (
              <div className="equipment-recommendation" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.brand} · {item.modelNumber} · {formatCurrency(item.baseCost, true)}</span>
                  <p>{reason}</p>
                </div>
                <button
                  type="button"
                  className="add-button"
                  disabled={selectedIds.has(item.id)}
                  onClick={() => onAdd(item.id)}
                >
                  {selectedIds.has(item.id) ? 'Added' : 'Add'}
                </button>
              </div>
            ))}
          </div>
          <p className="equipment-recommendations__disclaimer">
            These are inspection shortcuts, not a diagnosis or matched-system design. Confirm
            capacity, AHRI compatibility, electrical requirements, and sizing before adding one.
          </p>
        </section>
      )}

      <div className="chip-group chip-group--scroll">
        <button
          type="button"
          className={`chip${category === 'all' ? ' chip--active' : ''}`}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`chip${category === cat ? ' chip--active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="equipment-grid">
        {filtered.map((item) => (
          <div className="equipment-card" key={item.id}>
            <div className="equipment-card__body">
              <strong>{item.name}</strong>
              <span className="equipment-card__meta">
                {item.brand} · {item.modelNumber}
              </span>
            </div>
            <div className="equipment-card__footer">
              <span className="equipment-card__price">{formatCurrency(item.baseCost, true)}</span>
              <button
                type="button"
                className="add-button"
                disabled={selectedIds.has(item.id)}
                onClick={() => onAdd(item.id)}
              >
                {selectedIds.has(item.id) ? 'Added' : 'Add'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="customer-results__empty">No matching items.</p>}
      </div>

      <p className="pricing-note">
        Prices shown are provided catalog costs, not configured customer selling prices. Estimated
        tax is added automatically on Review.
      </p>
    </div>
  )
}
