export type PropertyType = 'residential' | 'commercial'

export interface Customer {
  id: string
  name: string
  address: string
  phone?: string
  propertyType: PropertyType
  squareFootage?: number
  systemType: string
  systemAge?: number
  lastServiceDate?: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  brand: string
  modelNumber: string
  baseCost: number
}

export interface LaborRate {
  jobType: string
  level: string
  hourlyRate: number
  estimatedHours: { min: number; max: number }
}

export interface SelectedEquipment {
  equipmentId: string
  quantity: number
}

export interface CustomerFormState {
  name: string
  address: string
  phone: string
  propertyType: PropertyType
  squareFootage: string
  systemType: string
  systemAge: string
}

export const EMPTY_CUSTOMER_FORM: CustomerFormState = {
  name: '',
  address: '',
  phone: '',
  propertyType: 'residential',
  squareFootage: '',
  systemType: '',
  systemAge: '',
}
