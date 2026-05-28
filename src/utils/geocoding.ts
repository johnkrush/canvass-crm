export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const BASE = 'https://nominatim.openstreetmap.org'
const HEADERS: HeadersInit = {
  'Accept-Language': 'en',
  'User-Agent': 'CanvassApp/1.0',
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

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `${BASE}/reverse?format=json&lat=${lat}&lon=${lng}`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return formatCoords(lat, lng)
    const data = (await res.json()) as { display_name?: string }
    return data.display_name ?? formatCoords(lat, lng)
  } catch {
    return formatCoords(lat, lng)
  }
}

function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}
