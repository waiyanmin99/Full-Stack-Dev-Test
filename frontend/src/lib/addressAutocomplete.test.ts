import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parsePhotonSuggestions } from './addressAutocomplete.ts'

describe('address autocomplete', () => {
  it('normalizes a Photon result into the customer address fields', () => {
    const suggestions = parsePhotonSuggestions({
      features: [{
        properties: {
          osm_type: 'W',
          osm_id: 123,
          housenumber: '111',
          street: 'South Grand Avenue',
          city: 'Los Angeles',
          state: 'California',
          postcode: '90012',
          countrycode: 'US',
        },
      }],
    })

    assert.deepEqual(suggestions[0], {
      id: 'W-123',
      label: '111 South Grand Avenue, Los Angeles, CA 90012',
      addressLine: '111 South Grand Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90012',
    })
  })

  it('ignores non-US results and removes duplicates', () => {
    const properties = {
      osm_type: 'W',
      osm_id: 1,
      street: 'Sunset Boulevard',
      city: 'Los Angeles',
      state: 'California',
      countrycode: 'US',
    }
    assert.equal(parsePhotonSuggestions({
      features: [
        { properties },
        { properties: { ...properties, osm_id: 2 } },
        { properties: { ...properties, countrycode: 'CA' } },
      ],
    }).length, 1)
  })
})
