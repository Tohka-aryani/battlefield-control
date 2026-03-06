import { useTheme } from '../../context/ThemeContext'
import TradingViewWidget from '../TradingViewWidget'
import { TRADINGVIEW_MARKET_SUMMARY_SCRIPT } from '../../data/tradingViewConfig'
import { DEFENSE_TICKERS } from '../../data/stocksConfig'
import { toTradingViewSymbol } from '../../data/tradingViewConfig'

/** Defense / Aerospace stocks via TradingView Market Quotes (replaces Finnhub/AV). */
function getDefenseConfig() {
  const symbols = DEFENSE_TICKERS.map((t) => ({ proName: toTradingViewSymbol(t) }))
  return {
    width: '100%',
    height: '400',
    symbolsGroups: [{ name: 'Aerospace & Defense', symbols }],
    showSymbolLogo: true,
    locale: 'en',
  }
}

export default function StocksDefenseTv() {
  const { theme } = useTheme()
  return (
    <div className="stocks-tv-tab">
      <h4 className="stocks-section-title">AEROSPACE & DEFENSE (TradingView)</h4>
      <TradingViewWidget
        scriptUrl={TRADINGVIEW_MARKET_SUMMARY_SCRIPT}
        config={getDefenseConfig()}
        theme={theme}
        height={420}
      />
    </div>
  )
}
