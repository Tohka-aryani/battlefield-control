import { useEffect, useRef } from 'react'
import { TRADINGVIEW_SCREENER_SCRIPT } from '../../data/tradingViewConfig'

/**
 * TradingView Stock Screener — real-time sector/market data from TradingView.
 * @see https://www.tradingview.com/screener/
 */
export default function StocksSectors() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    const config = {
      width: '100%',
      height: 520,
      defaultScreen: 'general',
      market: 'america',
      showToolbar: true,
      colorTheme: theme,
      locale: 'en',
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-screener-wrap'
    wrapper.style.cssText = 'width:100%;height:520px;'

    const configScript = document.createElement('script')
    configScript.type = 'application/json'
    configScript.textContent = JSON.stringify(config)

    const loadScript = document.createElement('script')
    loadScript.type = 'text/javascript'
    loadScript.src = TRADINGVIEW_SCREENER_SCRIPT
    loadScript.async = true

    container.innerHTML = ''
    container.appendChild(wrapper)
    wrapper.appendChild(configScript)
    wrapper.appendChild(loadScript)

    return () => {
      container.innerHTML = ''
    }
  }, [])

  return (
    <div className="stocks-sectors stocks-sectors-tv">
      <p className="stocks-sectors-tv-hint">
        Real-time data from{' '}
        <a href="https://www.tradingview.com/screener/" target="_blank" rel="noopener noreferrer">
          TradingView Stock Screener
        </a>
        . Type a symbol above and switch to <strong>CHART</strong> for Chart, News, Statistics & About.
      </p>
      <div ref={containerRef} className="stocks-sectors-tv-embed" />
    </div>
  )
}
