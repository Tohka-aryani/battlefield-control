/**
 * TradingView: symbol format, symbol page URL, and widget scripts.
 * No API key required — TradingView widgets use their own data.
 */

/** Convert symbol (e.g. AAPL, GC=F) to TradingView symbol (e.g. NASDAQ:AAPL, TVC:GOLD) */
export function toTradingViewSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') return 'NASDAQ:AAPL'
  const s = symbol.trim().toUpperCase()
  if (!s) return 'NASDAQ:AAPL'
  if (s.includes(':')) return s
  switch (s) {
    case 'GC=F': return 'TVC:GOLD'
    case 'SI=F': return 'TVC:SILVER'
    case 'PL=F': return 'TVC:PLATINUM'
    case 'PA=F': return 'TVC:PALLADIUM'
    case 'CL=F': return 'TVC:CRUDE_OIL'
    default: break
  }
  if (s.endsWith('=F')) return `TVC:${s.slice(0, -2)}`
  return `NASDAQ:${s}`
}

/** TradingView symbol page URL (Chart, News, Statistics, About). Example: https://www.tradingview.com/symbols/NASDAQ-SHOP/ */
export function getTradingViewSymbolPageUrl(symbol) {
  const tv = toTradingViewSymbol(symbol)
  const path = tv.replace(':', '-')
  return `https://www.tradingview.com/symbols/${path}/`
}

/** Exchange label for header (e.g. "NYSE EST") */
export function getTradingViewExchangeLabel(symbol) {
  const tv = toTradingViewSymbol(symbol)
  const [exchange] = tv.split(':')
  if (exchange === 'NASDAQ') return 'NASDAQ EST'
  if (exchange === 'NYSE') return 'NYSE EST'
  return `${exchange} EST`
}

/** Optional display name for symbol header (TradingView has full name on symbol page) */
export const SYMBOL_DISPLAY_NAMES = {
  SLB: 'SLB Limited', AAPL: 'Apple Inc', MSFT: 'Microsoft Corporation', SHOP: 'Shopify Inc',
  GOOGL: 'Alphabet Inc', META: 'Meta Platforms Inc', AMZN: 'Amazon.com Inc', NVDA: 'NVIDIA Corporation',
}
export function getSymbolDisplayName(symbol) {
  const s = (symbol || '').trim().toUpperCase().split(':').pop()
  return SYMBOL_DISPLAY_NAMES[s] || null
}

export const TRADINGVIEW_WIDGET_SCRIPT = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
export const TRADINGVIEW_SCREENER_SCRIPT = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
