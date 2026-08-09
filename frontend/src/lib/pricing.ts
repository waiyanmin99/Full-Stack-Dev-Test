import type { CustomerFormState } from '../types'

export interface TaxEstimate {
  ratePercent: number
  tax: number
  basis: string
  isCitySpecific: boolean
}

// Current official combined city rates for locations represented in the demo, with official
// statewide rates as a fallback when a city-specific rate is unavailable.
const CITY_RATES: Record<string, number> = {
  'CA:ARCADIA': 10.5,
  'IL:CHATHAM': 8.25,
  'IL:SPRINGFIELD': 9.75,
}

const STATE_BASE_RATES: Record<string, number> = {
  CA: 7.25,
  IL: 6.25,
}

export function estimateTax(
  subtotal: number,
  customer: Pick<CustomerFormState, 'city' | 'state'>,
): TaxEstimate {
  const state = customer.state.trim().toUpperCase()
  const city = customer.city.trim().toUpperCase()
  const cityRate = CITY_RATES[`${state}:${city}`]
  const ratePercent = cityRate ?? STATE_BASE_RATES[state] ?? 0

  return {
    ratePercent,
    tax: subtotal * (ratePercent / 100),
    basis: cityRate !== undefined ? `${customer.city}, ${state}` : state || 'Unknown location',
    isCitySpecific: cityRate !== undefined,
  }
}
