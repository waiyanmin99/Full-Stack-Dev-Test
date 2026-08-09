import { US_STATES } from './address.ts'
import { parseAddress } from './address.ts'
import type { Customer } from '../types.ts'

export interface AddressSuggestion {
  id: string
  label: string
  addressLine: string
  city: string
  state: string
  zip: string
}

interface PhotonProperties {
  osm_type?: string
  osm_id?: number
  name?: string
  housenumber?: string
  street?: string
  city?: string
  locality?: string
  district?: string
  state?: string
  postcode?: string
  countrycode?: string
}

interface PhotonResponse {
  features?: Array<{ properties?: PhotonProperties }>
}

const stateCodes = new Map(US_STATES.map((state) => [state.label.toLowerCase(), state.value]))

function normalizedSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function matchingKnownAddresses(
  query: string,
  customers: Customer[],
): AddressSuggestion[] {
  const normalizedQuery = normalizedSearchText(query)
  if (normalizedQuery.length < 2) return []

  return customers
    .flatMap((customer) => {
      const parsed = parseAddress(customer.address)
      if (!normalizedSearchText(customer.address).includes(normalizedQuery)) return []
      return [{
        id: `known-${customer.id}`,
        label: customer.address,
        addressLine: parsed.line1,
        city: parsed.city,
        state: parsed.state,
        zip: parsed.zip,
      }]
    })
    .slice(0, 5)
}

function typedHouseNumber(query: string): string {
  return query.trim().match(/^(\d+[A-Za-z]?(?:-\d+[A-Za-z]?)?)\b/)?.[1] ?? ''
}

export function parsePhotonSuggestions(
  data: PhotonResponse,
  query = '',
): AddressSuggestion[] {
  const seen = new Set<string>()
  const enteredHouseNumber = typedHouseNumber(query)

  return (data.features ?? []).flatMap((feature) => {
    const properties = feature.properties
    if (!properties || properties.countrycode?.toUpperCase() !== 'US') return []

    const street = properties.street ?? properties.name ?? ''
    if (!street) return []

    const houseNumber = properties.housenumber ?? enteredHouseNumber
    const addressLine = [houseNumber, street].filter(Boolean).join(' ')
    const city = properties.city ?? properties.locality ?? properties.district ?? ''
    const state = properties.state
      ? (stateCodes.get(properties.state.toLowerCase()) ?? properties.state)
      : ''
    // A street can cross ZIP boundaries. Only expose Photon's ZIP when it matched
    // an actual numbered property; street-level results are verified separately.
    const zip = properties.housenumber ? (properties.postcode ?? '') : ''
    const label = [addressLine, city, [state, zip].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ')

    const duplicateKey = label.toLowerCase()
    if (!addressLine || seen.has(duplicateKey)) return []
    seen.add(duplicateKey)

    return [{
      id: `${properties.osm_type ?? 'place'}-${properties.osm_id ?? duplicateKey}`,
      label,
      addressLine,
      city,
      state,
      zip,
    }]
  })
}

export async function fetchAddressSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    lat: '34.0522',
    lon: '-118.2437',
    zoom: '12',
    location_bias_scale: '0.1',
    bbox: '-118.95,33.65,-117.60,34.85',
    countrycode: 'US',
    limit: '6',
    lang: 'en',
  })
  params.append('layer', 'house')
  params.append('layer', 'street')

  const response = await fetch(`https://photon.komoot.io/api/?${params}`, { signal })
  if (!response.ok) throw new Error(`Address lookup failed with ${response.status}`)
  return parsePhotonSuggestions(await response.json() as PhotonResponse, query)
}

interface CensusResponse {
  result?: {
    addressMatches?: Array<{
      addressComponents?: { zip?: string }
    }>
  }
}

export function parseVerifiedZip(data: CensusResponse): string {
  return data.result?.addressMatches?.[0]?.addressComponents?.zip ?? ''
}

export async function verifyAddressZip(
  suggestion: AddressSuggestion,
  signal?: AbortSignal,
): Promise<string> {
  const fullAddress = [suggestion.addressLine, suggestion.city, suggestion.state]
    .filter(Boolean)
    .join(', ')
  const params = new URLSearchParams({
    address: fullAddress,
    benchmark: 'Public_AR_Current',
    format: 'json',
  })
  const response = await fetch(`/api/address-verify?${params}`, { signal })
  if (!response.ok) throw new Error(`Address verification failed with ${response.status}`)
  return parseVerifiedZip(await response.json() as CensusResponse)
}
