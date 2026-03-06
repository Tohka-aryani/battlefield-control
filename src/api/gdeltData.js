/**
 * GDELT Project API integration for Battlefield Control.
 * DOC 2.0 API → article lists (The Wall, Footer ticker)
 * DOC 2.0 API + country centroids → map clusters (GEO API is down)
 */

import { getCategory, getSeverity, SEVERITY_DISPLAY } from '../data/wallMapConfig'
import { extractLocation } from '../data/cityCoords'

const GDELT_DOC = 'https://api.gdeltproject.org/api/v2/doc/doc'
const PROXY_RAW = 'https://api.allorigins.win/raw?url='

const DOC_QUERIES = [
  { q: '(conflict OR war OR attack OR military OR strike OR airstrike OR bombing OR shelling OR offensive OR troops)', n: 250, span: '12h' },
  { q: '(missile OR nuclear OR weapons OR drone OR artillery OR ceasefire OR frontline OR casualties OR killed)', n: 250, span: '12h' },
  { q: '(terror OR insurgency OR militia OR coup OR invasion OR hostage OR siege OR ambush OR combat)', n: 200, span: '24h' },
  { q: '(election OR government OR sanctions OR diplomat OR protest OR parliament)', n: 100, span: '24h' },
  { q: '(earthquake OR flood OR hurricane OR disaster OR humanitarian OR refugee OR crisis OR famine)', n: 100, span: '24h' },
]

