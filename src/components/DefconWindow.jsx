import { useState, useEffect, useCallback } from 'react'
import { getDefconLevels, fetchDefconStatus, fetchDefconAlerts } from '../api/defconData'

const STORAGE_KEY = 'godseye-defcon-window'
const MIN_W = 380
const MIN_H = 320
const DEFAULT_W = 480
const DEFAULT_H = 520
const DEFAULT_X = 80
const DEFAULT_Y = 80

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
  const maxW = typeof window !== 'undefined' ? Math.min(960, window.innerWidth * 0.95) : 960
  const maxH = typeof window !== 'undefined' ? Math.min(900, window.innerHeight * 0.9) : 800
  return { w: Math.max(MIN_W, Math.min(maxW, w)), h: Math.max(MIN_H, Math.min(maxH, h)) }
}

function clampPosition(x, y, w, h) {
  const maxX = typeof window !== 'undefined' ? window.innerWidth - 80 : 800
  const maxY = typeof window !== 'undefined' ? window.innerHeight - 80 : 600
  return { x: Math.max(0, Math.min(maxX, x)), y: Math.max(0, Math.min(maxY, y)) }
}

export default function DefconWindow({ onClose }) {
  const saved = loadSaved()
  const initialSize = saved ? clampSize(saved.w, saved.h) : { w: DEFAULT_W, h: DEFAULT_H }
  const initialPos = saved ? clampPosition(saved.x, saved.y, initialSize.w, initialSize.h) : { x: DEFAULT_X, y: DEFAULT_Y }

  const [position, setPosition] = useState(initialPos)
  const [size, setSize] = useState(initialSize)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState(null)
  const [resizeStart, setResizeStart] = useState(null)

  const [tab, setTab] = useState('status')
  const [status, setStatus] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, a] = await Promise.all([fetchDefconStatus(), fetchDefconAlerts()])
      setStatus(s)
      setAlerts(Array.isArray(a) ? a : [])
      setUpdated(s?.updated || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }))
    } catch (_) {
      const s = await fetchDefconStatus()
      setStatus(s)
      setAlerts([])
      setUpdated(s?.updated || '—')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

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

  const levels = getDefconLevels()
  const current = status?.level ?? 3
  const currentInfo = levels.find((l) => l.level === current) || levels[2]

  return (
    <div
      className="defcon-window-wrap"
      style={{ left: position.x, top: position.y, width: size.w, height: size.h }}
    >
      <div className="defcon-resize-handle defcon-resize-r" onPointerDown={(e) => onResizeDown('r', e)} aria-hidden />
      <div className="defcon-resize-handle defcon-resize-b" onPointerDown={(e) => onResizeDown('b', e)} aria-hidden />
      <div className="defcon-resize-handle defcon-resize-br" onPointerDown={(e) => onResizeDown('br', e)} aria-hidden />

      <div className="defcon-window" role="dialog" aria-label="DEFCON status">
        <div
          className="defcon-window-titlebar"
          onPointerDown={(e) => { if (!e.target.closest('button')) onTitleDown(e) }}
        >
          <div className="defcon-window-title">
            <span className="defcon-window-dot" />
            <span>DEFCON</span>
          </div>
          <div className="defcon-window-controls">
            <button type="button" className="defcon-window-btn" aria-label="Minimize" />
            <button type="button" className="defcon-window-btn" aria-label="Maximize" />
            <button type="button" className="defcon-window-btn defcon-window-close" aria-label="Close" onClick={() => { persist(); onClose() }} />
          </div>
        </div>

        <div className="defcon-tabs-row">
          <div className="defcon-tabs">
            <button type="button" className={`defcon-tab ${tab === 'status' ? 'active' : ''}`} onClick={() => setTab('status')}>STATUS</button>
            <button type="button" className={`defcon-tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>ISSUED ALERTS</button>
          </div>
          <button type="button" className="defcon-refresh" onClick={load}>[REFRESH]</button>
        </div>

        <div className="defcon-content">
          {tab === 'status' && (
            <div className="defcon-status-panel">
              {loading && !status ? (
                <div className="defcon-loading">Loading…</div>
              ) : (
                <>
                  <div className="defcon-current-block" style={{ backgroundColor: 'rgba(234, 179, 8, 0.12)' }}>
                    <div className="defcon-current-number" style={{ color: currentInfo?.color || '#ea580c' }}>{current}</div>
                    <div className="defcon-current-label">DEFCON</div>
                    <div className="defcon-current-name">{currentInfo?.name || 'ROUND HOUSE'}</div>
                    <p className="defcon-current-desc">{currentInfo?.description || 'Air Force ready to mobilize in 15 minutes. Increased readiness.'}</p>
                  </div>
                  <hr className="defcon-hr" />
                  <h4 className="defcon-levels-heading">ALL LEVELS</h4>
                  <ul className="defcon-levels-list">
                    {levels.map((l) => (
                      <li key={l.level} className={`defcon-level-row ${l.level === current ? 'current' : ''}`}>
                        <span className="defcon-level-num" style={{ backgroundColor: l.color }}>{l.level}</span>
                        <div className="defcon-level-text">
                          <strong>{l.name}</strong>
                          {l.level === current && ' (current)'}
                          <div className="defcon-level-desc">{l.description}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {tab === 'alerts' && (
            <div className="defcon-alerts-panel">
              {loading && alerts.length === 0 ? (
                <div className="defcon-loading">Loading alerts…</div>
              ) : alerts.length === 0 ? (
                <p className="defcon-alerts-empty">No alerts loaded. Use [REFRESH] or check defconlevel.com/alerts.</p>
              ) : (
                <ul className="defcon-alerts-list">
                  {alerts.map((a) => (
                    <li key={a.id || a.title?.slice(0, 40)} className="defcon-alert-item">
                      <div className="defcon-alert-time">{a.time || a.timeAgo || ''}</div>
                      <h4 className="defcon-alert-title">{a.title}</h4>
                      {a.description && <p className="defcon-alert-desc">{a.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <footer className="defcon-footer">
          <div>Source: defconlevel.com (OSINT estimate)</div>
          <div>Updated: {updated}</div>
          <div className="defcon-disclaimer">Third-party OSINT estimate, not official DoD data.</div>
        </footer>
      </div>
    </div>
  )
}
