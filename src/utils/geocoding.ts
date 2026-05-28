export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface NominatimAddress {
  house_number?: string
  road?: string
  pedestrian?: string
  footway?: string
  path?: string
  neighbourhood?: string
  suburb?: string
  city?: string
  town?: string
  village?: string
  municipality?: string
  county?: string
  state?: string
  postcode?: string
  country?: string
}

interface NominatimReverseResult {
  display_name?: string
  address?: NominatimAddress
}

const BASE = 'https://nominatim.openstreetmap.org'
const HEADERS: HeadersInit = {
  'Accept-Language': 'en',
  'User-Agent': 'OakandIronSales/1.0',
}

export async function searchPlaces(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return []
  try {
    const url = `${BASE}/search?format=json&limit=5&q=${encodeURIComponent(query)}&addressdetails=0`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return []
    return (await res.json()) as NominatimResult[]
  } catch {
    return []
  }
}

export interface ReverseGeocodeResult {
  address: string
  hasHouseNumber: boolean
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  try {
    // zoom=18 requests house-level granularity from Nominatim
    const url = `${BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return { address: formatCoords(lat, lng), hasHouseNumber: false }
    const data = (await res.json()) as NominatimReverseResult
    return parseAddress(data, lat, lng)
  } catch {
    return { address: formatCoords(lat, lng), hasHouseNumber: false }
  }
}

function parseAddress(data: NominatimReverseResult, lat: number, lng: number): ReverseGeocodeResult {
  const a = data.address
  if (!a) return { address: data.display_name ?? formatCoords(lat, lng), hasHouseNumber: false }

  const houseNumber = a.house_number?.trim() ?? ''
  const road = (a.road ?? a.pedestrian ?? a.footway ?? a.path ?? '').trim()
  const city = (a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? '').trim()

  if (houseNumber && road && city) {
    return { address: `${houseNumber} ${road}, ${city}`, hasHouseNumber: true }
  }
  if (houseNumber && road) {
    return { address: `${houseNumber} ${road}`, hasHouseNumber: true }
  }
  if (road && city) {
    return { address: `${road}, ${city}`, hasHouseNumber: false }
  }
  if (road) {
    return { address: road, hasHouseNumber: false }
  }
  return { address: data.display_name ?? formatCoords(lat, lng), hasHouseNumber: false }
}

function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}
