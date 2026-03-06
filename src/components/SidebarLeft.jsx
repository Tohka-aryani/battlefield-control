import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import StocksWindow from './StocksWindow'
import TvFloatingWindow from './TvFloatingWindow'
import PredictionsWindow from './PredictionsWindow'
import SocmedWindow from './SocmedWindow'
import DefconWindow from './DefconWindow'

export default function SidebarLeft() {
  const [stocksOpen, setStocksOpen] = useState(false)
  const [tvOpen, setTvOpen] = useState(false)
  const [predictionsOpen, setPredictionsOpen] = useState(false)
  const [socmedOpen, setSocmedOpen] = useState(false)
  const [defconOpen, setDefconOpen] = useState(false)
  const stocksPanelRef = useRef(null)
  const predictionsPanelRef = useRef(null)
  useEffect(() => {
    if (!stocksOpen) return
    const onPointerDown = (e) => {
      if (stocksPanelRef.current?.contains(e.target)) return
      setStocksOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setStocksOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [stocksOpen])

  useEffect(() => {
    if (!tvOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setTvOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [tvOpen])

  useEffect(() => {
    if (!predictionsOpen) return
    const onPointerDown = (e) => {
      if (predictionsPanelRef.current?.contains(e.target)) return
      setPredictionsOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setPredictionsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [predictionsOpen])

  useEffect(() => {
    if (!socmedOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSocmedOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [socmedOpen])

  const stocksPortal = stocksOpen && createPortal(
    <div className="stocks-overlay" role="presentation">
      <div ref={stocksPanelRef} className="stocks-window-wrap">
        <StocksWindow
          onClose={() => setStocksOpen(false)}
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>,
    document.body
  )

  const tvPortal = tvOpen && createPortal(
    <div className="tv-overlay" role="presentation">
      <TvFloatingWindow onClose={() => setTvOpen(false)} />
    </div>,
    document.body
  )

  const predictionsPortal = predictionsOpen && createPortal(
    <div className="predictions-overlay" role="presentation">
      <div ref={predictionsPanelRef} className="predictions-window-wrap">
        <PredictionsWindow onClose={() => setPredictionsOpen(false)} />
      </div>
    </div>,
    document.body
  )

  const socmedPortal = socmedOpen && createPortal(
    <SocmedWindow onClose={() => setSocmedOpen(false)} />,
    document.body
  )

  const defconPortal = defconOpen && createPortal(
    <DefconWindow onClose={() => setDefconOpen(false)} />,
    document.body
  )

  return (
    <aside className="sidebar sidebar-left">
      <button type="button" className="icon-btn" title="Search" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
      <button
        type="button"
        className="icon-btn"
        title="Stocks"
        aria-label="Stocks"
        aria-expanded={stocksOpen}
        onClick={() => setStocksOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      </button>
      <button
        type="button"
        className="icon-btn"
        title="Live streams"
        aria-label="Live streams"
        aria-expanded={tvOpen}
        onClick={() => setTvOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      </button>
      <button
        type="button"
        className="icon-btn"
        title="Predictions"
        aria-label="Predictions"
        aria-expanded={predictionsOpen}
        onClick={() => setPredictionsOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17l5-5 4 4 8-10" />
          <circle cx="18" cy="6" r="2.5" />
        </svg>
      </button>
      <button
        type="button"
        className="icon-btn"
        title="SOCMED"
        aria-label="Social media"
        aria-expanded={socmedOpen}
        onClick={() => setSocmedOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
      <button
        type="button"
        className="icon-btn"
        title="DEFCON"
        aria-label="DEFCON status"
        aria-expanded={defconOpen}
        onClick={() => setDefconOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </button>
      <button type="button" className="icon-btn" title="Grid" aria-label="Grid">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
      <button type="button" className="icon-btn" title="Play" aria-label="Play">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      {stocksPortal}
      {tvPortal}
      {predictionsPortal}
      {socmedPortal}
      {defconPortal}
    </aside>
  )
}
