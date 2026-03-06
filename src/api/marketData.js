/**
 * Market data: Finnhub (quotes, forex) + Alpha Vantage (sectors, movers).
 * - Finnhub: https://finnhub.io/register — set VITE_FINNHUB_API_KEY in .env
 *   Used for: single quote, multiple quotes (parallel), forex rates.
 * - Alpha Vantage: https://www.alphavantage.co/support/#api-key — set VITE_ALPHAVANTAGE_API_KEY
 *   Used for: sector performance, top gainers/losers.
 */

const AV_KEY = (import.meta.env.VITE_ALPHAVANTAGE_API_KEY || '').trim()
const FH_KEY = (import.meta.env.VITE_FINNHUB_API_KEY || '').trim()
const AV_BASE = 'https://www.alphavantage.co/query'
const FH_BASE = 'https://finnhub.io/api/v1'

const cache = new Map()
const CACHE_TTL = 60 * 1000
const CACHE_TTL_LONG = 5 * 60 * 1000

function getCached(key, ttl = CACHE_TTL) {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.at < ttl) return entry.data
  return null
}

function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, { data, at: Date.now(), ttl })
}

export function hasApiKey() {
  return Boolean(AV_KEY || FH_KEY)
}

export function hasAlphaVantageKey() {
  return Boolean(AV_KEY)
}

export function hasFinnhubKey() {
  return Boolean(FH_KEY)
}

// —— Alpha Vantage (sectors, movers) ——

function avUrl(params) {
  const u = new URL(AV_BASE)
  Object.entries({ ...params, apikey: AV_KEY }).forEach(([k, v]) => u.searchParams.set(k, v))
  return u.toString()
}

/** Sector performance (Alpha Vantage only). */
export async function fetchSectorPerformance() {
  const key = 'sector'
  const cached = getCached(key, CACHE_TTL_LONG)
  if (cached) return cached
  if (!AV_KEY) return null
  try {
    const res = await fetch(avUrl({ function: 'SECTOR' }))
    const data = await res.json()
    const errMsg = data['Error Message'] || data['Note']
    if (errMsg) throw new Error(errMsg)
    const meta = data['Meta Data']
    const rankA = data['Rank A: Real-Time Performance'] || data['Rank B: 1 Day Performance'] || {}
    if (meta && Object.keys(rankA).length) {
      const sectors = Object.entries(rankA).map(([name, pct]) => ({
        name: String(name).replace(/^\d+\.\s*/, '').trim(),
        change: parseFloat(String(pct).replace('%', '')) || 0,
      }))
      setCache(key, { sectors, lastUpdate: meta['Last Refreshed'] }, CACHE_TTL_LONG)
      return { sectors, lastUpdate: meta['Last Refreshed'] }
    }
    return null
  } catch (e) {
    console.error('fetchSectorPerformance', e)
    return null
  }
}

/** Top gainers and losers (Alpha Vantage only). */
export async function fetchTopMovers() {
  const key = 'movers'
  const cached = getCached(key, CACHE_TTL_LONG)
  if (cached) return cached
  if (!AV_KEY) return null
  try {
    const res = await fetch(avUrl({ function: 'TOP_GAINERS_LOSERS' }))
    const data = await res.json()
    const errMsg = data['Error Message'] || data['Note']
    if (errMsg) throw new Error(errMsg)
    const metadata = data.metadata
    const gainers = (data.top_gainers || []).slice(0, 10).map((g) => ({
      symbol: g.ticker || g.symbol,
      name: g.name || g.ticker,
      price: parseFloat(g.price) || 0,
      change: parseFloat(String(g.change_percentage || 0).replace('%', '')) || 0,
    }))
    const losers = (data.top_losers || []).slice(0, 10).map((l) => ({
      symbol: l.ticker || l.symbol,
      name: l.name || l.ticker,
      price: parseFloat(l.price) || 0,
      change: parseFloat(String(l.change_percentage || 0).replace('%', '')) || 0,
    }))
    const lastUpdate = metadata?.last_updated || ''
    setCache(key, { gainers, losers, lastUpdate }, CACHE_TTL_LONG)
    return { gainers, losers, lastUpdate }
  } catch (e) {
    console.error('fetchTopMovers', e)
    return null
  }
}

// —— Quote: Finnhub first (parallel-friendly), else Alpha Vantage ——

