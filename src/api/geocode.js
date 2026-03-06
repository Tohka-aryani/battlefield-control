/**
 * Geocode place names from article text using Nominatim (OpenStreetMap).
 * Used when source has no default location (Unknown) – try to pinpoint from article content.
 * Rate limit: 1 request per second (Nominatim usage policy).
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'
const RATE_LIMIT_MS = 1100

let lastRequestTime = 0

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Extract a likely place/country from text (simple: look for "in X", "X —", or known country/capital names). */
const COUNTRY_CAPITALS = [
  'Washington', 'London', 'Paris', 'Berlin', 'Tokyo', 'Beijing', 'Moscow', 'Brussels', 'Rome', 'Madrid',
  'Ottawa', 'Canberra', 'New Delhi', 'Seoul', 'Jakarta', 'Brasilia', 'Cairo', 'Pretoria', 'Tehran', 'Jerusalem',
  'Baghdad', 'Kabul', 'Damascus', 'Riyadh', 'Ankara', 'Kuala Lumpur', 'Singapore', 'Bangkok', 'Hanoi', 'Manila',
  'United States', 'United Kingdom', 'France', 'Germany', 'China', 'Russia', 'Ukraine', 'India', 'Japan', 'Brazil',
  'Canada', 'Australia', 'Mexico', 'Italy', 'Spain', 'South Korea', 'Iran', 'Israel', 'Pakistan', 'Nigeria',
]
const PLACE_PATTERNS = [
  /\b(in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g,
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[—\-–]\s/g,
]

function extractPlaceFromText(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.slice(0, 500)
  for (const name of COUNTRY_CAPITALS) {
    if (t.includes(name)) return name
  }
  const match = t.match(/\b(?:in|at|from)\s+([A-Z][a-zA-Z\s]+?)(?:\s+after|\s+as|\s+amid|,|\.|$)/)
  if (match) return match[1].trim()
  return null
}

/**
 * Geocode a place name. Returns { lat, lng, displayName } or null.
 */
export async function geocodePlace(placeName) {
  if (!placeName || typeof placeName !== 'string') return null
  const query = placeName.trim().slice(0, 100)
  if (!query) return null

  const now = Date.now()
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastRequestTime))
  if (wait > 0) await delay(wait)
  lastRequestTime = Date.now()

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
    })
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const first = data?.[0]
    if (!first?.lat || !first?.lon) return null
    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      name: first.display_name || query,
    }
  } catch (_) {
    return null
  }
}

/**
 * Try to get lat/lng from article text (title + description) by extracting a place and geocoding.
 */
export async function geocodeFromArticleText(text) {
  const place = extractPlaceFromText(text)
  if (!place) return null
  return geocodePlace(place)
}

/**
 * Reverse geocode lat/lng to get country. Returns { name, code, lat, lng } or null.
 * Respects Nominatim rate limit.
 */
export async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  const now = Date.now()
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastRequestTime))
  if (wait > 0) await delay(wait)
  lastRequestTime = Date.now()
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
    })
    const res = await fetch(`${NOMINATIM_REVERSE_URL}?${params}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const country = data?.address?.country
    const code = data?.address?.country_code?.toUpperCase?.() || ''
    if (!country) return null
    return {
      name: country,
      code: code || undefined,
      lat,
      lng,
    }
  } catch (_) {
    return null
  }
}
