import { useEffect, useRef } from 'react'
import { toTradingViewSymbol, TRADINGVIEW_WIDGET_SCRIPT } from '../data/tradingViewConfig'

/**
 * Embeds TradingView Advanced Chart widget (free, no API key).
 * Uses iframe-style embed: container + script with inline JSON (TradingView reads script's innerHTML).
 */
const INTERVAL_MAP = { '1D': 'D', '5D': '5D', '1M': 'M', '3M': '3M', '6M': '6M', '1Y': '12M' }

export default function TradingViewChart({ symbol, theme = 'dark', height = 400, interval = '1M', className = '' }) {
  const containerRef = useRef(null)
  const tvInterval = INTERVAL_MAP[interval] || 'M'

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const tvSymbol = toTradingViewSymbol(symbol)
    const colorTheme = theme === 'light' ? 'light' : 'dark'
    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval: tvInterval,
      timezone: 'Etc/UTC',
      theme: colorTheme,
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      save_image: false,
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container'
    wrapper.style.cssText = `height:${height}px;width:100%;`

    const configId = 'tv_config_' + Math.random().toString(36).slice(2, 9)
    const configScript = document.createElement('script')
    configScript.type = 'application/json'
    configScript.id = configId
    configScript.textContent = JSON.stringify(config)

    const loadScript = document.createElement('script')
    loadScript.type = 'text/javascript'
    loadScript.src = TRADINGVIEW_WIDGET_SCRIPT
    loadScript.async = true
    loadScript.setAttribute('data-config-id', configId)

    container.innerHTML = ''
    container.appendChild(wrapper)
    wrapper.appendChild(configScript)
    wrapper.appendChild(loadScript)

    return () => {
      container.innerHTML = ''
    }
  }, [symbol, theme, height, tvInterval])

  return <div ref={containerRef} className={className} style={{ minHeight: height }} />
}