/** Single quote. Uses Finnhub if key present, else Alpha Vantage. */
export async function fetchQuote(symbol) {
  const key = `quote:${symbol}`
  const cached = getCached(key)
  if (cached) return cached
  if (FH_KEY) {
    try {
      const res = await fetch(`${FH_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${FH_KEY}`)
      const data = await res.json()
      const c = data.c
      if (c != null && typeof c === 'number') {
        const d = typeof data.d === 'number' ? data.d : 0
        const dp = typeof data.dp === 'number' ? data.dp : (data.pc ? ((c - data.pc) / data.pc) * 100 : 0)
        const result = {
          symbol: String(symbol).toUpperCase(),
          price: c,
          change: d,
          changePercent: dp,
        }
        setCache(key, result)
        return result
      }
    } catch (e) {
      console.warn('fetchQuote Finnhub', symbol, e)
    }
  }
  if (AV_KEY) {
    try {
      const res = await fetch(avUrl({ function: 'GLOBAL_QUOTE', symbol }))
      const data = await res.json()
      const q = data['Global Quote']
      if (!q || !q['01. symbol']) return null
      const result = {
        symbol: q['01. symbol'],
        price: parseFloat(q['05. price']) || 0,
        change: parseFloat(q['09. change']) || 0,
        changePercent: parseFloat(q['10. change percent']?.replace('%', '') || 0),
      }
      setCache(key, result)
      return result
    } catch (e) {
      console.error('fetchQuote', e)
      return null
    }
  }
  return null
}

/** Multiple quotes. With Finnhub: parallel. With Alpha Vantage only: sequential (5/min limit). */
export async function fetchQuotes(symbols, onProgress) {
  if (FH_KEY) {
    const results = await Promise.all(symbols.map((s) => fetchQuote(s)))
    const out = results.filter(Boolean)
    if (onProgress) onProgress(symbols.length, symbols.length)
    return out
  }
  if (!AV_KEY) return []
  const results = []
  for (let i = 0; i < symbols.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 12500))
    const q = await fetchQuote(symbols[i])
    if (q) results.push(q)
    if (onProgress) onProgress(i + 1, symbols.length)
  }
  return results
}

// —— Forex: Finnhub first, else Alpha Vantage ——

/** Forex rate. Finnhub /forex/rates?base=X returns { base, quote: { USD: 1.2, ... } }. */
export async function fetchForexRate(from, to) {
  const key = `forex:${from}:${to}`
  const cached = getCached(key)
  if (cached) return cached
  if (FH_KEY) {
    try {
      const res = await fetch(`${FH_BASE}/forex/rates?base=${encodeURIComponent(from)}&token=${FH_KEY}`)
      const data = await res.json()
      const quote = data.quote || data.rates || {}
      if (typeof quote[to] === 'number') {
        const rate = from.toUpperCase() === to.toUpperCase() ? 1 : quote[to]
        const result = {
          pair: `${from}/${to}`,
          rate,
          changePercent: 0,
        }
        setCache(key, result)
        return result
      }
    } catch (e) {
      console.warn('fetchForexRate Finnhub', from, to, e)
    }
  }
  if (AV_KEY) {
    try {
      const res = await fetch(
        avUrl({
          function: 'CURRENCY_EXCHANGE_RATE',
          from_currency: from,
          to_currency: to,
        })
      )
      const data = await res.json()
      const rate = data['Realtime Currency Exchange Rate']
      if (!rate) return null
      const result = {
        pair: `${from}/${to}`,
        rate: parseFloat(rate['5. Exchange Rate']) || 0,
        changePercent: 0,
      }
      setCache(key, result)
      return result
    } catch (e) {
      console.error('fetchForexRate', e)
      return null
    }
  }
  return null
}

/** Quote for chart header: stock quote or forex rate. Symbol can be "AAPL" or "USDJPY=X". */
export async function getQuoteForChart(symbol) {
  if (!symbol || typeof symbol !== 'string') return null
  const s = symbol.trim().toUpperCase().replace(/=X$/i, '')
  if (s.length === 6 && /^[A-Z]{6}$/.test(s)) {
    const from = s.slice(0, 3)
    const to = s.slice(3, 6)
    const r = await fetchForexRate(from, to)
    if (!r) return null
    return {
      symbol: `${s}=X`,
      pair: r.pair,
      price: r.rate,
      change: 0,
      changePercent: r.changePercent ?? 0,
    }
  }
  const q = await fetchQuote(symbol)
  if (!q) return null
  return { ...q, pair: q.symbol }
}