const COUNTRY_COORDS = {
  'Afghanistan': [33.9, 67.7], 'Albania': [41.3, 20.2], 'Algeria': [28.0, 1.7],
  'Argentina': [-38.4, -63.6], 'Armenia': [40.1, 45.0], 'Australia': [-25.3, 133.8],
  'Austria': [47.5, 14.6], 'Azerbaijan': [40.1, 47.6], 'Bahrain': [26.0, 50.6],
  'Bangladesh': [23.7, 90.4], 'Belarus': [53.7, 27.9], 'Belgium': [50.5, 4.5],
  'Bolivia': [-16.3, -63.6], 'Bosnia And Herzegovina': [43.9, 17.7],
  'Brazil': [-14.2, -51.9], 'Bulgaria': [42.7, 25.5], 'Cambodia': [12.6, 105.0],
  'Cameroon': [7.4, 12.4], 'Canada': [56.1, -106.3], 'Chile': [-35.7, -71.5],
  'China': [35.9, 104.2], 'Colombia': [4.6, -74.3], 'Congo': [-4.0, 21.8],
  'Costa Rica': [9.7, -83.8], 'Croatia': [45.1, 15.2], 'Cuba': [21.5, -78.0],
  'Cyprus': [35.1, 33.4], 'Czech Republic': [49.8, 15.5], 'Czechia': [49.8, 15.5],
  'Democratic Republic Of The Congo': [-4.0, 21.8],
  'Denmark': [56.3, 9.5], 'Dominican Republic': [18.7, -70.2],
  'Ecuador': [-1.8, -78.2], 'Egypt': [26.8, 30.8], 'El Salvador': [13.8, -88.9],
  'Estonia': [58.6, 25.0], 'Ethiopia': [9.1, 40.5], 'Finland': [61.9, 25.7],
  'France': [46.2, 2.2], 'Georgia': [42.3, 43.4], 'Germany': [51.2, 10.5],
  'Ghana': [7.9, -1.0], 'Greece': [39.1, 21.8], 'Guatemala': [15.8, -90.2],
  'Haiti': [19.1, -72.3], 'Honduras': [15.2, -86.2], 'Hong Kong': [22.4, 114.1],
  'Hungary': [47.2, 19.5], 'Iceland': [65.0, -19.0], 'India': [20.6, 78.9],
  'Indonesia': [-0.8, 113.9], 'Iran': [32.4, 53.7], 'Iraq': [33.2, 43.7],
  'Ireland': [53.1, -7.7], 'Israel': [31.0, 34.9], 'Italy': [41.9, 12.6],
  'Ivory Coast': [7.5, -5.5], 'Jamaica': [18.1, -77.3], 'Japan': [36.2, 138.3],
  'Jordan': [30.6, 36.2], 'Kazakhstan': [48.0, 68.0], 'Kenya': [-0.02, 37.9],
  'Kosovo': [42.6, 20.9], 'Kuwait': [29.3, 47.5], 'Kyrgyzstan': [41.2, 74.8],
  'Laos': [19.9, 102.5], 'Latvia': [56.9, 24.1], 'Lebanon': [33.9, 35.9],
  'Libya': [26.3, 17.2], 'Lithuania': [55.2, 23.9], 'Luxembourg': [49.8, 6.1],
  'Macedonia': [41.5, 21.7], 'North Macedonia': [41.5, 21.7],
  'Madagascar': [-18.8, 46.9], 'Malawi': [-13.3, 34.3], 'Malaysia': [4.2, 101.9],
  'Mali': [17.6, -4.0], 'Mexico': [23.6, -102.6], 'Moldova': [47.4, 28.4],
  'Mongolia': [46.9, 103.8], 'Montenegro': [42.7, 19.4], 'Morocco': [31.8, -7.1],
  'Mozambique': [-18.7, 35.5], 'Myanmar': [21.9, 95.9], 'Nepal': [28.4, 84.1],
  'Netherlands': [52.1, 5.3], 'New Zealand': [-40.9, 174.9], 'Nicaragua': [12.9, -85.2],
  'Niger': [17.6, 8.1], 'Nigeria': [9.1, 8.7], 'North Korea': [40.3, 127.5],
  'Norway': [60.5, 8.5], 'Oman': [21.5, 55.9], 'Pakistan': [30.4, 69.3],
  'Palestine': [31.9, 35.2], 'Panama': [8.5, -80.8], 'Paraguay': [-23.4, -58.4],
  'Peru': [-9.2, -75.0], 'Philippines': [12.9, 121.8], 'Poland': [51.9, 19.1],
  'Portugal': [39.4, -8.2], 'Qatar': [25.4, 51.2], 'Romania': [45.9, 25.0],
  'Russia': [61.5, 105.3], 'Rwanda': [-1.9, 29.9], 'Saudi Arabia': [23.9, 45.1],
  'Senegal': [14.5, -14.5], 'Serbia': [44.0, 21.0], 'Singapore': [1.4, 103.8],
  'Slovakia': [48.7, 19.7], 'Slovenia': [46.2, 14.8], 'Somalia': [5.2, 46.2],
  'South Africa': [-30.6, 22.9], 'South Korea': [35.9, 127.8], 'South Sudan': [6.9, 31.3],
  'Spain': [40.5, -3.7], 'Sri Lanka': [7.9, 80.8], 'Sudan': [12.9, 30.2],
  'Sweden': [60.1, 18.6], 'Switzerland': [46.8, 8.2], 'Syria': [35.0, 38.0],
  'Taiwan': [23.7, 121.0], 'Tajikistan': [38.9, 71.3], 'Tanzania': [-6.4, 34.9],
  'Thailand': [15.9, 100.9], 'Tunisia': [34.0, 9.5], 'Turkey': [39.0, 35.2],
  'Turkmenistan': [39.0, 59.6], 'Uganda': [1.4, 32.3], 'Ukraine': [48.4, 31.2],
  'United Arab Emirates': [23.4, 53.8], 'United Kingdom': [55.4, -3.4],
  'United States': [37.1, -95.7], 'Uruguay': [-32.5, -55.8], 'Uzbekistan': [41.4, 64.6],
  'Vatican City': [41.9, 12.5], 'Venezuela': [6.4, -66.6], 'Vietnam': [14.1, 108.3],
  'Yemen': [15.6, 48.5], 'Zambia': [-13.1, 27.8], 'Zimbabwe': [-19.0, 29.2],
}

function getCountryCoords(name) {
  if (!name) return null
  if (COUNTRY_COORDS[name]) return COUNTRY_COORDS[name]
  const lower = name.toLowerCase()
  for (const [k, v] of Object.entries(COUNTRY_COORDS)) {
    if (k.toLowerCase() === lower) return v
  }
  for (const [k, v] of Object.entries(COUNTRY_COORDS)) {
    if (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)) return v
  }
  return null
}

