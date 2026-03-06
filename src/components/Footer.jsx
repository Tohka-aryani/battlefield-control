import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchGdeltArticles, fetchArticleDescription } from '../api/gdeltData'

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000
const TICKER_SYNC_INTERVAL_MS = 5 * 60 * 1000
const POPUP_LEAVE_DELAY_MS = 200

function filterLast12Hours(items) {
  if (!Array.isArray(items)) return []
  const cutoff = Date.now() - TWELVE_HOURS_MS
  return items.filter((item) => (item.published || 0) >= cutoff)
}

function TickerPopup({ item, description, descLoading }) {
  if (!item) return null
  const title = item.title || '—'
  const link = item.link || '#'
  const timeAgo = item.timeAgo || ''

  return (
    <div className="ticker-popup" role="dialog" aria-label="Article preview">
      <h3 className="ticker-popup-title">{title}</h3>
      {descLoading ? (
        <div className="ticker-popup-body ticker-popup-loading">Loading article summary…</div>
      ) : description ? (
        <div className="ticker-popup-body">{description}</div>
      ) : null}
      <div className="ticker-popup-footer">
        <span className="ticker-popup-time">{timeAgo}</span>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="ticker-popup-open"
        >
          OPEN →
        </a>
      </div>
    </div>
  )
}

export default function Footer() {
  const [tickerItems, setTickerItems] = useState([])
  const [hoveredItem, setHoveredItem] = useState(null)
  const [popupDesc, setPopupDesc] = useState(null)
  const [descLoading, setDescLoading] = useState(false)
  const closeTimeoutRef = useRef(null)
  const hoveredUrlRef = useRef(null)
  const descCacheRef = useRef(new Map())

  const handleItemHover = useCallback((item) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setHoveredItem(item)

    const url = item?.link
    hoveredUrlRef.current = url || null

    if (!url) {
      setPopupDesc(null)
      setDescLoading(false)
      return
    }

    if (descCacheRef.current.has(url)) {
      setPopupDesc(descCacheRef.current.get(url))
      setDescLoading(false)
      return
    }

    setPopupDesc(null)
    setDescLoading(true)
    fetchArticleDescription(url).then((desc) => {
      descCacheRef.current.set(url, desc)
      if (hoveredUrlRef.current === url) {
        setPopupDesc(desc)
        setDescLoading(false)
      }
    })
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null)
      hoveredUrlRef.current = null
      setPopupDesc(null)
      setDescLoading(false)
    }, POPUP_LEAVE_DELAY_MS)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await fetchGdeltArticles()
      const recent = filterLast12Hours(data)
      const english = recent.filter(
        (i) => !i.language || i.language.toLowerCase() === 'english',
      )
      setTickerItems(english)
    } catch (_) {
      setTickerItems([])
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, TICKER_SYNC_INTERVAL_MS)
    return () => clearInterval(id)
  }, [load])

  const displayItems = tickerItems.map((item) => ({
    title: item.title || '—',
    link: item.link || '',
    full: item,
  }))

  const renderItems = (prefix) =>
    displayItems.flatMap((item, i) => [
      <span
        key={`${prefix}-item-${i}`}
        className="ticker-item"
        onMouseEnter={() => handleItemHover(item.full)}
        onMouseLeave={scheduleClose}
      >
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ticker-item-link"
          onMouseEnter={(e) => {
            e.stopPropagation()
            handleItemHover(item.full)
          }}
          onMouseLeave={scheduleClose}
        >
          {item.title}
        </a>
      </span>,
      <span key={`${prefix}-sep-${i}`} className="ticker-sep"> — </span>,
    ])

  return (
    <footer className="footer">
      {hoveredItem && (
        <div
          className="ticker-popup-wrap"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <TickerPopup item={hoveredItem} description={popupDesc} descLoading={descLoading} />
        </div>
      )}
      <div className="footer-row">
        <div className="live-badge">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>
        <div className="ticker-wrap">
          <div className="ticker">
            {displayItems.length > 0 ? (
              <>
                {renderItems('a')}
                {renderItems('b')}
              </>
            ) : (
              <span className="ticker-item">Loading news…</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
