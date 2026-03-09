import { useState, useEffect } from 'react'
import { fetchForexRate, hasFinnhubKey, hasApiKey } from '../../api/marketData'
import { FOREX_MAJOR_PAIRS, FOREX_CROSS_PAIRS } from '../../data/stocksConfig'
import TradingViewEmbed from './TradingViewEmbed'
import { TRADINGVIEW_FOREX_CROSS_RATES_SCRIPT } from '../../data/tradingViewConfig'

function ForexWidget() {
  const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  return (
    <TradingViewEmbed
      script={TRADINGVIEW_FOREX_CROSS_RATES_SCRIPT}
      config={{
        currencies: ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD'],
        colorTheme: theme,
        isTransparent: true,
        locale: 'en',
        width: '100%',
        height: 520,
      }}
      height={520}
    />
  )
}

export default function StocksForex({ onSymbolClick }) {
  const [major, setMajor] = useState([])
  const [cross, setCross] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasApiKey()) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    const load = async () => {
      if (hasFinnhubKey()) {
        const [mResults, cResults] = await Promise.all([
          Promise.all(FOREX_MAJOR_PAIRS.map((p) => fetchForexRate(p.from, p.to))),
          Promise.all(FOREX_CROSS_PAIRS.map((p) => fetchForexRate(p.from, p.to))),
        ])
        if (cancelled) return
        setMajor(FOREX_MAJOR_PAIRS.map((p, i) => (mResults[i] ? { ...p, ...mResults[i] } : null)).filter(Boolean))
        setCross(FOREX_CROSS_PAIRS.map((p, i) => (cResults[i] ? { ...p, ...cResults[i] } : null)).filter(Boolean))
      } else {
        const m = []
        for (const p of FOREX_MAJOR_PAIRS) {
          if (cancelled) return
          const r = await fetchForexRate(p.from, p.to)
          if (r) m.push({ ...p, ...r })
          await new Promise((resolve) => setTimeout(resolve, 12500))
        }
        const c = []
        for (const p of FOREX_CROSS_PAIRS) {
          if (cancelled) return
          const r = await fetchForexRate(p.from, p.to)
          if (r) c.push({ ...p, ...r })
          await new Promise((resolve) => setTimeout(resolve, 12500))
        }
        if (!cancelled) { setMajor(m); setCross(c) }
      }
    }
    load()
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  if (!hasApiKey()) return <ForexWidget />

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading && major.length === 0) return <div className="stocks-loading">Loading forex…</div>

  const renderRow = (row) => (
    <div
      key={row.label}
      className="stocks-forex-row stocks-quote-row-clickable"
      onClick={() => onSymbolClick?.(row.symbol)}
      role="button"
      tabIndex={0}
    >
      <span className="stocks-forex-symbol">{row.symbol}=X</span>
      <span className="stocks-forex-pair">{row.label}</span>
      <span className="stocks-forex-rate">{Number(row.rate).toFixed(4)}</span>
      <span className={row.changePercent >= 0 ? 'stocks-pos' : 'stocks-neg'}>
        {row.changePercent >= 0 ? '+' : ''}{(row.changePercent || 0).toFixed(2)}%
      </span>
      <div className="stocks-bar-wrap">
        <div
          className={`stocks-bar ${row.changePercent >= 0 ? 'stocks-bar-pos' : 'stocks-bar-neg'}`}
          style={{ width: `${Math.min(100, Math.abs(row.changePercent || 0) * 10)}%` }}
        />
        <div className="stocks-bar-dotted" aria-hidden />
      </div>
    </div>
  )

  return (
    <div className="stocks-forex">
      <h4 className="stocks-section-title">FOREIGN EXCHANGE As of {dateStr}</h4>
      <h5 className="stocks-subtitle">MAJOR PAIRS</h5>
      <div className="stocks-quote-list">{major.map(renderRow)}</div>
      <h5 className="stocks-subtitle">CROSS PAIRS</h5>
      <div className="stocks-quote-list">{cross.map(renderRow)}</div>
    </div>
  )
}
