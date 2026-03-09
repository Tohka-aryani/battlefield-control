/**
 * TradingView: symbol format, symbol page URL, and widget scripts.
 * No API key required — TradingView widgets use their own data.
 */

const NYSE_SYMBOLS = new Set([
  'CRM', 'ORCL', 'XOM', 'CVX', 'COP', 'SLB', 'EOG',
  'UNH', 'JNJ', 'LLY', 'PFE', 'ABBV', 'PG', 'KO', 'WMT',
  'NEE', 'SO', 'DUK', 'D', 'DIS', 'VZ', 'UPS', 'CAT', 'DE', 'GE',
  'AMT', 'PLD', 'CCI', 'SPG', 'LIN', 'APD', 'ECL', 'SHW', 'NEM',
  'HD', 'MCD', 'NKE', 'JPM', 'V', 'MA', 'BAC', 'GS',
  'LMT', 'NOC', 'RTX', 'GD', 'BA', 'LHX', 'TXT', 'HII',
  'LDOS', 'CACI', 'BAH', 'SAIC', 'FNV', 'WPM', 'KGC', 'AG', 'HL',
  'AEM',
])

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
  if (NYSE_SYMBOLS.has(s)) return `NYSE:${s}`
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
  AAPL: 'Apple Inc', MSFT: 'Microsoft Corporation', GOOGL: 'Alphabet Inc', GOOG: 'Alphabet Inc',
  META: 'Meta Platforms Inc', AMZN: 'Amazon.com Inc', NVDA: 'NVIDIA Corporation',
  AVGO: 'Broadcom Inc', CRM: 'Salesforce Inc', ORCL: 'Oracle Corporation',
  TSLA: 'Tesla Inc', NFLX: 'Netflix Inc', DIS: 'Walt Disney Co',
  JPM: 'JPMorgan Chase', V: 'Visa Inc', MA: 'Mastercard Inc',
  BAC: 'Bank of America', GS: 'Goldman Sachs',
  XOM: 'Exxon Mobil', CVX: 'Chevron Corp', COP: 'ConocoPhillips',
  SLB: 'Schlumberger NV', UNH: 'UnitedHealth Group', JNJ: 'Johnson & Johnson',
  LLY: 'Eli Lilly & Co', PFE: 'Pfizer Inc', ABBV: 'AbbVie Inc',
  PG: 'Procter & Gamble', KO: 'Coca-Cola Co', PEP: 'PepsiCo Inc',
  COST: 'Costco Wholesale', WMT: 'Walmart Inc',
  LMT: 'Lockheed Martin', NOC: 'Northrop Grumman', RTX: 'RTX Corporation',
  GD: 'General Dynamics', BA: 'Boeing Co', LHX: 'L3Harris Technologies',
  PLTR: 'Palantir Technologies', HD: 'Home Depot Inc', MCD: "McDonald's Corp",
  NKE: 'Nike Inc', HON: 'Honeywell International', CAT: 'Caterpillar Inc',
  GE: 'GE Aerospace', SHOP: 'Shopify Inc',
}
export function getSymbolDisplayName(symbol) {
  const s = (symbol || '').trim().toUpperCase().split(':').pop()
  return SYMBOL_DISPLAY_NAMES[s] || null
}

export const TRADINGVIEW_WIDGET_SCRIPT = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
export const TRADINGVIEW_SCREENER_SCRIPT = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js'
export const TRADINGVIEW_HOTLISTS_SCRIPT = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js'
export const TRADINGVIEW_MARKET_QUOTES_SCRIPT = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js'
export const TRADINGVIEW_FOREX_CROSS_RATES_SCRIPT = 'https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js'
