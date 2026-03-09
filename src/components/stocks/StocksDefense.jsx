import { useState, useEffect } from 'react'
import { fetchQuotes, hasApiKey } from '../../api/marketData'
import { fetchTvScannerQuotes } from '../../api/tradingViewData'
import { DEFENSE_TICKERS } from '../../data/stocksConfig'

const MAX_BAR = 5

const DEFENSE_TV_MAP = {
  LMT: 'NYSE:LMT', NOC: 'NYSE:NOC', RTX: 'NYSE:RTX', GD: 'NYSE:GD',
  BA: 'NYSE:BA', LHX: 'NYSE:LHX', TXT: 'NYSE:TXT', HII: 'NYSE:HII',
  LDOS: 'NYSE:LDOS', CACI: 'NYSE:CACI', BAH: 'NYSE:BAH', SAIC: 'NYSE:SAIC',
  KTOS: 'NASDAQ:KTOS', MRCY: 'NASDAQ:MRCY', AVAV: 'NASDAQ:AVAV', PLTR: 'NASDAQ:PLTR',
}

export default function StocksDefense({ onSymbolClick }) {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setQuotes([])

    const tvSymbols = DEFENSE_TICKERS.map((t) => DEFENSE_TV_MAP[t] || `NASDAQ:${t}`)
    fetchTvScannerQuotes(tvSymbols)
      .then((map) => {
        if (cancelled) return
        if (map?.size) {
          const results = DEFENSE_TICKERS
            .map((t) => {
              const q = map.get(t)
              return q ? { symbol: t, ...q } : null
            })
            .filter(Boolean)
          setQuotes(results)
          setLoading(false)
          return
        }
        if (!hasApiKey()) { setLoading(false); return }
        return fetchQuotes(DEFENSE_TICKERS, (c, t) => setProgress({ current: c, total: t }))
          .then((res) => { if (!cancelled) setQuotes(res) })
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))

    return () => { cancelled = true }
  }, [])

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading && quotes.length === 0) {
    return (
      <div className="stocks-loading">
        Loading… {progress.total ? `${progress.current}/${progress.total}` : ''}
      </div>
    )
  }

  return (
    <div className="stocks-defense">
      <h4 className="stocks-section-title">AEROSPACE & DEFENSE As of {dateStr}</h4>
      {quotes.length === 0 && !loading && (
        <div className="stocks-error">Unable to load data.</div>
      )}
      <div className="stocks-quote-list">
        {quotes.map((q) => {
          const pct = q.changePercent ?? q.change ?? 0
          const isPos = pct >= 0
          const width = Math.min(100, (Math.abs(pct) / MAX_BAR) * 100)
          return (
            <div
              key={q.symbol}
              className="stocks-quote-row stocks-quote-row-clickable"
              onClick={() => onSymbolClick?.(q.symbol)}
              role="button"
              tabIndex={0}
            >
              <span className="stocks-quote-symbol">{q.symbol}</span>
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
        })}
      </div>
    </div>
  )
}
