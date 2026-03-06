/**
 * Wall map: categories, severity (T1–T5), and default locations per source.
 * Used to enrich Wall RSS items for map markers and the detail popup.
 */

export const WALL_CATEGORIES = [
  'Conflict',
  'Political',
  'Humanitarian',
  'Economic',
  'Disaster',
]

export const SEVERITY_LABELS = { T1: 'T1', T2: 'T2', T3: 'T3', T4: 'T4', T5: 'T5' }
export const SEVERITY_DISPLAY = { T1: 'S1', T2: 'S2', T3: 'S3', T4: 'S4', T5: 'S5' }

/** Hex colors for severity (map pins and legend). */
export const SEVERITY_COLORS = {
  T1: '#22c55e',
  T2: '#84cc16',
  T3: '#ea580c',
  T4: '#c2410c',
  T5: '#dc2626',
}

const CATEGORY_KEYWORDS = {
  Conflict: /\b(war|attack|military|invasion|strike|conflict|violence|troops|nuclear|missile|combat|ceasefire)\b/i,
  Political: /\b(election|vote|minister|president|parliament|congress|government|policy|sanctions|diplomat)\b/i,
  Humanitarian: /\b(refugee|aid|crisis|famine|displaced|humanitarian|relief|migration|evacuation)\b/i,
  Economic: /\b(market|economy|inflation|recession|trade|stock|bank|debt|gdp|employment)\b/i,
  Disaster: /\b(flood|earthquake|fire|hurricane|tsunami|disaster|emergency|evacuation|rescue)\b/i,
}

const SEVERITY_KEYWORDS = {
  T5: /\b(nuclear|war|invasion|mass casualty|catastrophe|imminent)\b/i,
  T4: /\b(attack|strike|military|disaster|emergency|critical)\b/i,
  T3: /\b(conflict|violence|crisis|evacuation|protest)\b/i,
  T2: /\b(tension|arrest|incident|outage)\b/i,
}

