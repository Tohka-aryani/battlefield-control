import { useState, useEffect } from 'react'
import { fetchQuotes } from '../../api/marketData'
import { DEFENSE_TICKERS } from '../../data/stocksConfig'

const MAX_BAR = 5

export default function StocksDefense() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setQuotes([])
    fetchQuotes(DEFENSE_TICKERS, (current, total) => setProgress({ current, total }))
      .then((res) => {
        if (cancelled) return
        setQuotes(res)
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading && quotes.length === 0)
    return (
      <div className="stocks-loading">
        Loading… {progress.total ? `${progress.current}/${progress.total} (rate limit 5/min)` : ''}
      </div>
    )
  if (error) return <div className="stocks-error">Unable to load data. Check API key.</div>

  return (
    <div className="stocks-defense">
      <h4 className="stocks-section-title">AEROSPACE & DEFENSE As of {dateStr}</h4>
      <div className="stocks-quote-list">
        {quotes.map((q) => {
          const isPos = (q.changePercent || q.change) >= 0
          const pct = q.changePercent ?? q.change
          const width = Math.min(100, (Math.abs(pct) / MAX_BAR) * 100)
          return (
            <div key={q.symbol} className="stocks-quote-row">
              <span className="stocks-quote-symbol">{q.symbol}</span>
              <span className="stocks-quote-price">${Number(q.price).toFixed(2)}</span>
              <span className={isPos ? 'stocks-pos' : 'stocks-neg'}>
                {isPos ? '+' : ''}{(pct || 0).toFixed(2)}%
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
        })}
      </div>
    </div>
  )
}
