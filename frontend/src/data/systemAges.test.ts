import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { estimatedSystemAge, formatSystemAge, matchingSystemAges } from './systemAges.ts'

describe('system age guidance', () => {
  it('suggests the exact numeric age entered', () => {
    assert.equal(matchingSystemAges('12')[0]?.value, '12')
    assert.equal(estimatedSystemAge('12'), 12)
  })

  it('offers common exact ages and preserves legacy saved ranges', () => {
    assert.deepEqual(
      matchingSystemAges('').map((age) => age.value),
      ['1', '5', '10', '15', '20', '25', '30'],
    )
    assert.equal(estimatedSystemAge('16–20 years'), 18)
    assert.equal(formatSystemAge('12'), '12 yrs')
  })

  it('rejects nonnumeric and out-of-range suggestions', () => {
    assert.deepEqual(matchingSystemAges('Unknown'), [])
    assert.deepEqual(matchingSystemAges('101'), [])
  })
})
