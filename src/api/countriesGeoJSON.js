/**
 * Country boundaries GeoJSON for map highlight. Fetches once and caches.
 * Uses datasets/geo-countries (properties: name, ISO3166-1-Alpha-2).
 */

const COUNTRIES_GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'

let cached = null

export async function fetchCountriesGeoJSON() {
  if (cached) return cached
  try {
    const res = await fetch(COUNTRIES_GEOJSON_URL)
    if (!res.ok) throw new Error(res.statusText)
    const data = await res.json()
    if (data?.type === 'FeatureCollection' && Array.isArray(data.features)) {
      cached = data
      return cached
    }
  } catch (_) {}
  return null
}

/**
 * Find the feature for a country by name or ISO 3166-1 Alpha-2 code.
 * Returns the GeoJSON feature or null.
 */
export function getCountryFeature(geoJson, countryName, countryCode) {
  if (!geoJson?.features?.length) return null
  const name = (countryName || '').trim().toLowerCase()
  const code = (countryCode || '').trim().toUpperCase()
  for (const f of geoJson.features) {
    const p = f.properties || {}
    const pName = (p.name || '').toLowerCase()
    const pCode = (p['ISO3166-1-Alpha-2'] || p.ISO_A2 || p.iso_a2 || '').toUpperCase()
    if (code && pCode === code) return f
    if (name && (pName === name || pName.includes(name) || name.includes(pName))) return f
  }
  return null
}
