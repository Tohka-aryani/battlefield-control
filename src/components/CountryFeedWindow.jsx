import { useState, useEffect, useCallback } from 'react'
import { useMapContext } from '../context/MapContext'
import { useWallMap } from '../context/WallMapContext'

const STORAGE_KEY = 'hyperion-country-feed-window'
const MIN_W = 340
const MIN_H = 280
const DEFAULT_W = 400
const DEFAULT_H = 380
const DEFAULT_X = 40
const DEFAULT_Y = 100

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    if (typeof v?.x === 'number' && typeof v?.y === 'number' && typeof v?.w === 'number' && typeof v?.h === 'number') {
      return { x: v.x, y: v.y, w: v.w, h: v.h }
    }
  } catch (_) {}
  return null
}

function saveState(pos, size) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: pos.x, y: pos.y, w: size.w, h: size.h }))
  } catch (_) {}
}

function clampSize(w, h) {
  const maxW = typeof window !== 'undefined' ? Math.min(520, window.innerWidth * 0.9) : 520
  const maxH = typeof window !== 'undefined' ? Math.min(560, window.innerHeight * 0.85) : 560
  return { w: Math.max(MIN_W, Math.min(maxW, w)), h: Math.max(MIN_H, Math.min(maxH, h)) }
}

function clampPosition(x, y, w, h) {
  const maxX = typeof window !== 'undefined' ? window.innerWidth - 60 : 800
  const maxY = typeof window !== 'undefined' ? window.innerHeight - 60 : 600
  return { x: Math.max(0, Math.min(maxX, x)), y: Math.max(0, Math.min(maxY, y)) }
}

function matchCountry(item, countryName, countryCode) {
  if (!countryName) return false
  const name = (countryName || '').toLowerCase()
  const code = (countryCode || '').toLowerCase()
  const loc = (item.locationName || '').toLowerCase()
  const title = (item.title || '').toLowerCase()
  const desc = (item.description || '').toLowerCase()
  const combined = `${loc} ${title} ${desc}`
  if (loc.includes(name) || combined.includes(name)) return true
  if (code && (loc.includes(code) || combined.includes(code))) return true
  const aliases = {
    'united states': ['usa', 'u.s.', 'united states of america', 'america'],
    'united kingdom': ['uk', 'u.k.', 'britain', 'great britain', 'england'],
    'russia': ['russian federation'],
    'south korea': ['korea'],
    'united arab emirates': ['uae', 'emirates'],
  }
  const keys = Object.keys(aliases).filter((k) => k.includes(name) || name.includes(k))
  for (const k of keys) {
    if (combined.includes(k)) return true
    for (const a of aliases[k]) {
      if (combined.includes(a)) return true
    }
  }
  return false
}

export default function CountryFeedWindow() {
  const { selectedCountry, setSelectedCountry, countryLoading } = useMapContext()
  const { wallItems } = useWallMap()

  const saved = loadSaved()
  const initialSize = saved ? clampSize(saved.w, saved.h) : { w: DEFAULT_W, h: DEFAULT_H }
  const initialPos = saved ? clampPosition(saved.x, saved.y, initialSize.w, initialSize.h) : { x: DEFAULT_X, y: DEFAULT_Y }

  const [position, setPosition] = useState(initialPos)
  const [size, setSize] = useState(initialSize)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState(null)
  const [resizeStart, setResizeStart] = useState(null)

  const persist = useCallback(() => saveState(position, size), [position, size])
  useEffect(() => {
    if (!dragging && !resizing) persist()
  }, [dragging, resizing, persist])

  useEffect(() => {
    if (!dragging && !resizing) return
    const onMove = (e) => {
      if (dragging) {
        setPosition((prev) => {
          const next = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }
          return clampPosition(next.x, next.y, size.w, size.h)
        })
      }
      if (resizing) {
        setSize((prev) => {
          let w = prev.w, h = prev.h
          if (resizing === 'r' || resizing === 'br') w = resizeStart.w + (e.clientX - resizeStart.x)
          if (resizing === 'b' || resizing === 'br') h = resizeStart.h + (e.clientY - resizeStart.y)
          return clampSize(w, h)
        })
      }
    }
    const onUp = () => { setDragging(false); setResizing(null); setResizeStart(null) }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onUp)
    }
  }, [dragging, dragStart, resizing, resizeStart, size.w, size.h])

  const onTitleDown = useCallback((e) => {
    if (e.button !== 0) return
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    setDragging(true)
  }, [position.x, position.y])

  const onResizeDown = useCallback((edge, e) => {
    if (e.button !== 0) return
    e.stopPropagation()
    setResizing(edge)
    setResizeStart({ x: e.clientX, y: e.clientY, w: size.w, h: size.h })
  }, [size.w, size.h])

  const feedItems = selectedCountry && Array.isArray(wallItems)
    ? wallItems.filter((i) => matchCountry(i, selectedCountry.name, selectedCountry.code))
    : []
  const limitedItems = feedItems.slice(0, 50)

  if (!selectedCountry) return null

  return (
    <div
      className="country-feed-wrap"
      style={{ left: position.x, top: position.y, width: size.w, height: size.h }}
    >
      <div className="country-feed-resize-r" onPointerDown={(e) => onResizeDown('r', e)} aria-hidden />
      <div className="country-feed-resize-b" onPointerDown={(e) => onResizeDown('b', e)} aria-hidden />
      <div className="country-feed-resize-br" onPointerDown={(e) => onResizeDown('br', e)} aria-hidden />

      <div className="country-feed-panel" role="dialog" aria-label="Country news feed">
        <div
          className="country-feed-header"
          onPointerDown={(e) => { if (!e.target.closest('button')) onTitleDown(e) }}
        >
          <span className="country-feed-title">
            {countryLoading ? 'Resolving…' : selectedCountry.name}
            {selectedCountry.code ? ` (${selectedCountry.code})` : ''}
          </span>
          <button
            type="button"
            className="country-feed-close"
            aria-label="Close"
            onClick={() => setSelectedCountry(null)}
          >
            ×
          </button>
        </div>

        <div className="country-feed-body">
          {countryLoading ? (
            <p className="country-feed-loading">Identifying country…</p>
          ) : (
            <>
              <p className="country-feed-meta">
                {limitedItems.length} article{limitedItems.length !== 1 ? 's' : ''} related to this country
              </p>
              <ul className="country-feed-list">
                {limitedItems.length === 0 ? (
                  <li className="country-feed-empty">No articles in this feed yet. Try another region.</li>
                ) : (
                  limitedItems.map((item) => (
                    <li key={item.id} className="country-feed-item">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="country-feed-item-link"
                      >
                        {item.title || '—'}
                      </a>
                      <span className="country-feed-item-meta">
                        {[item.sourceKey, item.timeAgo].filter(Boolean).join(' · ')}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
