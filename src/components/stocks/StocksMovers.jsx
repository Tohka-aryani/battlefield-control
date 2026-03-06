import { useState, useEffect } from 'react'
import { fetchTopMovers, hasApiKey, hasAlphaVantageKey } from '../../api/marketData'

const MAX_BAR = 35

function BarRow({ symbol, name, price, change }) {
  const isPos = change >= 0
  const width = Math.min(100, (Math.abs(change) / MAX_BAR) * 100)
  return (
    <div className="stocks-mover-row">
      <div className="stocks-mover-info">
        <span className={`stocks-mover-symbol ${isPos ? 'stocks-pos' : 'stocks-neg'}`}>{symbol}</span>
        {name && <span className="stocks-mover-name">{name}</span>}
      </div>
      <span className="stocks-mover-price">${Number(price).toFixed(2)}</span>
      <span className={isPos ? 'stocks-pos' : 'stocks-neg'}>
        {isPos ? '+' : ''}{change.toFixed(2)}%
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

export default function StocksMovers() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTopMovers()
      .then((res) => {
        if (cancelled) return
        if (res) setData(res)
        else setError('No data')
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const dateStr = data?.lastUpdate
    ? new Date(data.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading) return <div className="stocks-loading">Loading movers…</div>
  if (error) {
    let msg
    if (!hasApiKey()) msg = 'Add VITE_ALPHAVANTAGE_API_KEY (and/or VITE_FINNHUB_API_KEY) to .env and restart the dev server.'
    else if (!hasAlphaVantageKey()) msg = 'Movers use Alpha Vantage. Add VITE_ALPHAVANTAGE_API_KEY to .env.'
    else msg = error === 'No data' ? 'Unable to load data. Try again later.' : error
    return <div className="stocks-error">{msg}</div>
  }

  const gainers = data?.gainers || []
  const losers = data?.losers || []

  return (
    <div className="stocks-movers">
      <h4 className="stocks-section-title">MARKET MOVERS As of {dateStr}</h4>
      <div className="stocks-movers-grid">
        <div className="stocks-movers-block">
          <h5 className="stocks-pos">TOP GAINERS</h5>
          {gainers.map((g) => (
            <BarRow key={g.symbol} symbol={g.symbol} name={g.name} price={g.price} change={g.change} />
          ))}
        </div>
        <div className="stocks-movers-block">
          <h5 className="stocks-neg">TOP LOSERS</h5>
          {losers.map((l) => (
            <BarRow key={l.symbol} symbol={l.symbol} name={l.name} price={l.price} change={l.change} />
          ))}
        </div>
      </div>
      <p className="stocks-hint">Click any stock to view details</p>
    </div>
  )
}
