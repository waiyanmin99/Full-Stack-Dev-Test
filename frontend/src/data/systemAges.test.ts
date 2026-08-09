import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { estimatedSystemAge, formatSystemAge, matchingSystemAges } from './systemAges.ts'

describe('system age guidance', () => {
  it('matches an exact age to the appropriate range', () => {
    assert.equal(matchingSystemAges('12')[0]?.value, '11–15 years')
    assert.equal(estimatedSystemAge('12'), 12)
  })

  it('supports ranges and readable estimate labels', () => {
    assert.equal(estimatedSystemAge('16–20 years'), 18)
    assert.equal(formatSystemAge('12'), '12 yrs')
    assert.equal(formatSystemAge('Unknown'), 'Unknown')
  })
})
