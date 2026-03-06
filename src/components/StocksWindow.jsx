import { useState } from 'react'
import StocksSectors from './stocks/StocksSectors'
import StocksMovers from './stocks/StocksMovers'
import StocksExchanges from './stocks/StocksExchanges'
import StocksDefense from './stocks/StocksDefense'
import StocksChart from './stocks/StocksChart'
import { hasApiKey } from '../api/marketData'
import { useTheme } from '../context/ThemeContext'

const TABS = [
  { id: 'sectors', label: 'SECTORS' },
  { id: 'movers', label: 'MOVERS' },
  { id: 'exchanges', label: 'EXCHANGES' },
  { id: 'defense', label: 'DEFENSE' },
  { id: 'chart', label: 'CHART' },
]

export default function StocksWindow({ onClose, onRefresh }) {
  const [tab, setTab] = useState('sectors')
  const [symbol, setSymbol] = useState('')
  const { theme } = useTheme()

  const renderContent = () => {
    switch (tab) {
      case 'sectors': return <StocksSectors />
      case 'movers': return <StocksMovers />
      case 'exchanges': return <StocksExchanges />
      case 'defense': return <StocksDefense />
      case 'chart': return <StocksChart symbol={symbol || 'AAPL'} theme={theme} onRefresh={onRefresh} />
      default: return <StocksSectors />
    }
  }

  return (
    <div className="stocks-window" role="dialog" aria-label="Stocks">
      <div className="stocks-window-titlebar">
        <div className="stocks-window-title">
          <span className="stocks-window-dot" />
          <span>STOCKS</span>
        </div>
        <div className="stocks-window-controls">
          <button type="button" className="stocks-window-btn" aria-label="Minimize" />
          <button type="button" className="stocks-window-btn" aria-label="Maximize" />
          <button type="button" className="stocks-window-btn stocks-window-close" aria-label="Close" onClick={onClose} />
        </div>
      </div>

      <nav className="stocks-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`stocks-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <div className="stocks-symbol-wrap stocks-tab-symbol">
          <input
            type="text"
            className="stocks-symbol-input"
            placeholder="SYMBOL"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setTab('chart') }}
            aria-label="Stock symbol"
          />
        </div>
        <button type="button" className="stocks-refresh-btn stocks-tab-refresh" onClick={onRefresh} title="Refresh" aria-label="Refresh">
          [R]
        </button>
      </nav>

      <div className="stocks-content">
        {!hasApiKey() && tab !== 'exchanges' && tab !== 'chart' ? (
          <div className="stocks-no-key">
            <p>Add at least one API key to load real-time data.</p>
            <p><code>VITE_FINNHUB_API_KEY</code> — quotes, forex (faster) · <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer">Finnhub</a></p>
            <p><code>VITE_ALPHAVANTAGE_API_KEY</code> — sectors, movers · <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer">Alpha Vantage</a></p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  )
}
