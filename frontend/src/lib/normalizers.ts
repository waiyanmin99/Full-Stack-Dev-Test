import type { Customer, Equipment, PropertyType } from '../types'

export interface RawCustomer {
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

export interface RawEquipment {
  id: string
  name: string
  category: string
  brand: string
  modelNumber: string
  baseCost?: number
  base_cost?: number
}

export function normalizePropertyType(value: string | undefined): PropertyType {
  return value?.toLowerCase() === 'commercial' ? 'commercial' : 'residential'
}

export function normalizeCustomer(raw: RawCustomer): Customer {
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

export function normalizeEquipment(raw: RawEquipment): Equipment {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    brand: raw.brand,
    modelNumber: raw.modelNumber,
    baseCost: raw.baseCost ?? raw.base_cost ?? 0,
  }
}
