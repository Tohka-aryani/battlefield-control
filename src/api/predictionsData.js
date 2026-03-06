/**
 * Prediction markets: Polymarket (Gamma API) and Kalshi (Trade API v2).
 * No API keys required for public market data.
 * In dev we use Vite proxy to avoid CORS; in production direct URLs are used.
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV
const POLYMARKET_GAMMA = isDev ? '' : 'https://gamma-api.polymarket.com'
const KALSHI_API = isDev ? '' : 'https://api.elections.kalshi.com/trade-api/v2'
const POLYMARKET_PROXY = '/api/polymarket'
const KALSHI_PROXY = '/api/kalshi'

const cache = new Map()
const CACHE_TTL = 2 * 60 * 1000 // 2 min

function getCached(key, ttl = CACHE_TTL) {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.at < ttl) return entry.data
  return null
}

function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, { data, at: Date.now(), ttl })
}

// —— Polymarket (Gamma API) ——

/** Active events with markets and outcome prices (implied probabilities). */
export async function fetchPolymarketEvents(limit = 20) {
  const key = `polymarket:events:${limit}`
  const cached = getCached(key)
  if (cached) return cached
  try {
    const url = isDev
      ? `${POLYMARKET_PROXY}/events?active=true&closed=false&limit=${limit}`
      : `${POLYMARKET_GAMMA}/events?active=true&closed=false&limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(res.statusText)
    const data = await res.json()
    const events = (Array.isArray(data) ? data : []).map((e) => {
      const markets = e.markets || []
      const openFirst = [...markets].sort((a) => (a.closed ? 1 : -1))
      const outcomes = openFirst.map((m) => {
        let prob = 0.5
        if (m.outcomePrices) {
          try {
            const prices = JSON.parse(m.outcomePrices)
            const outs = m.outcomes ? JSON.parse(m.outcomes) : []
            const yesIdx = outs.indexOf('Yes')
            prob = yesIdx >= 0 && prices[yesIdx] != null ? parseFloat(prices[yesIdx]) : parseFloat(prices[0]) || 0.5
          } catch (_) {}
        }
        const label = m.question || (m.outcomes ? JSON.parse(m.outcomes)[0] : 'Yes') || 'Yes'
        const vol = m.volumeNum != null ? Number(m.volumeNum) : m.volume != null ? Number(m.volume) : 0
        return { label, prob: Math.round(prob * 100), volume: vol }
      }).filter((o) => o.prob >= 0 && o.prob <= 100)
      const vol = e.volume != null ? Number(e.volume) : 0
      const endDate = e.endDate || (markets[0] && markets[0].endDateIso) || ''
      const description = typeof e.description === 'string' ? e.description.trim() : ''
      return {
        id: e.id,
        source: 'POLYMARKET',
        title: e.title || (markets[0] && markets[0].question) || 'Unknown',
        slug: e.slug,
        url: `https://polymarket.com/event/${e.slug || e.id}`,
        volume: vol,
        endDate,
        description,
        outcomes: outcomes.length ? outcomes : [{ label: 'Yes', prob: 50, volume: vol }],
      }
    })
    setCache(key, events)
    return events
  } catch (e) {
    console.warn('fetchPolymarketEvents', e)
    return []
  }
}

// —— Kalshi ——

/** Open markets with yes price (cents) and volume. */
export async function fetchKalshiMarkets(limit = 25) {
  const key = `kalshi:markets:${limit}`
  const cached = getCached(key)
  if (cached) return cached
  try {
    const url = isDev
      ? `${KALSHI_PROXY}/markets?status=open&limit=${limit}`
      : `${KALSHI_API}/markets?status=open&limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(res.statusText)
    const data = await res.json()
    const markets = (data.markets || []).map((m) => {
      const yesPrice =
        m.yes_price != null
          ? Number(m.yes_price)
          : m.yes_ask != null
            ? Number(m.yes_ask)
            : m.yes_bid != null
              ? Number(m.yes_bid)
              : m.last_price != null
                ? Number(m.last_price)
                : 50
      const closeTime = m.close_time || m.expiration_time || ''
      const endDate = closeTime ? new Date(closeTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }) : ''
      return {
        id: m.ticker,
        source: 'KALSHI',
        title: m.title || m.ticker,
        url: `https://kalshi.com/markets/${m.ticker}`,
        volume: m.volume != null ? Number(m.volume) : 0,
        endDate,
        outcomes: [{ label: 'Yes', prob: Math.min(100, Math.max(0, yesPrice)), volume: m.volume != null ? Number(m.volume) : 0 }],
      }
    })
    setCache(key, markets)
    return markets
  } catch (e) {
    console.warn('fetchKalshiMarkets', e)
    return []
  }
}
