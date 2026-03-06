import { useState, useEffect } from 'react'
import { fetchQuotes } from '../../api/marketData'
import { METALS_COMMODITY_SYMBOLS, METALS_MINING_TICKERS } from '../../data/stocksConfig'

const MAX_BAR = 5
const COMMODITY_NAMES = { 'GC=F': 'Gold', 'SI=F': 'Silver', 'PL=F': 'Platinum', 'PA=F': 'Palladium' }

export default function StocksMetals() {
  const [commodity, setCommodity] = useState([])
  const [mining, setMining] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchQuotes(METALS_COMMODITY_SYMBOLS),
      fetchQuotes(METALS_MINING_TICKERS),
    ])
      .then(([c, m]) => {
        if (cancelled) return
        setCommodity(c)
        setMining(m)
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading && commodity.length === 0)
    return <div className="stocks-loading">Loading metals…</div>
  if (error) return <div className="stocks-error">Unable to load data.</div>

  const renderRow = (q, maxBar = MAX_BAR) => {
    const isPos = (q.changePercent ?? q.change) >= 0
    const pct = q.changePercent ?? q.change ?? 0
    const width = Math.min(100, (Math.abs(pct) / maxBar) * 100)
    const name = COMMODITY_NAMES[q.symbol] || q.symbol
    return (
      <div key={q.symbol} className="stocks-quote-row">
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
