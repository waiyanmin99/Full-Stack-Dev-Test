import { US_STATES } from './address.ts'

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

export function parsePhotonSuggestions(data: PhotonResponse): AddressSuggestion[] {
  const seen = new Set<string>()

  return (data.features ?? []).flatMap((feature) => {
    const properties = feature.properties
    if (!properties || properties.countrycode?.toUpperCase() !== 'US') return []

    const street = properties.street ?? properties.name ?? ''
    if (!street) return []

    const addressLine = [properties.housenumber, street].filter(Boolean).join(' ')
    const city = properties.city ?? properties.locality ?? properties.district ?? ''
    const state = properties.state
      ? (stateCodes.get(properties.state.toLowerCase()) ?? properties.state)
      : ''
    const zip = properties.postcode ?? ''
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
  return parsePhotonSuggestions(await response.json() as PhotonResponse)
}
