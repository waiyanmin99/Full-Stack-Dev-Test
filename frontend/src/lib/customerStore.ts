import type { Customer, CustomerFormState } from '../types.ts'
import { formatAddress } from './address.ts'
import { phoneDigits } from './format.ts'

const SAVED_CUSTOMERS_KEY = 'fieldquote-saved-customers-v1'

function normalizedAddress(customer: Pick<Customer, 'address'>): string {
  return customer.address.trim().toLowerCase().replace(/\s+/g, ' ')
}

function sameCustomer(a: Customer, b: Customer): boolean {
  const aPhone = phoneDigits(a.phone ?? '')
  const bPhone = phoneDigits(b.phone ?? '')
  if (aPhone !== '' && bPhone !== '' && aPhone === bPhone) return true
  return normalizedAddress(a) === normalizedAddress(b)
}

export function customerFromForm(form: CustomerFormState, id: string): Customer {
  const squareFootage = Number(form.squareFootage)
  return {
    id,
    name: form.name.trim(),
    address: formatAddress({
      line1: form.addressLine.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
    }),
    phone: phoneDigits(form.phone),
    propertyType: form.propertyType,
    squareFootage: Number.isFinite(squareFootage) && squareFootage > 0 ? squareFootage : undefined,
    systemType: form.systemType.trim(),
    systemAge: form.systemAge.trim() || undefined,
  }
}

export function mergeCustomers(seed: Customer[], saved: Customer[]): Customer[] {
  const merged = new Map(seed.map((customer) => [customer.id, customer]))
  saved.forEach((customer) => merged.set(customer.id, customer))
  return Array.from(merged.values())
}

export function upsertSavedCustomer(
  form: CustomerFormState,
  saved: Customer[],
  known: Customer[],
  createId: () => string = () => `LOCAL-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
): Customer[] {
  const candidate = customerFromForm(form, 'candidate')
  const match = known.find((customer) => sameCustomer(customer, candidate))
  const nextCustomer = { ...candidate, id: match?.id ?? createId() }
  const savedIndex = saved.findIndex(
    (customer) => customer.id === nextCustomer.id || sameCustomer(customer, nextCustomer),
  )

  if (savedIndex === -1) return [...saved, nextCustomer]
  if (JSON.stringify(saved[savedIndex]) === JSON.stringify(nextCustomer)) return saved

  return saved.map((customer, index) => (index === savedIndex ? nextCustomer : customer))
}

export function loadSavedCustomers(): Customer[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_CUSTOMERS_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as Customer[]) : []
  } catch {
    return []
  }
}

export function persistSavedCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(SAVED_CUSTOMERS_KEY, JSON.stringify(customers))
  } catch {
    // The estimate remains usable when browser storage is unavailable.
  }
}
