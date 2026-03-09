import { useState, useEffect } from 'react'
import { fetchQuotes, hasApiKey } from '../../api/marketData'
import { fetchTvScannerQuotes } from '../../api/tradingViewData'
import { METALS_COMMODITY_SYMBOLS, METALS_MINING_TICKERS } from '../../data/stocksConfig'
import TradingViewEmbed from './TradingViewEmbed'
import { TRADINGVIEW_MARKET_QUOTES_SCRIPT } from '../../data/tradingViewConfig'

const MAX_BAR = 5
const COMMODITY_NAMES = { 'GC=F': 'Gold', 'SI=F': 'Silver', 'PL=F': 'Platinum', 'PA=F': 'Palladium' }
const COMMODITY_TV = { 'GC=F': 'TVC:GOLD', 'SI=F': 'TVC:SILVER', 'PL=F': 'TVC:PLATINUM', 'PA=F': 'TVC:PALLADIUM' }

const MINING_TV_MAP = {
  NEM: 'NYSE:NEM', GOLD: 'NASDAQ:GOLD', AEM: 'NYSE:AEM', FNV: 'NYSE:FNV', WPM: 'NYSE:WPM',
  RGLD: 'NASDAQ:RGLD', KGC: 'NYSE:KGC', PAAS: 'NASDAQ:PAAS', AG: 'NYSE:AG', HL: 'NYSE:HL',
}

function MetalsWidget() {
  const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  return (
    <TradingViewEmbed
      script={TRADINGVIEW_MARKET_QUOTES_SCRIPT}
      config={{
        symbolsGroups: [
          {
            name: 'Precious Metals',
            symbols: [
              { name: 'TVC:GOLD', displayName: 'Gold' },
              { name: 'TVC:SILVER', displayName: 'Silver' },
              { name: 'TVC:PLATINUM', displayName: 'Platinum' },
              { name: 'TVC:PALLADIUM', displayName: 'Palladium' },
            ],
          },
          {
            name: 'Mining',
            symbols: METALS_MINING_TICKERS.map((t) => ({
              name: MINING_TV_MAP[t] || `NASDAQ:${t}`,
              displayName: t,
            })),
          },
        ],
        showSymbolLogo: false,
        isTransparent: true,
        colorTheme: theme,
        locale: 'en',
        width: '100%',
        height: 520,
      }}
      height={520}
    />
  )
}

export default function StocksMetals({ onSymbolClick }) {
  const [commodity, setCommodity] = useState([])
  const [mining, setMining] = useState([])
  const [loading, setLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const miningTv = METALS_MINING_TICKERS.map((t) => MINING_TV_MAP[t] || `NASDAQ:${t}`)
    const commodityTv = METALS_COMMODITY_SYMBOLS.map((s) => COMMODITY_TV[s]).filter(Boolean)
    const allTv = [...commodityTv, ...miningTv]

    fetchTvScannerQuotes(allTv)
      .then((map) => {
        if (cancelled) return
        if (map?.size) {
          const cData = METALS_COMMODITY_SYMBOLS.map((s) => {
            const tvKey = (COMMODITY_TV[s] || '').split(':')[1]
            const q = map.get(tvKey)
            return q ? { symbol: s, ...q } : null
          }).filter(Boolean)
          const mData = METALS_MINING_TICKERS.map((t) => {
            const q = map.get(t)
            return q ? { symbol: t, ...q } : null
          }).filter(Boolean)
          setCommodity(cData)
          setMining(mData)
          setLoading(false)
          return
        }
        if (!hasApiKey()) { setUseFallback(true); setLoading(false); return }
        return Promise.all([
          fetchQuotes(METALS_COMMODITY_SYMBOLS),
          fetchQuotes(METALS_MINING_TICKERS),
        ]).then(([c, m]) => { if (!cancelled) { setCommodity(c); setMining(m) } })
      })
      .catch(() => setUseFallback(true))
      .finally(() => !cancelled && setLoading(false))

    return () => { cancelled = true }
  }, [])

  if (useFallback && commodity.length === 0) return <MetalsWidget />

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading && commodity.length === 0) return <div className="stocks-loading">Loading metals…</div>

  const renderRow = (q, maxBar = MAX_BAR) => {
    const pct = q.changePercent ?? q.change ?? 0
    const isPos = pct >= 0
    const width = Math.min(100, (Math.abs(pct) / maxBar) * 100)
    const name = COMMODITY_NAMES[q.symbol] || q.symbol
    return (
      <div
        key={q.symbol}
        className="stocks-quote-row stocks-quote-row-clickable"
        onClick={() => onSymbolClick?.(q.symbol)}
        role="button"
        tabIndex={0}
      >
        <span className="stocks-quote-symbol">{q.symbol}</span>
        <span className="stocks-quote-name">{name}</span>
        <span className="stocks-quote-price">${Number(q.price).toFixed(2)}</span>
        <span className={isPos ? 'stocks-pos' : 'stocks-neg'}>
          {isPos ? '+' : ''}{pct.toFixed(2)}%
        </span>
        <div className="stocks-bar-wrap">
          <div
            className={`stocks-bar ${isPos ? 'stocks-bar-pos' : 'stocks-bar-neg'}`}
            style={{ width: `${width}%` }}
          />
          <div className="stocks-bar-dotted" aria-hidden />
        </div>
      </div>
    )
  }

  return (
    <div className="stocks-metals">
      <h4 className="stocks-section-title">PRECIOUS METALS As of {dateStr}</h4>
      <h5 className="stocks-subtitle">COMMODITY FUTURES</h5>
      <div className="stocks-quote-list">{commodity.map((q) => renderRow(q))}</div>
      <h5 className="stocks-subtitle">MINING COMPANIES</h5>
      <div className="stocks-quote-list">{mining.map((q) => renderRow(q))}</div>
    </div>
  )
}
