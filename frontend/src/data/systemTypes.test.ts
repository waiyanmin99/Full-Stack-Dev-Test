import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { matchingSystemTypes } from './systemTypes.ts'

describe('system type suggestions', () => {
  it('matches common staff terminology and aliases', () => {
    assert.equal(matchingSystemTypes('mini split')[0]?.name, 'Ductless Mini-Split Heat Pump')
    assert.equal(matchingSystemTypes('hybrid')[0]?.name, 'Dual-Fuel Heat Pump + Gas Furnace')
    assert.equal(matchingSystemTypes('RTU')[0]?.name, 'Rooftop Unit (RTU)')
  })

  it('requires every typed term to match', () => {
    const results = matchingSystemTypes('commercial water')
    assert.equal(results.length, 1)
    assert.equal(results[0]?.name, 'Chiller + Air Handlers / Fan Coils')
  })
})
