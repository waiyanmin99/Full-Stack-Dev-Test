import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatAddress, parseAddress } from './address.ts'

describe('customer addresses', () => {
  it('splits and reconstructs a standard customer address', () => {
    const parsed = parseAddress('4821 Oakridge Dr, Springfield, IL 62704')
    assert.deepEqual(parsed, {
      line1: '4821 Oakridge Dr',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
    })
    assert.equal(formatAddress(parsed), '4821 Oakridge Dr, Springfield, IL 62704')
  })

  it('keeps an unstructured address usable', () => {
    assert.deepEqual(parseAddress('Remote job site'), {
      line1: 'Remote job site',
      city: '',
      state: '',
      zip: '',
    })
  })
})
