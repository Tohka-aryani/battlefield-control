import { useState, useEffect, useCallback } from 'react'
import { MARKET_SECTORS } from '../../data/stocksConfig'
import { fetchTvScannerQuotes } from '../../api/tradingViewData'
import { fetchQuotes, hasApiKey } from '../../api/marketData'

const MAX_BAR = 8

function BarCell({ value }) {
  const width = Math.min(100, (Math.abs(value) / MAX_BAR) * 100)
  return (
    <div className="stocks-bar-wrap">
      <div
        className={`stocks-bar ${value >= 0 ? 'stocks-bar-pos' : 'stocks-bar-neg'}`}
        style={{ width: `${width}%` }}
      />
      <div className="stocks-bar-dotted" aria-hidden />
    </div>
  )
}

export default function StocksSectors({ onSymbolClick }) {
  const [expanded, setExpanded] = useState({ technology: true })
  const [quotes, setQuotes] = useState(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const tvSymbols = []
    MARKET_SECTORS.forEach((sector) =>
      sector.stocks.forEach((s) => tvSymbols.push(`${s.exchange}:${s.symbol}`))
    )

    fetchTvScannerQuotes(tvSymbols)
      .then((map) => {
        if (cancelled) return
        if (map?.size) {
          setQuotes(map)
          setLoading(false)
          return
        }
        if (!hasApiKey()) { setLoading(false); return }
        const symbols = [...new Set(MARKET_SECTORS.flatMap((sec) => sec.stocks.map((s) => s.symbol)))]
        return fetchQuotes(symbols).then((results) => {
          if (cancelled) return
          const m = new Map()
          results.forEach((q) => m.set(q.symbol, q))
          setQuotes(m)
        })
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))

    return () => { cancelled = true }
  }, [])

  const toggleSector = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const getSectorChange = (sector) => {
    const vals = sector.stocks.map((s) => quotes.get(s.symbol)).filter(Boolean)
    if (!vals.length) return null
    return vals.reduce((sum, q) => sum + (q.changePercent || 0), 0) / vals.length
  }

  const hasData = quotes.size > 0

  return (
    <div className="stocks-sectors-custom">
      <h4 className="stocks-section-title">
        MARKET SECTORS
        {loading && <span className="stocks-loading-inline"> Loading…</span>}
      </h4>
      <ul className="stocks-sector-list-collapse">
        {MARKET_SECTORS.map((sector) => {
          const isOpen = expanded[sector.id]
          const perf = getSectorChange(sector)
          const isPos = perf != null && perf >= 0

          return (
            <li key={sector.id} className="stocks-sector-collapse-item">
              <div
                className="stocks-sector-collapse-head"
                onClick={() => toggleSector(sector.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleSector(sector.id)}
              >
                <span className="stocks-sector-expand-btn" aria-hidden>
                  [{isOpen ? '-' : '+'}]
                </span>
                <span className="stocks-sector-name">{sector.name}</span>
                {perf != null && (
                  <>
                    <span className={isPos ? 'stocks-pos' : 'stocks-neg'}>
                      {isPos ? '+' : ''}{perf.toFixed(2)}%
                    </span>
                    <div className="stocks-sector-bar-head">
                      <BarCell value={perf} />
                    </div>
                  </>
                )}
              </div>

              {isOpen && (
                <div className="stocks-sector-stocks">
                  {sector.stocks.map((stock) => {
                    const q = quotes.get(stock.symbol)
                    const pct = q?.changePercent || 0
                    const isStockPos = pct >= 0
                    return (
                      <div
                        key={stock.symbol}
                        className="stocks-sector-stock-row"
                        onClick={() => onSymbolClick?.(stock.symbol)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSymbolClick?.(stock.symbol)}
                      >
                        <span className="stocks-sector-stock-ticker">{stock.symbol}</span>
                        <span className="stocks-sector-stock-name">{stock.name}</span>
                        {q ? (
                          <>
                            <span className="stocks-sector-stock-price">
                              ${Number(q.price).toFixed(2)}
                            </span>
                            <span className={isStockPos ? 'stocks-pos' : 'stocks-neg'}>
                              {isStockPos ? '+' : ''}{pct.toFixed(2)}%
                            </span>
                            <BarCell value={pct} />
                          </>
                        ) : (
                          <span className="stocks-sector-stock-chart-hint">[CHART →]</span>
                        )}
                      </div>
                    )
                  })}
                  {loading && !hasData && (
                    <div className="stocks-sector-stocks-loading">Loading quotes…</div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
