import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EMPTY_CUSTOMER_FORM } from '../types.ts'
import { upsertSavedEstimate, type SavedEstimate } from './estimateStore.ts'

function estimate(id: string, savedAt: string, total: number): SavedEstimate {
  return {
    estimateId: id,
    savedAt,
    customerForm: { ...EMPTY_CUSTOMER_FORM, name: 'Test Customer' },
    jobType: 'maintenance',
    level: 'standard',
    hours: 1.5,
    selectedEquipment: [],
    notes: '',
    total,
  }
}

describe('saved estimate history', () => {
  it('adds newest estimates first', () => {
    const saved = upsertSavedEstimate(
      [estimate('EST-1', '2026-08-08T18:00:00.000Z', 100)],
      estimate('EST-2', '2026-08-08T19:00:00.000Z', 200),
    )
    assert.deepEqual(saved.map((entry) => entry.estimateId), ['EST-2', 'EST-1'])
  })

  it('updates an existing estimate without duplication', () => {
    const saved = upsertSavedEstimate(
      [estimate('EST-1', '2026-08-08T18:00:00.000Z', 100)],
      estimate('EST-1', '2026-08-08T19:00:00.000Z', 150),
    )
    assert.equal(saved.length, 1)
    assert.equal(saved[0]?.total, 150)
  })
})
