import { useState, useEffect } from 'react'
import TradingViewChart from '../TradingViewChart'
import {
  toTradingViewSymbol,
  getTradingViewSymbolPageUrl,
  getTradingViewExchangeLabel,
  getSymbolDisplayName,
} from '../../data/tradingViewConfig'
import { getQuoteForChart, hasApiKey } from '../../api/marketData'
import { fetchTvScannerQuotes } from '../../api/tradingViewData'
import { getExchangeStatus } from '../../data/stocksConfig'

const INTERVALS = [
  { id: '1D', label: '1D' },
  { id: '5D', label: '5D' },
  { id: '1M', label: '1M' },
  { id: '3M', label: '3M' },
  { id: '6M', label: '6M' },
  { id: '1Y', label: '1Y' },
]

const CHART_TABS = [
  { id: 'chart', label: 'CHART' },
  { id: 'news', label: 'NEWS' },
  { id: 'stats', label: 'STATS' },
  { id: 'about', label: 'ABOUT' },
]

const NYSE_TZ = 'America/New_York'

export default function StocksChart({ symbol, theme, onBack, onRefresh }) {
  const resolvedSymbol = (symbol || 'AAPL').trim() || 'AAPL'
  const [quote, setQuote] = useState(null)
  const [interval, setInterval] = useState('1M')
  const [chartTab, setChartTab] = useState('chart')
  const [marketStatus, setMarketStatus] = useState('')

  useEffect(() => {
    setMarketStatus(getExchangeStatus(NYSE_TZ))
  }, [])

  useEffect(() => {
    let cancelled = false
    const upper = resolvedSymbol.toUpperCase()

    if (hasApiKey()) {
      getQuoteForChart(upper)
        .then((q) => !cancelled && setQuote(q))
        .catch(() => {})
    } else {
      const tvSym = toTradingViewSymbol(upper)
      fetchTvScannerQuotes([tvSym])
        .then((map) => {
          if (cancelled || !map) return
          const q = map.get(upper)
          if (q) setQuote({ symbol: upper, ...q })
        })
        .catch(() => {})
    }

    return () => { cancelled = true }
  }, [resolvedSymbol])

  const displaySymbol = resolvedSymbol.toUpperCase()
  const companyName = getSymbolDisplayName(resolvedSymbol)
  const price = quote?.price
  const change = quote?.change
  const changePercent = quote?.changePercent ?? 0
  const isPos = (change != null ? change : changePercent) >= 0
  const symbolPageUrl = getTradingViewSymbolPageUrl(resolvedSymbol)
  const exchangeLabel = getTradingViewExchangeLabel(resolvedSymbol)

  return (
    <div className="stocks-chart-tab">
      <div className="stocks-chart-header">
        <div className="stocks-chart-header-left">
          {onBack && (
            <button
              type="button"
              className="stocks-chart-back"
              onClick={onBack}
              aria-label="Back"
            >
              [&lt;]
            </button>
          )}
          <span className="stocks-chart-symbol">{displaySymbol}</span>
          {companyName && <span className="stocks-chart-company-name">{companyName}</span>}
        </div>
        <div className="stocks-chart-header-right">
          <span className="stocks-chart-status">{marketStatus}</span>
          {onRefresh && (
            <button type="button" className="stocks-chart-refresh" onClick={onRefresh} title="Refresh" aria-label="Refresh">
              [R]
            </button>
          )}
        </div>
      </div>
      <div className="stocks-chart-price-row">
        <span className="stocks-chart-price">
          {price != null ? `$${Number(price).toFixed(2)}` : '—'}
        </span>
        {(change != null || (price != null && changePercent !== undefined)) && (
          <span className={isPos ? 'stocks-pos' : 'stocks-neg'}>
            {change != null ? `${isPos ? '+' : ''}${Number(change).toFixed(2)}` : ''}
            {' '}({isPos ? '+' : ''}{(changePercent || 0).toFixed(2)}%)
          </span>
        )}
      </div>

      <div className="stocks-chart-sub-header">
        <nav className="stocks-chart-tabs" aria-label="Chart view">
          {CHART_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`stocks-chart-tab-btn ${chartTab === t.id ? 'active' : ''}`}
              onClick={() => setChartTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <span className="stocks-chart-exchange">{exchangeLabel}</span>
      </div>

      {chartTab === 'chart' && (
        <>
          <div className="stocks-chart-intervals">
            {INTERVALS.map((i) => (
              <button
                key={i.id}
                type="button"
                className={`stocks-chart-interval-btn ${interval === i.id ? 'active' : ''}`}
                onClick={() => setInterval(i.id)}
              >
                {i.label}
              </button>
            ))}
          </div>
          <TradingViewChart
            symbol={resolvedSymbol}
            theme={theme}
            height={360}
            interval={interval}
            className="stocks-chart-widget"
          />
        </>
      )}

      {(chartTab === 'news' || chartTab === 'stats' || chartTab === 'about') && (
        <div className="stocks-chart-iframe-wrap">
          <iframe
            title={`TradingView ${chartTab} — ${displaySymbol}`}
            src={symbolPageUrl}
            className="stocks-chart-iframe"
          />
          <p className="stocks-chart-iframe-hint">
            Full {chartTab.toLowerCase()} on{' '}
            <a href={symbolPageUrl} target="_blank" rel="noopener noreferrer">
              TradingView →
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
