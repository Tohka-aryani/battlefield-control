import { useState } from 'react'
import StocksSectors from './stocks/StocksSectors'
import StocksMovers from './stocks/StocksMovers'
import StocksExchanges from './stocks/StocksExchanges'
import StocksDefense from './stocks/StocksDefense'
import StocksMetals from './stocks/StocksMetals'
import StocksForex from './stocks/StocksForex'
import StocksChart from './stocks/StocksChart'
import { useTheme } from '../context/ThemeContext'

const TABS = [
  { id: 'sectors', label: 'SECTORS' },
  { id: 'movers', label: 'MOVERS' },
  { id: 'exchanges', label: 'EXCHANGES' },
  { id: 'defense', label: 'DEFENSE' },
  { id: 'metals', label: 'METALS' },
  { id: 'forex', label: 'FOREX' },
]

export default function StocksWindow({ onClose, onRefresh }) {
  const [tab, setTab] = useState('sectors')
  const [symbol, setSymbol] = useState('')
  const [detailSymbol, setDetailSymbol] = useState(null)
  const { theme } = useTheme()

  const handleSymbolClick = (sym) => {
    setSymbol(sym)
    setDetailSymbol(sym)
  }

  const handleBack = () => {
    setDetailSymbol(null)
  }

  const handleSymbolSubmit = () => {
    const s = (symbol || '').trim()
    if (s) setDetailSymbol(s)
  }

  const renderContent = () => {
    switch (tab) {
      case 'sectors': return <StocksSectors onSymbolClick={handleSymbolClick} />
      case 'movers': return <StocksMovers onSymbolClick={handleSymbolClick} />
      case 'exchanges': return <StocksExchanges />
      case 'defense': return <StocksDefense onSymbolClick={handleSymbolClick} />
      case 'metals': return <StocksMetals onSymbolClick={handleSymbolClick} />
      case 'forex': return <StocksForex onSymbolClick={handleSymbolClick} />
      default: return <StocksSectors onSymbolClick={handleSymbolClick} />
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
            className={`stocks-tab ${!detailSymbol && tab === t.id ? 'active' : ''}`}
            onClick={() => { setTab(t.id); setDetailSymbol(null) }}
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
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSymbolSubmit() }}
            aria-label="Stock symbol"
          />
        </div>
        <button type="button" className="stocks-refresh-btn stocks-tab-refresh" onClick={onRefresh} title="Refresh" aria-label="Refresh">
          [R]
        </button>
      </nav>

      <div className="stocks-content">
        {detailSymbol ? (
          <StocksChart
            symbol={detailSymbol}
            theme={theme}
            onBack={handleBack}
            onRefresh={onRefresh}
          />
        ) : (
          renderContent()
        )}
      </div>
    </div>
  )
}
