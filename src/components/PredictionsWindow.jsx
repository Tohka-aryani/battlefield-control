import { useState, useEffect, useMemo } from 'react'
import { fetchPolymarketEvents, fetchKalshiMarkets } from '../api/predictionsData'

const OUTCOMES_VISIBLE = 4

function formatVolume(vol) {
  if (!vol && vol !== 0) return ''
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(1)}K`
  return `$${Number(vol).toFixed(0)}`
}

function formatCloses(endDate) {
  if (!endDate) return ''
  if (typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    const d = new Date(endDate)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return endDate
}

export default function PredictionsWindow({ onClose }) {
  const [search, setSearch] = useState('')
  const [expandedCard, setExpandedCard] = useState(null)
  const [polyEvents, setPolyEvents] = useState([])
  const [kalshiMarkets, setKalshiMarkets] = useState([])
  const [loadingPoly, setLoadingPoly] = useState(false)
  const [loadingKalshi, setLoadingKalshi] = useState(false)
  const [errorPoly, setErrorPoly] = useState(null)
  const [errorKalshi, setErrorKalshi] = useState(null)

  useEffect(() => {
    setLoadingPoly(true)
    setErrorPoly(null)
    fetchPolymarketEvents(30)
      .then(setPolyEvents)
      .catch((e) => setErrorPoly(e.message))
      .finally(() => setLoadingPoly(false))
  }, [])

  useEffect(() => {
    setLoadingKalshi(true)
    setErrorKalshi(null)
    fetchKalshiMarkets(30)
      .then(setKalshiMarkets)
      .catch((e) => setErrorKalshi(e.message))
      .finally(() => setLoadingKalshi(false))
  }, [])

  const combined = useMemo(() => {
    const poly = (polyEvents || []).map((e) => ({ ...e, id: `poly-${e.id}` }))
    const kalshi = (kalshiMarkets || []).map((m) => ({ ...m, id: `kalshi-${m.id}` }))
    return [...poly, ...kalshi]
  }, [polyEvents, kalshiMarkets])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return combined
    return combined.filter((c) => (c.title || '').toLowerCase().includes(q))
  }, [combined, search])

  const loading = loadingPoly || loadingKalshi
  const hasError = errorPoly || errorKalshi

  const showDetail = expandedCard != null

  return (
    <div className="predictions-window pm-redesign" role="dialog" aria-label="Prediction Markets">
      <div className="predictions-window-titlebar">
        <div className="predictions-window-title">
          <span className="predictions-window-dot" />
          <span>PREDICTION MARKETS</span>
        </div>
        <div className="predictions-window-controls">
          <button type="button" className="predictions-window-btn" aria-label="Minimize" />
          <button type="button" className="predictions-window-btn" aria-label="Maximize" />
          <button
            type="button"
            className="predictions-window-btn predictions-window-close"
            aria-label="Close"
            onClick={onClose}
          />
        </div>
      </div>

      <div className="pm-header">
        <button type="button" className="pm-trending active">
          TRENDING
        </button>
        <div className="pm-search-wrap">
          <input
            type="text"
            className="pm-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search markets"
          />
          <button type="button" className="pm-go">GO</button>
        </div>
      </div>

      <div className="predictions-content pm-content">
        {showDetail ? (
          <div className="pm-detail">
            <button
              type="button"
              className="pm-back"
              onClick={() => setExpandedCard(null)}
            >
              ← BACK {expandedCard.source}
            </button>
            <h2 className="pm-detail-title">{expandedCard.title}</h2>
            {expandedCard.description && (
              <section className="pm-detail-section">
                <h3 className="pm-detail-heading">DESCRIPTION</h3>
                <p className="pm-detail-description">{expandedCard.description}</p>
              </section>
            )}
            <section className="pm-detail-section">
              <h3 className="pm-detail-heading">OUTCOMES</h3>
              <ul className="pm-detail-outcomes">
                {(expandedCard.outcomes || []).map((out, i) => (
                  <li key={i} className="pm-detail-outcome">
                    <div className="pm-detail-outcome-left">
                      <div className="pm-detail-outcome-label">{out.label}</div>
                      {(out.volume != null && out.volume > 0) && (
                        <div className="pm-detail-outcome-vol">
                          {formatVolume(out.volume)} vol
                        </div>
                      )}
                    </div>
                    <div className="pm-detail-outcome-right">
                      <div className="pm-bar-wrap pm-detail-bar">
                        <div
                          className="pm-bar-fill"
                          style={{ width: `${Math.min(100, Math.max(0, out.prob))}%` }}
                        />
                      </div>
                      <span className="pm-detail-pct">{out.prob}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <a
              href={expandedCard.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pm-detail-link"
            >
              View on {expandedCard.source} →
            </a>
          </div>
        ) : (
          <>
            {hasError && (
              <div className="predictions-error">
                {[errorPoly, errorKalshi].filter(Boolean).join(' • ')}
              </div>
            )}
            {loading && filtered.length === 0 ? (
              <div className="predictions-loading">Loading prediction markets…</div>
            ) : (
              <ul className="pm-list">
                {filtered.map((card) => (
                  <li key={card.id} className="pm-card">
                    <a
                      href={card.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pm-card-title"
                    >
                      {card.title}
                    </a>
                    <ul className="pm-outcomes">
                      {(card.outcomes || []).slice(0, OUTCOMES_VISIBLE).map((out, i) => (
                        <li key={i} className="pm-outcome-row">
                          <span className="pm-outcome-label">{out.label}</span>
                          <span className="pm-outcome-pct">{out.prob}%</span>
                          <div className="pm-bar-wrap">
                            <div
                              className="pm-bar-fill"
                              style={{ width: `${Math.min(100, Math.max(0, out.prob))}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                    {(card.outcomes?.length || 0) > OUTCOMES_VISIBLE ? (
                      <button
                        type="button"
                        className="pm-more pm-more-btn"
                        onClick={() => setExpandedCard(card)}
                      >
                        +{(card.outcomes?.length || 0) - OUTCOMES_VISIBLE} more
                      </button>
                    ) : (
                      (card.outcomes?.length || 0) > 0 && (
                        <button
                          type="button"
                          className="pm-more pm-more-btn"
                          onClick={() => setExpandedCard(card)}
                        >
                          View all outcomes
                        </button>
                      )
                    )}
                    <div className="pm-footer">
                      <span className="pm-source">{card.source}</span>
                      {formatVolume(card.volume) && (
                        <span className="pm-vol">| {formatVolume(card.volume)} vol</span>
                      )}
                      {formatCloses(card.endDate) && (
                        <span className="pm-closes">| Closes: {formatCloses(card.endDate)}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!loading && !hasError && filtered.length === 0 && (
              <div className="predictions-loading">No markets match your search.</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
