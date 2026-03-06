import { useState, useEffect, useCallback } from 'react'
import { fetchGdeltArticles } from '../api/gdeltData'
import { getSourceAnalysis } from '../data/wallConfig'
import SourceAnalysisModal from './SourceAnalysisModal'

const SYNC_INTERVAL_MS = 5 * 60 * 1000
const MAX_ITEMS = 800

function NewsCard({ item, featured, onClickBias }) {
  const analysis = getSourceAnalysis(item.sourceKey)
  const biasLabel = analysis.bias

  const card = (
    <article className={`wall-card ${featured ? 'wall-card-featured' : ''}`}>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="wall-card-link"
      >
        {item.image && (
          <div className="wall-card-image-wrap">
            <img src={item.image} alt="" className="wall-card-image" loading="lazy" />
          </div>
        )}
        <div className="wall-card-content">
          <h3 className="wall-card-title">{item.title}</h3>
          {item.description && featured && (
            <p className="wall-card-desc">{item.description}</p>
          )}
          <div className="wall-card-meta">
            <span className="wall-card-source">{item.sourceKey.toUpperCase()}</span>
            <span className="wall-card-time">{item.timeAgo}</span>
          </div>
        </div>
      </a>
      <button
        type="button"
        className="wall-card-bias"
        onClick={(e) => {
          e.preventDefault()
          onClickBias(item.sourceKey)
        }}
        title="Source analysis"
      >
        ✛ {biasLabel}
      </button>
    </article>
  )

  return card
}

export default function TheWall() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState(null)
  const [sourceAnalysis, setSourceAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGdeltArticles()
      setItems(data.slice(0, MAX_ITEMS))
      setLastSync(Date.now())
      if (data.length === 0) setError('No articles could be loaded. Feeds may be temporarily unavailable.')
    } catch (e) {
      console.warn('Wall RSS load failed', e)
      setItems([])
      setError(e?.message || 'Failed to load news. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, SYNC_INTERVAL_MS)
    return () => clearInterval(id)
  }, [load])

  const syncAgo = lastSync
    ? (() => {
        const s = Math.floor((Date.now() - lastSync) / 1000)
        if (s < 60) return 'just now'
        if (s < 3600) return `${Math.floor(s / 60)}m ago`
        return `${Math.floor(s / 3600)}h ago`
      })()
    : '—'

  const featured = items[0]
  const rest = items.slice(1)

  return (
    <div className="wall">
      <div className="wall-header">
        <div className="wall-header-left">
          <span className="wall-breaking">BREAKING</span>
        </div>
        <div className="wall-header-right">
          <time className="wall-time" dateTime={new Date().toISOString()}>
            {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
          </time>
          <span className="wall-synced">SYNCED: {syncAgo}</span>
        </div>
      </div>

      {loading && items.length === 0 && !error ? (
        <div className="wall-loading">Loading news…</div>
      ) : error && items.length === 0 ? (
        <div className="wall-error">
          <p>{error}</p>
          <button type="button" className="wall-retry" onClick={load}>
            Retry
          </button>
        </div>
      ) : (
        <div className="wall-grid">
          {featured && (
            <div className="wall-featured">
              <NewsCard
                item={featured}
                featured
                onClickBias={setSourceAnalysis}
              />
            </div>
          )}
          <div className="wall-cards">
            {rest.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                featured={false}
                onClickBias={setSourceAnalysis}
              />
            ))}
          </div>
        </div>
      )}

      {sourceAnalysis && (
        <SourceAnalysisModal
          sourceName={sourceAnalysis}
          onClose={() => setSourceAnalysis(null)}
        />
      )}
    </div>
  )
}
