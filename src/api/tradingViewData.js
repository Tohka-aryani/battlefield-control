/**
 * TradingView scanner API — fetch real-time stock quotes without any API key.
 * Uses the same endpoint TradingView's screener widget calls internally.
 */

const SCANNER_URL = 'https://scanner.tradingview.com/america/scan'
const CACHE_TTL = 60_000
let _cache = null
let _cacheAt = 0

/**
 * Fetch quotes for TradingView-formatted symbols (e.g. ["NASDAQ:AAPL", "NYSE:XOM"]).
 * Returns Map<ticker, { price, change, changePercent }> or null on total failure.
 */
export async function fetchTvScannerQuotes(tvSymbols) {
  if (!tvSymbols?.length) return null
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache

  const body = JSON.stringify({
    columns: ['close', 'change', 'change_abs', 'description'],
    symbols: { tickers: tvSymbols, query: { types: [] } },
  })

  const attempts = [
    () => fetch(SCANNER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }),
    () => fetch(`https://corsproxy.io/?${encodeURIComponent(SCANNER_URL)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }),
  ]

  for (const attempt of attempts) {
    try {
      const res = await attempt()
      if (!res.ok) continue
      const data = await res.json()
      if (!data?.data?.length) continue

      const map = new Map()
      for (const item of data.data) {
        const ticker = item.s.includes(':') ? item.s.split(':')[1] : item.s
        const [close, changePct, changeAbs] = item.d
        if (typeof close === 'number') {
          map.set(ticker, {
            price: close,
            change: changeAbs,
            changePercent: changePct,
          })
        }
      }
      _cache = map
      _cacheAt = Date.now()
      return map
    } catch {
      continue
    }
  }
  return null
}