/** Default coordinates and location name per RSS source (for estimated location when no geocode). */
export const SOURCE_DEFAULT_LOCATION = {
  'BBC World': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'Guardian World': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'AP News': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'Reuters World': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'Reuters US': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'CNN World': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'NPR News': { lat: 38.9, lng: -77.0, name: 'Washington, United States' },
  'Politico': { lat: 38.9, lng: -77.0, name: 'Washington, United States' },
  'Axios': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'Fox News': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'NBC News': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'CBS News': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'France 24': { lat: 48.85, lng: 2.35, name: 'Paris, France' },
  'EuroNews': { lat: 45.75, lng: 4.85, name: 'Lyon, France' },
  'Le Monde': { lat: 48.85, lng: 2.35, name: 'Paris, France' },
  'DW News': { lat: 50.73, lng: 7.09, name: 'Bonn, Germany' },
  'El País': { lat: 40.42, lng: -3.70, name: 'Madrid, Spain' },
  'El Mundo': { lat: 40.42, lng: -3.70, name: 'Madrid, Spain' },
  'BBC Mundo': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'Tagesschau': { lat: 53.55, lng: 9.99, name: 'Hamburg, Germany' },
  'Bild': { lat: 52.52, lng: 13.40, name: 'Berlin, Germany' },
  'Der Spiegel': { lat: 53.55, lng: 9.99, name: 'Hamburg, Germany' },
  'Die Zeit': { lat: 53.55, lng: 9.99, name: 'Hamburg, Germany' },
  'ANSA': { lat: 41.90, lng: 12.50, name: 'Rome, Italy' },
  'Corriere della Sera': { lat: 45.46, lng: 9.19, name: 'Milan, Italy' },
  'Repubblica': { lat: 41.90, lng: 12.50, name: 'Rome, Italy' },
  'NOS Nieuws': { lat: 52.37, lng: 4.89, name: 'Amsterdam, Netherlands' },
  'NRC': { lat: 51.92, lng: 4.48, name: 'Rotterdam, Netherlands' },
  'SVT Nyheter': { lat: 59.33, lng: 18.07, name: 'Stockholm, Sweden' },
  'Dagens Nyheter': { lat: 59.33, lng: 18.07, name: 'Stockholm, Sweden' },
  'Svenska Dagbladet': { lat: 59.33, lng: 18.07, name: 'Stockholm, Sweden' },
  'BBC Turkce': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'DW Turkish': { lat: 50.73, lng: 7.09, name: 'Bonn, Germany' },
  'Hurriyet': { lat: 41.01, lng: 28.95, name: 'Istanbul, Turkey' },
  'TVN24': { lat: 52.23, lng: 21.01, name: 'Warsaw, Poland' },
  'Polsat News': { lat: 52.23, lng: 21.01, name: 'Warsaw, Poland' },
  'Rzeczpospolita': { lat: 52.23, lng: 21.01, name: 'Warsaw, Poland' },
  'BBC Middle East': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'Al Jazeera': { lat: 25.29, lng: 51.53, name: 'Doha, Qatar' },
  'The Verge': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'The Verge AI': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'Federal Reserve': { lat: 38.89, lng: -77.02, name: 'Washington, United States' },
  'SEC': { lat: 38.89, lng: -77.02, name: 'Washington, United States' },
  'UN News': { lat: 40.75, lng: -73.97, name: 'New York, United Nations' },
  'CISA': { lat: 38.89, lng: -77.02, name: 'Washington, United States' },
  'Foreign Affairs': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'WHO': { lat: 46.23, lng: 6.14, name: 'Geneva, Switzerland' },
  'BBC Africa': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'BBC Afrique': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'BBC Latin America': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'Folha de S.Paulo': { lat: -23.55, lng: -46.63, name: 'São Paulo, Brazil' },
  'Brasil Paralelo': { lat: -30.03, lng: -51.22, name: 'Porto Alegre, Brazil' },
  'El Tiempo': { lat: 4.71, lng: -74.07, name: 'Bogotá, Colombia' },
  'BBC Asia': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'The Hindu': { lat: 13.08, lng: 80.27, name: 'Chennai, India' },
  'NDTV': { lat: 28.61, lng: 77.23, name: 'New Delhi, India' },
  'VnExpress': { lat: 21.03, lng: 105.85, name: 'Hanoi, Vietnam' },
  'ABC News Australia': { lat: -33.87, lng: 151.21, name: 'Sydney, Australia' },
  'ZDNet': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'TechMeme': { lat: 37.77, lng: -122.42, name: 'San Francisco, United States' },
  'Engadget': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'Fast Company': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'The Hacker News': { lat: 37.77, lng: -122.42, name: 'San Francisco, United States' },
  'Dark Reading': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'Politico Tech': { lat: 38.9, lng: -77.0, name: 'Washington, United States' },
  'Seeking Alpha': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'GitHub Trending': { lat: 37.77, lng: -122.42, name: 'San Francisco, United States' },
  'Good Good Good': { lat: 40.7, lng: -74.0, name: 'United States' },
  'ScienceDaily': { lat: 38.99, lng: -76.94, name: 'Maryland, United States' },
  'Live Science': { lat: 40.7, lng: -74.0, name: 'New York, United States' },
  'UK MOD': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'Ransomware.live': { lat: 52.37, lng: 4.89, name: 'Netherlands' },
  // Malaysia & regional
  'Malay Mail Malaysia': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Borneo Post': { lat: 1.55, lng: 110.34, name: 'Kuching, Malaysia' },
  'Borneo Post RSS2': { lat: 1.55, lng: 110.34, name: 'Kuching, Malaysia' },
  'Google Alerts': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'The Sun Daily': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'The Star News': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'The Star Nation': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Astro Awani National': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Astro Awani International': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Astro Awani': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Malaysia Chronicle': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Sarawak Report': { lat: 1.55, lng: 110.34, name: 'Sarawak, Malaysia' },
  'The Malaysian Reserve': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Media Umno Libaran': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'SAYS': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Bernama': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Bernama English': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Harian Metro': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Malaysia Today': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Free Malaysia Today': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Malaysia News': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Google News Malaysia Politics': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Google News Malaysia': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Nikkei Asia': { lat: 35.68, lng: 139.69, name: 'Tokyo, Japan' },
  'New Mandala': { lat: -6.21, lng: 106.85, name: 'Jakarta, Indonesia' },
  'Asia Sentinel': { lat: 22.28, lng: 114.16, name: 'Hong Kong' },
  'SCMP': { lat: 22.28, lng: 114.16, name: 'Hong Kong' },
  'Channel News Asia': { lat: 1.29, lng: 103.85, name: 'Singapore' },
  'Splash 247': { lat: 1.29, lng: 103.85, name: 'Singapore' },
  'Asian Military Review': { lat: 3.14, lng: 101.69, name: 'Asia' },
  'The Asia Live': { lat: 22.28, lng: 114.16, name: 'Hong Kong' },
  'Aliran': { lat: 5.42, lng: 100.34, name: 'Penang, Malaysia' },
  'Cilisos': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Focus Malaysia': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Malay Mail Online': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Guardian Malaysia': { lat: 51.5, lng: -0.1, name: 'London, United Kingdom' },
  'Malaysia Now': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'NYT Malaysia': { lat: 40.71, lng: -74.0, name: 'New York, United States' },
  'Soya Cincau': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'The Coverage': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'The Vibes': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'The Rakyat Post': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Malaysian Wireless': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Zaid': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Mariam Mokhtar': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'The Edge Markets': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'The Malaysian Insight': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Haris Ibrahim': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Anil Netto': { lat: 5.42, lng: 100.34, name: 'Penang, Malaysia' },
  'Malaysiakini': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  "Syed's Outside The Box": { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Rocky Bru': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'TechCrunch': { lat: 37.77, lng: -122.42, name: 'San Francisco, United States' },
  'Dari Sungai Derhaka': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Anwar Ibrahim Blog': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'BERSIH': { lat: 3.14, lng: 101.69, name: 'Kuala Lumpur, Malaysia' },
  'Chedet': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Lim Kit Siang': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Zunar': { lat: 3.14, lng: 101.69, name: 'Malaysia' },
  'Antara News': { lat: -6.21, lng: 106.85, name: 'Jakarta, Indonesia' },
  'Krebs on Security': { lat: 38.9, lng: -77.0, name: 'Washington, United States' },
}

const DEFAULT_LOC = { lat: 20, lng: 0, name: 'Unknown' }

export function getCategory(text) {
  if (!text || typeof text !== 'string') return 'Political'
  const t = text.slice(0, 800)
  for (const [cat, re] of Object.entries(CATEGORY_KEYWORDS)) {
    if (re.test(t)) return cat
  }
  return 'Political'
}

export function getSeverity(text) {
  if (!text || typeof text !== 'string') return 'T2'
  const t = text.slice(0, 800)
  if (SEVERITY_KEYWORDS.T5.test(t)) return 'T5'
  if (SEVERITY_KEYWORDS.T4.test(t)) return 'T4'
  if (SEVERITY_KEYWORDS.T3.test(t)) return 'T3'
  if (SEVERITY_KEYWORDS.T2.test(t)) return 'T2'
  return 'T1'
}

export function getDefaultLocation(sourceKey) {
  return SOURCE_DEFAULT_LOCATION[sourceKey] || DEFAULT_LOC
}
