import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  matchingKnownAddresses,
  parsePhotonSuggestions,
  parseVerifiedZip,
} from './addressAutocomplete.ts'

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

  it('preserves the typed house number for street-level suggestions', () => {
    const suggestions = parsePhotonSuggestions({
      features: [{
        properties: {
          osm_type: 'W',
          osm_id: 456,
          street: 'Muscatel Avenue',
          city: 'Rosemead',
          state: 'California',
          postcode: '91776',
          countrycode: 'US',
        },
      }],
    }, '315 Muscatel Ave')

    assert.equal(suggestions[0]?.addressLine, '315 Muscatel Avenue')
    assert.equal(suggestions[0]?.label, '315 Muscatel Avenue, Rosemead, CA')
    assert.equal(suggestions[0]?.zip, '')
  })

  it('uses the exact-address ZIP returned by the Census geocoder', () => {
    assert.equal(parseVerifiedZip({
      result: {
        addressMatches: [{
          addressComponents: { zip: '91770' },
        }],
      },
    }), '91770')
    assert.equal(parseVerifiedZip({ result: { addressMatches: [] } }), '')
  })

  it('matches known customer addresses from partial typing', () => {
    const suggestions = matchingKnownAddresses('315 Cal', [{
      id: 'LOCAL-1',
      name: 'Jane Doe',
      address: '315 California St, Arcadia, CA 91006',
      propertyType: 'residential',
      systemType: 'Central AC',
    }])

    assert.deepEqual(suggestions[0], {
      id: 'known-LOCAL-1',
      label: '315 California St, Arcadia, CA 91006',
      addressLine: '315 California St',
      city: 'Arcadia',
      state: 'CA',
      zip: '91006',
    })
  })
})
