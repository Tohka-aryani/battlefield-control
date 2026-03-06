import { useState, useEffect, useCallback } from 'react'
import LivestreamsWindow from './LivestreamsWindow'

const STORAGE_KEY = 'godseye-tv-window'
const MIN_W = 400
const MIN_H = 320
const DEFAULT_W = 640
const DEFAULT_H = 440
const DEFAULT_X = 60
const DEFAULT_Y = 60

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      x: pos.x,
      y: pos.y,
      w: size.w,
      h: size.h,
    }))
  } catch (_) {}
}

function clampSize(w, h) {
  const maxW = Math.min(960, typeof window !== 'undefined' ? window.innerWidth * 0.9 : 960)
  const maxH = Math.min(800, typeof window !== 'undefined' ? window.innerHeight * 0.9 : 800)
  return {
    w: Math.max(MIN_W, Math.min(maxW, w)),
    h: Math.max(MIN_H, Math.min(maxH, h)),
  }
}

function clampPosition(x, y, w, h) {
  const maxX = typeof window !== 'undefined' ? window.innerWidth - w : 800
  const maxY = typeof window !== 'undefined' ? window.innerHeight - Math.min(h, 200) : 600
  return {
    x: Math.max(0, Math.min(maxX, x)),
    y: Math.max(0, Math.min(maxY, y)),
  }
}

export default function TvFloatingWindow({ onClose }) {
  const saved = loadSaved()
  const initialSize = saved ? clampSize(saved.w, saved.h) : { w: DEFAULT_W, h: DEFAULT_H }
  const initialPos = saved
    ? clampPosition(saved.x, saved.y, initialSize.w, initialSize.h)
    : { x: DEFAULT_X, y: DEFAULT_Y }
  const [position, setPosition] = useState(initialPos)
  const [size, setSize] = useState(initialSize)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState(null) // 'r' | 'b' | 'br'
  const [resizeStart, setResizeStart] = useState(null)

  const persist = useCallback(() => {
    saveState(position, size)
  }, [position, size])

  useEffect(() => {
    if (!dragging && !resizing) persist()
  }, [dragging, resizing, persist])

  useEffect(() => {
    if (!dragging && !resizing) return
    const onMove = (e) => {
      if (dragging) {
        setPosition((prev) => {
          const next = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          }
          return clampPosition(next.x, next.y, size.w, size.h)
        })
      }
      if (resizing) {
        setSize((prev) => {
          let w = prev.w
          let h = prev.h
          if (resizing === 'r' || resizing === 'br') {
            w = resizeStart.w + (e.clientX - resizeStart.x)
          }
          if (resizing === 'b' || resizing === 'br') {
            h = resizeStart.h + (e.clientY - resizeStart.y)
          }
          return clampSize(w, h)
        })
      }
    }
    const onUp = () => {
      setDragging(false)
      setResizing(null)
      setResizeStart(null)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onUp)
    }
  }, [dragging, dragStart, resizing, resizeStart, size.w, size.h, persist])

  const handleTitleBarPointerDown = useCallback((e) => {
    if (e.button !== 0) return
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    setDragging(true)
  }, [position.x, position.y])

  const handleResizePointerDown = useCallback((edge, e) => {
    if (e.button !== 0) return
    e.stopPropagation()
    setResizing(edge)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: size.w,
      h: size.h,
    })
  }, [size.w, size.h])

  return (
    <div
      className="tv-window-wrap"
      style={{
        left: position.x,
        top: position.y,
        width: size.w,
        height: size.h,
      }}
    >
      <div
        className="tv-resize-handle tv-resize-r"
        onPointerDown={(e) => handleResizePointerDown('r', e)}
        aria-hidden
      />
      <div
        className="tv-resize-handle tv-resize-b"
        onPointerDown={(e) => handleResizePointerDown('b', e)}
        aria-hidden
      />
      <div
        className="tv-resize-handle tv-resize-br"
        onPointerDown={(e) => handleResizePointerDown('br', e)}
        aria-hidden
      />
      <LivestreamsWindow
        onClose={() => {
          persist()
          onClose()
        }}
        onTitleBarPointerDown={handleTitleBarPointerDown}
      />
    </div>
  )
}
