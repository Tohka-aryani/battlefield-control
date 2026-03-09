import { useEffect, useRef } from 'react'

/**
 * Generic TradingView widget embed.
 * Renders a TradingView widget script with inline JSON config inside a container.
 */
export default function TradingViewEmbed({ script, config, height = 520 }) {
  const containerRef = useRef(null)
  const configKey = JSON.stringify(config)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container'
    wrapper.style.cssText = `width:100%;height:${height}px;`

    const configScript = document.createElement('script')
    configScript.type = 'application/json'
    configScript.textContent = configKey

    const loadScript = document.createElement('script')
    loadScript.type = 'text/javascript'
    loadScript.src = script
    loadScript.async = true

    container.innerHTML = ''
    container.appendChild(wrapper)
    wrapper.appendChild(configScript)
    wrapper.appendChild(loadScript)

    return () => { container.innerHTML = '' }
  }, [script, configKey, height])

  return <div ref={containerRef} style={{ minHeight: height }} />
}
