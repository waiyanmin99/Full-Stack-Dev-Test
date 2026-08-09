import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EMPTY_CUSTOMER_FORM, type Equipment } from '../types.ts'
import { recommendEquipment } from './recommendations.ts'

const catalog: Equipment[] = [
  {
    id: 'EQ001', name: 'Central AC', category: 'Air Conditioner', brand: 'A', modelNumber: '1', baseCost: 1,
  },
  {
    id: 'EQ009', name: 'Central AC 2', category: 'Air Conditioner', brand: 'B', modelNumber: '2', baseCost: 1,
  },
  {
    id: 'EQ003', name: 'Gas Furnace', category: 'Furnace', brand: 'C', modelNumber: '3', baseCost: 1,
  },
  {
    id: 'EQ018', name: 'Capacitor', category: 'Capacitor', brand: 'D', modelNumber: '4', baseCost: 1,
  },
  {
    id: 'EQ013', name: 'Fan Motor', category: 'Motor', brand: 'E', modelNumber: '5', baseCost: 1,
  },
  {
    id: 'EQ019', name: 'Hard Start', category: 'Capacitor', brand: 'F', modelNumber: '6', baseCost: 1,
  },
]

describe('equipment recommendations', () => {
  it('suggests matching replacement equipment for an older system', () => {
    const customer = {
      ...EMPTY_CUSTOMER_FORM,
      systemType: 'Central AC + Gas Furnace',
      systemAge: '18',
    }
    const ids = recommendEquipment(customer, 'install', 'residential', catalog).map(
      ({ item }) => item.id,
    )
    assert.deepEqual(ids, ['EQ001', 'EQ009', 'EQ003'])
  })

  it('suggests common repair parts without auto-adding them', () => {
    const customer = { ...EMPTY_CUSTOMER_FORM, systemType: 'Central AC', systemAge: '6' }
    const ids = recommendEquipment(customer, 'repair', 'minor', catalog).map(({ item }) => item.id)
    assert.deepEqual(ids, ['EQ018', 'EQ013', 'EQ019'])
  })

  it('does not treat a 12-year-old furnace as automatically replacement-aged', () => {
    const customer = { ...EMPTY_CUSTOMER_FORM, systemType: 'Gas Furnace Only', systemAge: '12' }
    const ids = recommendEquipment(customer, 'diagnostic', 'standard', catalog)
    assert.equal(ids.length, 0)
  })
})