const SEV_ORDER = { T1: 1, T2: 2, T3: 3, T4: 4, T5: 5 }

function getTimeAgo(ms) {
  if (!ms) return '—'
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}M AGO`
  if (sec < 86400) return `${Math.floor(sec / 3600)}H AGO`
  return `${Math.floor(sec / 86400)}D AGO`
}

export function timeAgo(ms) {
  return getTimeAgo(ms)
}

function parseSeenDate(s) {
  if (!s || typeof s !== 'string') return Date.now()
  try {
    const y = s.slice(0, 4)
    const mo = s.slice(4, 6)
    const d = s.slice(6, 8)
    const h = s.slice(9, 11) || '00'
    const mi = s.slice(11, 13) || '00'
    const sc = s.slice(13, 15) || '00'
    const ts = new Date(`${y}-${mo}-${d}T${h}:${mi}:${sc}Z`).getTime()
    return isNaN(ts) ? Date.now() : ts
  } catch {
    return Date.now()
  }
}

async function fetchJson(url, timeoutMs = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const urls = [url, PROXY_RAW + encodeURIComponent(url)]
  for (const u of urls) {
    try {
      const res = await fetch(u, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) continue
      const text = await res.text()
      if (!text || !text.trim()) continue
      try { return JSON.parse(text) } catch { continue }
    } catch {
      continue
    }
  }
  clearTimeout(timer)
  throw new Error('Could not fetch GDELT data')
}

function formatDomain(raw) {
  if (!raw) return 'GDELT'
  return raw.replace(/^www\./, '').split('.')[0].toUpperCase()
}

/* ── Translation (best-effort, via unofficial Google Translate endpoint) ── */

async function translateText(text) {
  const gtUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(PROXY_RAW + encodeURIComponent(gtUrl), {
    signal: AbortSignal.timeout(6000),
  })
  const data = await res.json()
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map(s => s[0]).filter(Boolean).join('') || text
  }
  return text
}

async function translateTitles(items) {
  const nonEng = items.filter(
    i => i.language && i.language.toLowerCase() !== 'english' && i.title,
  )
  if (nonEng.length === 0) return

  const CONCURRENCY = 12
  const DEADLINE = Date.now() + 15_000

  for (let i = 0; i < nonEng.length; i += CONCURRENCY) {
    if (Date.now() > DEADLINE) break
    const batch = nonEng.slice(i, i + CONCURRENCY)
    await Promise.allSettled(
      batch.map(async (item) => {
        try {
          const translated = await translateText(item.title)
          if (translated && translated !== item.title) {
            item.title = translated
          }
        } catch { /* keep original */ }
      }),
    )
  }
}

/* ── Article description fetching (on-hover, cached) ── */

const descCache = new Map()

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function extractFirstParagraph(html) {
  if (!html) return ''
  const bodyMatch = html.match(/<body[\s>]([\s\S]*)/i)
  const searchArea = bodyMatch ? bodyMatch[1] : html

  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let m
  while ((m = pRegex.exec(searchArea)) !== null) {
    const raw = m[1].replace(/<[^>]+>/g, '').trim()
    const text = decodeEntities(raw)
    if (text.length >= 40) return text
  }
  return ''
}

export async function fetchArticleDescription(url) {
  if (!url) return ''
  if (descCache.has(url)) return descCache.get(url)
  try {
    const res = await fetch(PROXY_RAW + encodeURIComponent(url), {
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    const desc = extractFirstParagraph(html)
    descCache.set(url, desc)
    return desc
  } catch {
    descCache.set(url, '')
    return ''
  }
}

/* ── Cached article fetching ── */

let _docPromise = null
let _docTime = 0
const DOC_CACHE_TTL = 4 * 60 * 1000

async function fetchDocArticles() {
  if (_docPromise && Date.now() - _docTime < DOC_CACHE_TTL) return _docPromise
  _docTime = Date.now()
  _docPromise = _fetchDocArticlesImpl()
  try { return await _docPromise } catch (e) { _docPromise = null; throw e }
}

async function _fetchDocArticlesImpl() {
  const fetches = DOC_QUERIES.map(({ q, n, span }) => {
    const url = `${GDELT_DOC}?query=${encodeURIComponent(q)}&mode=ArtList&format=json&maxrecords=${n}&sort=DateDesc&timespan=${span}`
    return fetchJson(url).catch(() => null)
  })

  const results = await Promise.all(fetches)
  const seen = new Set()
  const items = []

  for (const data of results) {
    if (!data || typeof data !== 'object') continue
    const articles = data.articles || []
    if (!Array.isArray(articles)) continue

    for (const art of articles) {
      const title = (art.title || '').trim()
      const link = art.url || ''
      if (!title || !link) continue

      const key = title.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)

      const published = parseSeenDate(art.seendate)
      const domain = art.domain || ''
      const text = title
      const id = `gdelt-${(domain + '-' + link).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 120)}`

      items.push({
        id,
        title,
        link,
        description: '',
        image: art.socialimage || null,
        sourceKey: formatDomain(domain),
        published,
        pubDate: art.seendate || '',
        timeAgo: getTimeAgo(published),
        language: art.language || '',
        sourcecountry: art.sourcecountry || '',
        category: getCategory(text),
        severity: getSeverity(text),
        severityLabel: SEVERITY_DISPLAY[getSeverity(text)] || 'S2',
      })
    }
  }

  items.sort((a, b) => b.published - a.published)

  try { await translateTitles(items) } catch { /* best-effort */ }

  return items
}

/**
 * Fetch articles from GDELT DOC 2.0 API (ArtList mode).
 * Returns items shaped for The Wall / Footer ticker.
 */
export async function fetchGdeltArticles() {
  return fetchDocArticles()
}

/**
 * Fetch DOC API articles and group into map clusters.
 * First tries to extract a city/region from each headline for precise placement;
 * falls back to sourcecountry centroid when no city is detected.
 * Returns: { id, lat, lng, name, count, maxSeverity, category, articles[] }[]
 */
export async function fetchGdeltGeoClusters() {
  const items = await fetchDocArticles()

  const byLocation = {}
  for (const item of items) {
    const city = extractLocation(item.title)
    let locKey, locName, lat, lng

    if (city) {
      locKey = `city::${city.name}`
      locName = city.name
      lat = city.lat
      lng = city.lng
    } else {
      const country = item.sourcecountry || ''
      if (!country) continue
      const coords = getCountryCoords(country)
      if (!coords) continue
      locKey = `country::${country}`
      locName = country
      lat = coords[0]
      lng = coords[1]
    }

    if (!byLocation[locKey]) {
      byLocation[locKey] = { name: locName, lat, lng, articles: [] }
    }
    byLocation[locKey].articles.push(item)
  }

  const clusters = []
  let idx = 0
  for (const [key, group] of Object.entries(byLocation)) {
    const { name, lat, lng, articles } = group
    let maxSev = 'T1'
    const catTally = {}

    for (const art of articles) {
      if ((SEV_ORDER[art.severity] || 0) > (SEV_ORDER[maxSev] || 0)) maxSev = art.severity
      catTally[art.category] = (catTally[art.category] || 0) + 1
    }

    const topCategory = Object.entries(catTally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Political'

    clusters.push({
      id: `cluster-${idx++}-${key.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 60)}`,
      lat,
      lng,
      name,
      count: articles.length,
      maxSeverity: maxSev,
      category: topCategory,
      severityLabel: SEVERITY_DISPLAY[maxSev] || 'S2',
      articles,
    })
  }

  clusters.sort((a, b) => b.count - a.count)
  return clusters
}

/**
 * Flatten clusters into individual wall items (backward compat for CountryFeedWindow, MapLegend).
 */
export function clustersToItems(clusters) {
  const all = []
  clusters.forEach((c) => {
    c.articles.forEach((art) => {
      all.push({ ...art, lat: c.lat, lng: c.lng, locationName: c.name })
    })
  })
  all.sort((a, b) => (b.published || 0) - (a.published || 0))
  return all
}
