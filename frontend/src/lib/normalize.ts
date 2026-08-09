import type { Customer, Equipment, LaborRate } from '../types'
import rawCustomers from '../data/customers.json'
import rawEquipment from '../data/equipment.json'
import rawLaborRates from '../data/laborRates.json'

// The source exports were pulled from different systems at different times,
// so a handful of records use alternate key names for the same field
// (propertyType/property_type, squareFootage/sqft, baseCost/base_cost).
// Normalizing here means every consumer downstream can rely on one shape.

import {
  normalizeCustomer,
  normalizeEquipment,
  type RawCustomer,
  type RawEquipment,
} from './normalizers'

export { normalizeCustomer, normalizeEquipment, normalizePropertyType } from './normalizers'

export const customers: Customer[] = (rawCustomers as RawCustomer[]).map(normalizeCustomer)
export const equipment: Equipment[] = (rawEquipment as RawEquipment[]).map(normalizeEquipment)
export const laborRates: LaborRate[] = rawLaborRates as LaborRate[]

export const equipmentCategories: string[] = Array.from(
  new Set(equipment.map((item) => item.category)),
).sort()

export const jobTypes: string[] = Array.from(new Set(laborRates.map((rate) => rate.jobType)))

export function levelsForJobType(jobType: string): LaborRate[] {
  return laborRates.filter((rate) => rate.jobType === jobType)
}

export function findRate(jobType: string, level: string): LaborRate | undefined {
  return laborRates.find((rate) => rate.jobType === jobType && rate.level === level)
}
