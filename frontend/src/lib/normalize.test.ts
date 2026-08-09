import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeCustomer, normalizeEquipment, normalizePropertyType } from './normalizers.ts'

describe('data normalization', () => {
  it('normalizes alternate customer field names', () => {
    const customer = normalizeCustomer({
      id: 'c1',
      name: 'Test Customer',
      address: '1 Main St, Austin, TX 78701',
      property_type: 'Commercial',
      sqft: 4200,
      systemType: 'Rooftop unit',
    })

    assert.equal(customer.propertyType, 'commercial')
    assert.equal(customer.squareFootage, 4200)
  })

  it('normalizes alternate equipment cost fields', () => {
    const item = normalizeEquipment({
      id: 'e1',
      name: 'Condenser',
      category: 'Cooling',
      brand: 'Acme',
      modelNumber: 'AC-1',
      base_cost: 1750,
    })

    assert.equal(item.baseCost, 1750)
    assert.equal(normalizePropertyType(undefined), 'residential')
  })
})
