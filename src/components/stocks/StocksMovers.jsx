import { useState, useEffect } from 'react'
import { fetchTopMovers, hasApiKey, hasAlphaVantageKey } from '../../api/marketData'
import TradingViewEmbed from './TradingViewEmbed'
import { TRADINGVIEW_HOTLISTS_SCRIPT } from '../../data/tradingViewConfig'

const MAX_BAR = 35

function BarRow({ symbol, name, price, change, onClick }) {
  const isPos = change >= 0
  const width = Math.min(100, (Math.abs(change) / MAX_BAR) * 100)
  return (
    <div className="stocks-mover-row" onClick={() => onClick?.(symbol)} role="button" tabIndex={0}>
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

function MoversWidget() {
  const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  return (
    <TradingViewEmbed
      script={TRADINGVIEW_HOTLISTS_SCRIPT}
      config={{
        colorTheme: theme,
        dateRange: '12M',
        exchange: 'US',
        showChart: true,
        locale: 'en',
        largeChartUrl: '',
        isTransparent: true,
        showSymbolLogo: false,
        plotLineColorGrowing: 'rgba(41, 191, 101, 1)',
        plotLineColorFalling: 'rgba(255, 68, 68, 1)',
        gridLineColor: 'rgba(42, 46, 57, 0)',
        scaleFontColor: 'rgba(134, 137, 147, 1)',
        belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
        belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
        belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
        belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
        symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
        width: '100%',
        height: 520,
      }}
      height={520}
    />
  )
}

export default function StocksMovers({ onSymbolClick }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!hasApiKey()) { setLoading(false); return }
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

  if (!hasApiKey()) return <MoversWidget />

  const dateStr = data?.lastUpdate
    ? new Date(data.lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading) return <div className="stocks-loading">Loading movers…</div>
  if (error) {
    let msg
    if (!hasAlphaVantageKey()) msg = 'Movers use Alpha Vantage. Add VITE_ALPHAVANTAGE_API_KEY to .env.'
    else msg = error === 'No data' ? 'Unable to load data. Try again later.' : error
    return <div className="stocks-error">{msg}</div>
  }

  return (
    <div className="stocks-movers">
      <h4 className="stocks-section-title">MARKET MOVERS As of {dateStr}</h4>
      <div className="stocks-movers-grid">
        <div className="stocks-movers-block">
          <h5 className="stocks-pos">TOP GAINERS</h5>
          {(data?.gainers || []).map((g) => (
            <BarRow key={g.symbol} symbol={g.symbol} name={g.name} price={g.price} change={g.change} onClick={onSymbolClick} />
          ))}
        </div>
        <div className="stocks-movers-block">
          <h5 className="stocks-neg">TOP LOSERS</h5>
          {(data?.losers || []).map((l) => (
            <BarRow key={l.symbol} symbol={l.symbol} name={l.name} price={l.price} change={l.change} onClick={onSymbolClick} />
          ))}
        </div>
      </div>
    </div>
  )
}
