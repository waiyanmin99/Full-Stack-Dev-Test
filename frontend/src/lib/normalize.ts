import type { Customer, Equipment, LaborRate, PropertyType } from '../types'
import rawCustomers from '../data/customers.json'
import rawEquipment from '../data/equipment.json'
import rawLaborRates from '../data/laborRates.json'

// The source exports were pulled from different systems at different times,
// so a handful of records use alternate key names for the same field
// (propertyType/property_type, squareFootage/sqft, baseCost/base_cost).
// Normalizing here means every consumer downstream can rely on one shape.

interface RawCustomer {
  id: string
  name: string
  address: string
  phone?: string
  propertyType?: string
  property_type?: string
  squareFootage?: number
  sqft?: number
  systemType: string
  systemAge?: number
  lastServiceDate?: string
}

interface RawEquipment {
  id: string
  name: string
  category: string
  brand: string
  modelNumber: string
  baseCost?: number
  base_cost?: number
}

function normalizePropertyType(value: string | undefined): PropertyType {
  return value?.toLowerCase() === 'commercial' ? 'commercial' : 'residential'
}

function normalizeCustomer(raw: RawCustomer): Customer {
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    phone: raw.phone,
    propertyType: normalizePropertyType(raw.propertyType ?? raw.property_type),
    squareFootage: raw.squareFootage ?? raw.sqft,
    systemType: raw.systemType,
    systemAge: raw.systemAge,
    lastServiceDate: raw.lastServiceDate,
  }
}

function normalizeEquipment(raw: RawEquipment): Equipment {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    brand: raw.brand,
    modelNumber: raw.modelNumber,
    baseCost: raw.baseCost ?? raw.base_cost ?? 0,
  }
}

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
