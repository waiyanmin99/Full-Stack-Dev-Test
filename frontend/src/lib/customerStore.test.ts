import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EMPTY_CUSTOMER_FORM, type Customer } from '../types.ts'
import { mergeCustomers, upsertSavedCustomer } from './customerStore.ts'

const form = {
  ...EMPTY_CUSTOMER_FORM,
  name: 'New Customer',
  addressLine: '10 Main St',
  city: 'Arcadia',
  state: 'CA',
  zip: '91006',
  phone: '6265550100',
  squareFootage: '2200',
  systemType: 'Ductless Mini-Split Heat Pump',
  systemAge: '1–5 years',
}

describe('saved customers', () => {
  it('adds a new customer with property details for future lookup', () => {
    const saved = upsertSavedCustomer(form, [], [], () => 'LOCAL-1')
    assert.equal(saved.length, 1)
    assert.equal(saved[0]?.id, 'LOCAL-1')
    assert.equal(saved[0]?.squareFootage, 2200)
    assert.equal(saved[0]?.systemAge, '1–5 years')
  })

  it('updates a matching customer instead of creating a duplicate', () => {
    const existing: Customer = {
      id: 'LOCAL-1',
      name: 'Old Name',
      address: '10 Main St, Arcadia, CA 91006',
      phone: '6265550100',
      propertyType: 'residential',
      systemType: 'Central AC',
    }
    const saved = upsertSavedCustomer(form, [existing], [existing], () => 'LOCAL-2')
    assert.equal(saved.length, 1)
    assert.equal(saved[0]?.id, 'LOCAL-1')
    assert.equal(saved[0]?.name, 'New Customer')
  })

  it('lets saved records override bundled records with the same id', () => {
    const seed: Customer = {
      id: 'C1',
      name: 'Original',
      address: '1 First St',
      propertyType: 'residential',
      systemType: 'Central AC',
    }
    assert.equal(mergeCustomers([seed], [{ ...seed, name: 'Updated' }])[0]?.name, 'Updated')
  })
})
