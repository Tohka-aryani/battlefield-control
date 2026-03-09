/** GICS market sectors with representative stocks for the SECTORS tab */
export const MARKET_SECTORS = [
  {
    id: 'technology', name: 'Technology',
    stocks: [
      { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
      { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ' },
      { symbol: 'CRM', name: 'Salesforce, Inc.', exchange: 'NYSE' },
      { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE' },
    ],
  },
  {
    id: 'energy', name: 'Energy',
    stocks: [
      { symbol: 'XOM', name: 'Exxon Mobil Corp.', exchange: 'NYSE' },
      { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE' },
      { symbol: 'COP', name: 'ConocoPhillips', exchange: 'NYSE' },
      { symbol: 'SLB', name: 'Schlumberger N.V.', exchange: 'NYSE' },
      { symbol: 'EOG', name: 'EOG Resources', exchange: 'NYSE' },
    ],
  },
  {
    id: 'healthcare', name: 'Healthcare',
    stocks: [
      { symbol: 'UNH', name: 'UnitedHealth Group', exchange: 'NYSE' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
      { symbol: 'LLY', name: 'Eli Lilly & Co.', exchange: 'NYSE' },
      { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE' },
      { symbol: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'consumer-staples', name: 'Consumer Staples',
    stocks: [
      { symbol: 'PG', name: 'Procter & Gamble', exchange: 'NYSE' },
      { symbol: 'KO', name: 'Coca-Cola Company', exchange: 'NYSE' },
      { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ' },
      { symbol: 'COST', name: 'Costco Wholesale', exchange: 'NASDAQ' },
      { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'utilities', name: 'Utilities',
    stocks: [
      { symbol: 'NEE', name: 'NextEra Energy', exchange: 'NYSE' },
      { symbol: 'SO', name: 'Southern Company', exchange: 'NYSE' },
      { symbol: 'DUK', name: 'Duke Energy Corp.', exchange: 'NYSE' },
      { symbol: 'D', name: 'Dominion Energy', exchange: 'NYSE' },
    ],
  },
  {
    id: 'communication', name: 'Communication Services',
    stocks: [
      { symbol: 'GOOG', name: 'Alphabet Inc. C', exchange: 'NASDAQ' },
      { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
      { symbol: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE' },
      { symbol: 'TMUS', name: 'T-Mobile US', exchange: 'NASDAQ' },
      { symbol: 'VZ', name: 'Verizon Communications', exchange: 'NYSE' },
    ],
  },
  {
    id: 'industrials', name: 'Industrials',
    stocks: [
      { symbol: 'HON', name: 'Honeywell International', exchange: 'NASDAQ' },
      { symbol: 'UPS', name: 'United Parcel Service', exchange: 'NYSE' },
      { symbol: 'CAT', name: 'Caterpillar Inc.', exchange: 'NYSE' },
      { symbol: 'DE', name: 'Deere & Company', exchange: 'NYSE' },
      { symbol: 'GE', name: 'GE Aerospace', exchange: 'NYSE' },
    ],
  },
  {
    id: 'real-estate', name: 'Real Estate',
    stocks: [
      { symbol: 'AMT', name: 'American Tower Corp.', exchange: 'NYSE' },
      { symbol: 'PLD', name: 'Prologis Inc.', exchange: 'NYSE' },
      { symbol: 'CCI', name: 'Crown Castle Inc.', exchange: 'NYSE' },
      { symbol: 'EQIX', name: 'Equinix Inc.', exchange: 'NASDAQ' },
      { symbol: 'SPG', name: 'Simon Property Group', exchange: 'NYSE' },
    ],
  },
  {
    id: 'materials', name: 'Materials',
    stocks: [
      { symbol: 'LIN', name: 'Linde plc', exchange: 'NASDAQ' },
      { symbol: 'APD', name: 'Air Products & Chemicals', exchange: 'NYSE' },
      { symbol: 'ECL', name: 'Ecolab Inc.', exchange: 'NYSE' },
      { symbol: 'SHW', name: 'Sherwin-Williams Co.', exchange: 'NYSE' },
      { symbol: 'NEM', name: 'Newmont Corporation', exchange: 'NYSE' },
    ],
  },
  {
    id: 'consumer-discretionary', name: 'Consumer Discretionary',
    stocks: [
      { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
      { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE' },
      { symbol: 'MCD', name: "McDonald's Corp.", exchange: 'NYSE' },
      { symbol: 'NKE', name: 'Nike Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'financials', name: 'Financials',
    stocks: [
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
      { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
      { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE' },
      { symbol: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE' },
      { symbol: 'GS', name: 'Goldman Sachs Group', exchange: 'NYSE' },
    ],
  },
]

/** Defense / Aerospace tickers for DEFENSE tab */
export const DEFENSE_TICKERS = [
  'LMT', 'NOC', 'RTX', 'GD', 'BA', 'LHX', 'TXT', 'HII', 'LDOS', 'CACI',
  'BAH', 'SAIC', 'KTOS', 'MRCY', 'AVAV', 'PLTR',
]

/** Metals: commodity symbols (Yahoo style) + mining tickers */
export const METALS_COMMODITY_SYMBOLS = [
  'GC=F',  // Gold
  'SI=F',  // Silver
  'PL=F',  // Platinum
  'PA=F',  // Palladium
]
export const METALS_MINING_TICKERS = [
  'NEM', 'GOLD', 'AEM', 'FNV', 'WPM', 'RGLD', 'KGC', 'PAAS', 'AG', 'HL',
]

/** Forex pairs: Alpha Vantage from_currency/to_currency */
export const FOREX_MAJOR_PAIRS = [
  { from: 'USD', to: 'JPY', label: 'USD/JPY', symbol: 'USDJPY' },
  { from: 'EUR', to: 'USD', label: 'EUR/USD', symbol: 'EURUSD' },
  { from: 'GBP', to: 'USD', label: 'GBP/USD', symbol: 'GBPUSD' },
  { from: 'AUD', to: 'USD', label: 'AUD/USD', symbol: 'AUDUSD' },
  { from: 'USD', to: 'CHF', label: 'USD/CHF', symbol: 'USDCHF' },
  { from: 'USD', to: 'CAD', label: 'USD/CAD', symbol: 'USDCAD' },
  { from: 'NZD', to: 'USD', label: 'NZD/USD', symbol: 'NZDUSD' },
]
export const FOREX_CROSS_PAIRS = [
  { from: 'EUR', to: 'JPY', label: 'EUR/JPY', symbol: 'EURJPY' },
  { from: 'GBP', to: 'JPY', label: 'GBP/JPY', symbol: 'GBPJPY' },
  { from: 'AUD', to: 'JPY', label: 'AUD/JPY', symbol: 'AUDJPY' },
  { from: 'EUR', to: 'GBP', label: 'EUR/GBP', symbol: 'EURGBP' },
  { from: 'EUR', to: 'CHF', label: 'EUR/CHF', symbol: 'EURCHF' },
  { from: 'CAD', to: 'JPY', label: 'CAD/JPY', symbol: 'CADJPY' },
]

/** Global exchanges for EXCHANGES tab: abbrev, name, timezone (IANA), used to compute OPEN/CLOSED/PRE/POST */
export const EXCHANGES = [
  { region: 'AMERICAS', abbrev: 'NYSE', name: 'New York Stock Exchange', tz: 'America/New_York' },
  { region: 'AMERICAS', abbrev: 'NASDAQ', name: 'NASDAQ', tz: 'America/New_York' },
  { region: 'AMERICAS', abbrev: 'TSX', name: 'Toronto Stock Exchange', tz: 'America/Toronto' },
  { region: 'AMERICAS', abbrev: 'BMV', name: 'Bolsa Mexicana de Valores', tz: 'America/Mexico_City' },
  { region: 'AMERICAS', abbrev: 'BOVESPA', name: 'B3 (Brasil)', tz: 'America/Sao_Paulo' },
  { region: 'EUROPE', abbrev: 'LSE', name: 'London Stock Exchange', tz: 'Europe/London' },
  { region: 'EUROPE', abbrev: 'XETRA', name: 'Deutsche Börse (Xetra)', tz: 'Europe/Berlin' },
  { region: 'EUROPE', abbrev: 'EURONEXT', name: 'Euronext Paris', tz: 'Europe/Paris' },
  { region: 'EUROPE', abbrev: 'SIX', name: 'SIX Swiss Exchange', tz: 'Europe/Zurich' },
  { region: 'EUROPE', abbrev: 'MOEX', name: 'Moscow Exchange', tz: 'Europe/Moscow' },
  { region: 'ASIA PACIFIC', abbrev: 'TSE', name: 'Tokyo Stock Exchange', tz: 'Asia/Tokyo' },
  { region: 'ASIA PACIFIC', abbrev: 'HKEX', name: 'Hong Kong Stock Exchange', tz: 'Asia/Hong_Kong' },
  { region: 'ASIA PACIFIC', abbrev: 'SSE', name: 'Shanghai Stock Exchange', tz: 'Asia/Shanghai' },
  { region: 'ASIA PACIFIC', abbrev: 'SZSE', name: 'Shenzhen Stock Exchange', tz: 'Asia/Shanghai' },
  { region: 'ASIA PACIFIC', abbrev: 'KRX', name: 'Korea Exchange', tz: 'Asia/Seoul' },
  { region: 'ASIA PACIFIC', abbrev: 'ASX', name: 'Australian Securities Exchange', tz: 'Australia/Sydney' },
  { region: 'ASIA PACIFIC', abbrev: 'NSE', name: 'National Stock Exchange of India', tz: 'Asia/Kolkata' },
  { region: 'ASIA PACIFIC', abbrev: 'SGX', name: 'Singapore Exchange', tz: 'Asia/Singapore' },
]

/** Get market status from exchange timezone (simplified: 9:30–16:00 local, pre 4h before, post 4h after) */
export function getExchangeStatus(tz) {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: false })
  const [hour, minute] = formatter.format(now).split(':').map(Number)
  const minutes = hour * 60 + (minute || 0)
  const open = 9 * 60 + 30   // 09:30
  const close = 16 * 60 + 0  // 16:00
  const preStart = 5 * 60 + 30  // 05:30 pre-market
  const postEnd = 20 * 60 + 0   // 20:00 post-market
  if (minutes >= open && minutes < close) return 'OPEN'
  if (minutes >= preStart && minutes < open) return 'PRE'
  if (minutes >= close && minutes < postEnd) return 'POST'
  return 'CLOSED'
}
