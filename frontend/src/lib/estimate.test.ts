import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Equipment, LaborRate } from '../types'
import { defaultHoursFor, laborCost, laborRange, partsCost } from './estimate.ts'

const rate: LaborRate = {
  jobType: 'repair',
  level: 'standard',
  hourlyRate: 125,
  estimatedHours: { min: 2, max: 5 },
}

const catalog: Equipment[] = [
  { id: 'filter', name: 'Filter', category: 'Parts', brand: 'Acme', modelNumber: 'F1', baseCost: 40 },
  { id: 'thermostat', name: 'Thermostat', category: 'Controls', brand: 'Acme', modelNumber: 'T1', baseCost: 180 },
]

describe('estimate calculations', () => {
  it('uses the quarter-hour midpoint as the default', () => {
    assert.equal(defaultHoursFor(rate), 3.5)
  })

  it('calculates labor and its expected range', () => {
    assert.equal(laborCost(rate, 3.5), 437.5)
    assert.deepEqual(laborRange(rate), { min: 250, max: 625 })
  })

  it('recalculates parts when quantities change and ignores missing items', () => {
    assert.equal(partsCost([{ equipmentId: 'filter', quantity: 1 }], catalog), 40)
    assert.equal(partsCost([{ equipmentId: 'filter', quantity: 3 }], catalog), 120)
    assert.equal(partsCost([{ equipmentId: 'missing', quantity: 2 }], catalog), 0)
  })
})
