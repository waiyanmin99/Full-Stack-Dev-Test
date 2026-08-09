import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { estimateTax } from './pricing.ts'

describe('estimated tax', () => {
  it('uses the current Arcadia combined rate on the estimate subtotal', () => {
    const result = estimateTax(8400, { city: 'Arcadia', state: 'CA' })
    assert.equal(result.ratePercent, 10.5)
    assert.equal(result.tax, 882)
    assert.equal(result.basis, 'Arcadia, CA')
    assert.equal(result.isCitySpecific, true)
  })

  it('uses a state base rate when no city estimate is available', () => {
    const result = estimateTax(1000, { city: 'Unknown', state: 'CA' })
    assert.equal(result.ratePercent, 7.25)
    assert.equal(result.tax, 72.5)
    assert.equal(result.isCitySpecific, false)
  })

  it('does not invent a rate for an unsupported location', () => {
    const result = estimateTax(1000, { city: 'Portland', state: 'OR' })
    assert.equal(result.ratePercent, 0)
    assert.equal(result.tax, 0)
  })
})
